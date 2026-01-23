/**
 * QueryRouter - Analyzes user input to detect and fetch external resources
 *
 * This module provides intelligent query routing that:
 * 1. Detects resource references (issue URLs, #123, cross-project refs) in user messages
 * 2. Determines if external resources need to be fetched
 * 3. Fetches and enriches the context with external resource data
 * 4. Returns enriched context for AI processing
 */

import {
  extractResourcesFromText,
  ParsedGitLabResource,
  getResourceTypeLabel,
} from "./multiIssueLinkParser";
import {
  fetchResource,
  FetchedResource,
  formatResourcesForAI,
  getResourceSummaryLines,
} from "./multiIssueApi";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface QueryAnalysis {
  originalQuery: string;
  hasExternalResources: boolean;
  detectedResources: ParsedGitLabResource[];
  enrichedQuery?: string;
}

export interface EnrichedContext {
  fetchedResources: FetchedResource[];
  resourcesContent: string;
  resourceSummaries: string[];
  hasErrors: boolean;
}

export interface RouterResult {
  analysis: QueryAnalysis;
  enrichedContext: EnrichedContext | null;
  shouldIncludeContext: boolean;
}

// =============================================================================
// QUERY ANALYSIS
// =============================================================================

/**
 * Analyze a user query to detect external resource references
 */
export function analyzeQuery(query: string): QueryAnalysis {
  const detectedResources = extractResourcesFromText(query);

  return {
    originalQuery: query,
    hasExternalResources: detectedResources.length > 0,
    detectedResources,
  };
}

/**
 * Check if a query is asking about external resources
 * (not just mentioning them in passing)
 */
export function isQueryAboutExternalResources(query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Keywords that suggest the user wants to analyze external resources
  const analysisKeywords = [
    "summarize",
    "summary",
    "compare",
    "comparison",
    "analyze",
    "analysis",
    "look at",
    "check",
    "review",
    "what about",
    "tell me about",
    "explain",
    "describe",
    "status of",
    "progress on",
    "update on",
    "related to",
    "connection",
    "dependency",
    "dependencies",
    "blockers",
    "blocking",
    "blocked by",
  ];

  // Check if query contains analysis keywords
  const hasAnalysisIntent = analysisKeywords.some((keyword) =>
    lowerQuery.includes(keyword)
  );

  // Check if query has resource references
  const hasResources = extractResourcesFromText(query).length > 0;

  return hasResources && hasAnalysisIntent;
}

// =============================================================================
// RESOURCE FETCHING
// =============================================================================

/**
 * Fetch all detected resources and return enriched context
 */
export async function fetchDetectedResources(
  resources: ParsedGitLabResource[],
  currentProjectPath?: string | null,
  onProgress?: (current: number, total: number, resource: ParsedGitLabResource) => void
): Promise<EnrichedContext> {
  if (resources.length === 0) {
    return {
      fetchedResources: [],
      resourcesContent: "",
      resourceSummaries: [],
      hasErrors: false,
    };
  }

  const fetchedResources: FetchedResource[] = [];
  const total = resources.length;

  for (let i = 0; i < resources.length; i++) {
    const parsed = resources[i];
    onProgress?.(i + 1, total, parsed);

    const result = await fetchResource(parsed, currentProjectPath, true);
    fetchedResources.push(result);
  }

  const validResources = fetchedResources.filter((r) => r.data !== null);

  return {
    fetchedResources,
    resourcesContent: formatResourcesForAI(validResources),
    resourceSummaries: getResourceSummaryLines(fetchedResources),
    hasErrors: fetchedResources.some((r) => !!r.error),
  };
}

// =============================================================================
// MAIN ROUTER
// =============================================================================

/**
 * Route a query through analysis and optional resource fetching
 *
 * @param query - The user's input query
 * @param currentProjectPath - Current project path for relative references
 * @param onFetchProgress - Optional callback for fetch progress updates
 * @returns RouterResult with analysis and optionally enriched context
 */
export async function routeQuery(
  query: string,
  currentProjectPath?: string | null,
  onFetchProgress?: (current: number, total: number, resource: ParsedGitLabResource) => void
): Promise<RouterResult> {
  // Step 1: Analyze the query
  const analysis = analyzeQuery(query);

  // Step 2: If no external resources detected, return early
  if (!analysis.hasExternalResources) {
    return {
      analysis,
      enrichedContext: null,
      shouldIncludeContext: false,
    };
  }

  // Step 3: Fetch the detected resources
  const enrichedContext = await fetchDetectedResources(
    analysis.detectedResources,
    currentProjectPath,
    onFetchProgress
  );

  // Step 4: Determine if context should be included
  // Include if we successfully fetched at least one resource
  const successfulFetches = enrichedContext.fetchedResources.filter((r) => r.data !== null);
  const shouldIncludeContext = successfulFetches.length > 0;

  return {
    analysis,
    enrichedContext,
    shouldIncludeContext,
  };
}

// =============================================================================
// CONTEXT BUILDING HELPERS
// =============================================================================

/**
 * Build a context summary message for the user
 * (shown while fetching resources)
 */
export function buildFetchingMessage(resources: ParsedGitLabResource[]): string {
  if (resources.length === 1) {
    const r = resources[0];
    const label = getResourceTypeLabel(r.type);
    const id = r.resourceId ? `#${r.resourceId}` : r.resourceSlug || "";
    return `Fetching ${label} ${id}...`;
  }

  return `Fetching ${resources.length} resources...`;
}

/**
 * Build enriched system context with fetched resources
 */
export function buildEnrichedSystemContext(
  baseContext: string,
  enrichedContext: EnrichedContext
): string {
  if (
    !enrichedContext.resourcesContent ||
    enrichedContext.fetchedResources.length === 0
  ) {
    return baseContext;
  }

  const resourcesSection = `

ADDITIONAL RESOURCES REFERENCED BY USER:
========================================
${enrichedContext.resourceSummaries.join("\n")}

DETAILED RESOURCE DATA:
${enrichedContext.resourcesContent}

NOTE: The user has referenced the above resources in their query. Use this information to provide a comprehensive response that considers all referenced resources.
`;

  return `${baseContext}${resourcesSection}`;
}

/**
 * Format a status message about fetched resources with details
 */
export function formatResourceStatusMessage(
  enrichedContext: EnrichedContext
): string | null {
  const { fetchedResources } = enrichedContext;
  const successful = fetchedResources.filter((r) => r.data !== null);
  const failed = fetchedResources.filter((r) => r.error);

  if (fetchedResources.length === 0) {
    return null;
  }

  return null; // We'll use the detailed version instead
}

/**
 * Format detailed resource cards for display
 */
export function formatResourceCards(
  enrichedContext: EnrichedContext
): Array<{ title: string; type: string; state: string; url: string; error?: string }> {
  const { fetchedResources } = enrichedContext;
  
  return fetchedResources.map((resource) => {
    if (resource.error || !resource.data) {
      return {
        title: resource.parsed.originalInput,
        type: resource.parsed.type,
        state: 'error',
        url: '',
        error: resource.error || 'Failed to fetch',
      };
    }

    const data = resource.data;
    return {
      title: data.title || resource.parsed.resourceSlug || 'Untitled',
      type: resource.parsed.type,
      state: data.state || 'unknown',
      url: data.web_url || '',
    };
  });
}

export default {
  analyzeQuery,
  isQueryAboutExternalResources,
  fetchDetectedResources,
  routeQuery,
  buildFetchingMessage,
  buildEnrichedSystemContext,
  formatResourceStatusMessage,
};
