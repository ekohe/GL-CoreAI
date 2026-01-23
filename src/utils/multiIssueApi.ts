/**
 * Multi-Issue API
 *
 * Functions for fetching GitLab resources (issues, MRs, wikis, etc.) across multiple projects.
 * Supports batch fetching and caching for efficient data retrieval.
 */

import { fetchFromGitLabAPI, getGitLabWebURL } from ".";
import { ParsedGitLabResource, GitLabResourceType } from "./multiIssueLinkParser";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface FetchedResource {
  parsed: ParsedGitLabResource;
  data: any;
  discussions?: any[];
  error?: string;
  isLoading?: boolean;
}

export interface MultiFetchResult {
  resources: FetchedResource[];
  hasErrors: boolean;
  totalFetched: number;
}

// API endpoints for different resource types
const API_ENDPOINTS = {
  issue: (projectId: string, resourceId: number) =>
    `/api/v4/projects/${encodeURIComponent(projectId)}/issues/${resourceId}`,

  work_item: (projectId: string, resourceId: number) =>
    `/api/v4/projects/${encodeURIComponent(projectId)}/issues/${resourceId}`,

  merge_request: (projectId: string, resourceId: number) =>
    `/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests/${resourceId}`,

  wiki: (projectId: string, slug: string) =>
    `/api/v4/projects/${encodeURIComponent(projectId)}/wikis/${encodeURIComponent(slug)}`,

  epic: (groupPath: string, resourceId: number) =>
    `/api/v4/groups/${encodeURIComponent(groupPath)}/epics/${resourceId}`,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get project ID from project path
 */
async function getProjectIdFromPath(projectPath: string): Promise<number | null> {
  try {
    const project = await fetchFromGitLabAPI(`/api/v4/projects/${encodeURIComponent(projectPath)}`);
    return project?.id || null;
  } catch (error) {
    console.error(`Failed to get project ID for path: ${projectPath}`, error);
    return null;
  }
}

/**
 * Get current project path from the current page URL
 */
export async function getCurrentProjectPath(): Promise<string | null> {
  try {
    // Get the current tab URL via chrome.tabs API
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = tab?.url;

    if (!currentUrl) return null;

    // Match GitLab project URLs with nested groups support
    // e.g., https://gitlab.com/group/subgroup/project/-/issues/123
    // or https://gitlab.com/group/project/-/merge_requests/456
    const projectMatch = currentUrl.match(/https?:\/\/[^\/]+\/(.+?)\/-\//);
    if (projectMatch) {
      return projectMatch[1];
    }

    // Fallback: try to match simple group/project pattern
    const simpleMatch = currentUrl.match(/https?:\/\/[^\/]+\/([^\/]+(?:\/[^\/]+)+?)(?:\/|$)/);
    if (simpleMatch) {
      // Filter out special GitLab paths
      const path = simpleMatch[1];
      if (!path.startsWith('-') && !['explore', 'admin', 'dashboard', 'users', 'groups'].includes(path.split('/')[0])) {
        return path;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to get current project path:', error);
    return null;
  }
}

/**
 * Fetch discussions for an issue
 */
async function fetchIssueDiscussions(projectPath: string, issueId: number): Promise<any[]> {
  try {
    const discussions: any[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `/api/v4/projects/${encodeURIComponent(projectPath)}/issues/${issueId}/discussions?page=${page}&per_page=${perPage}`;
      const pageDiscussions = await fetchFromGitLabAPI(url);

      const formattedDiscussions = pageDiscussions.map((discussion: any) => ({
        id: discussion.id,
        notes: discussion.notes.map((note: any) => ({
          body: note.body,
          author: {
            name: note.author.name,
            username: note.author.username,
          },
          created_at: note.created_at,
        })),
      }));

      discussions.push(...formattedDiscussions);

      if (pageDiscussions.length < perPage) break;
      page++;
    }

    return discussions;
  } catch (error) {
    console.error(`Failed to fetch discussions for issue ${issueId}`, error);
    return [];
  }
}

/**
 * Fetch MR discussions
 */
async function fetchMRDiscussions(projectPath: string, mrId: number): Promise<any[]> {
  try {
    const url = `/api/v4/projects/${encodeURIComponent(projectPath)}/merge_requests/${mrId}/discussions`;
    const discussions = await fetchFromGitLabAPI(url);
    return discussions.map((discussion: any) => ({
      id: discussion.id,
      notes: discussion.notes.map((note: any) => ({
        body: note.body,
        author: {
          name: note.author.name,
          username: note.author.username,
        },
        created_at: note.created_at,
      })),
    }));
  } catch (error) {
    console.error(`Failed to fetch discussions for MR ${mrId}`, error);
    return [];
  }
}

// =============================================================================
// MAIN FETCH FUNCTIONS
// =============================================================================

/**
 * Fetch a single GitLab resource
 */
export async function fetchResource(
  parsed: ParsedGitLabResource,
  currentProjectPath?: string | null,
  includeDiscussions: boolean = true
): Promise<FetchedResource> {
  const result: FetchedResource = {
    parsed,
    data: null,
  };

  if (!parsed.isValid) {
    result.error = "Invalid resource reference";
    return result;
  }

  // Resolve project path
  const projectPath = parsed.projectPath || currentProjectPath;

  if (!projectPath && parsed.type !== 'epic') {
    result.error = "Could not determine project path. Make sure you're on a GitLab project page.";
    return result;
  }

  try {
    switch (parsed.type) {
      case 'issue':
      case 'work_item':
        if (!projectPath || !parsed.resourceId) {
          result.error = "Missing project path or issue ID";
          break;
        }
        result.data = await fetchFromGitLabAPI(
          API_ENDPOINTS.issue(projectPath, parsed.resourceId)
        );
        if (includeDiscussions && result.data) {
          result.discussions = await fetchIssueDiscussions(projectPath, parsed.resourceId);
        }
        break;

      case 'merge_request':
        if (!projectPath || !parsed.resourceId) {
          result.error = "Missing project path or MR ID";
          break;
        }
        result.data = await fetchFromGitLabAPI(
          API_ENDPOINTS.merge_request(projectPath, parsed.resourceId)
        );
        if (includeDiscussions && result.data) {
          result.discussions = await fetchMRDiscussions(projectPath, parsed.resourceId);
        }
        break;

      case 'wiki':
        if (!projectPath || !parsed.resourceSlug) {
          result.error = "Missing project path or wiki page slug";
          break;
        }
        result.data = await fetchFromGitLabAPI(
          API_ENDPOINTS.wiki(projectPath, parsed.resourceSlug)
        );
        break;

      case 'epic':
        if (!parsed.projectPath || !parsed.resourceId) {
          result.error = "Missing group path or epic ID";
          break;
        }
        result.data = await fetchFromGitLabAPI(
          API_ENDPOINTS.epic(parsed.projectPath, parsed.resourceId)
        );
        break;

      default:
        result.error = `Unsupported resource type: ${parsed.type}`;
    }
  } catch (error: any) {
    result.error = error.message || "Failed to fetch resource";
  }

  return result;
}

/**
 * Fetch multiple GitLab resources in parallel
 */
export async function fetchMultipleResources(
  parsedResources: ParsedGitLabResource[],
  currentProjectPath?: string | null,
  includeDiscussions: boolean = true
): Promise<MultiFetchResult> {
  // Resolve current project path if not provided
  const resolvedProjectPath = currentProjectPath || await getCurrentProjectPath();

  // Fetch all resources in parallel
  const fetchPromises = parsedResources.map(parsed =>
    fetchResource(parsed, resolvedProjectPath, includeDiscussions)
  );

  const resources = await Promise.all(fetchPromises);

  return {
    resources,
    hasErrors: resources.some(r => !!r.error),
    totalFetched: resources.filter(r => r.data !== null).length,
  };
}

/**
 * Fetch resources with progress callback for UI updates
 */
export async function fetchResourcesWithProgress(
  parsedResources: ParsedGitLabResource[],
  onProgress: (current: number, total: number, resource: FetchedResource) => void,
  currentProjectPath?: string | null,
  includeDiscussions: boolean = true
): Promise<MultiFetchResult> {
  const resolvedProjectPath = currentProjectPath || await getCurrentProjectPath();
  const resources: FetchedResource[] = [];
  const total = parsedResources.length;

  for (let i = 0; i < parsedResources.length; i++) {
    const parsed = parsedResources[i];
    const result = await fetchResource(parsed, resolvedProjectPath, includeDiscussions);
    resources.push(result);
    onProgress(i + 1, total, result);
  }

  return {
    resources,
    hasErrors: resources.some(r => !!r.error),
    totalFetched: resources.filter(r => r.data !== null).length,
  };
}

// =============================================================================
// FORMATTING FUNCTIONS
// =============================================================================

/**
 * Format fetched resources for AI context
 */
export function formatResourcesForAI(resources: FetchedResource[]): string {
  const sections: string[] = [];

  resources.forEach((resource, index) => {
    if (!resource.data) return;

    const { parsed, data, discussions } = resource;
    const section: string[] = [];

    section.push(`\n--- RESOURCE ${index + 1}: ${parsed.type.toUpperCase()} ---`);

    switch (parsed.type) {
      case 'issue':
      case 'work_item':
        section.push(`Title: ${data.title}`);
        section.push(`Project: ${data.references?.full || parsed.projectPath || 'Unknown'}`);
        section.push(`State: ${data.state}`);
        section.push(`Author: ${data.author?.name || 'Unknown'}`);
        section.push(`Assignee: ${data.assignee?.name || 'Unassigned'}`);
        section.push(`Labels: ${data.labels?.join(', ') || 'None'}`);
        section.push(`Created: ${data.created_at}`);
        section.push(`URL: ${data.web_url}`);
        section.push(`\nDescription:\n${data.description || 'No description'}`);

        if (discussions && discussions.length > 0) {
          section.push(`\nDiscussions (${discussions.length} threads):`);
          discussions.slice(0, 10).forEach(discussion => {
            discussion.notes?.forEach((note: any) => {
              section.push(`- ${note.author?.name}: ${note.body.substring(0, 500)}${note.body.length > 500 ? '...' : ''}`);
            });
          });
        }
        break;

      case 'merge_request':
        section.push(`Title: ${data.title}`);
        section.push(`Project: ${data.references?.full || parsed.projectPath || 'Unknown'}`);
        section.push(`State: ${data.state}`);
        section.push(`Author: ${data.author?.name || 'Unknown'}`);
        section.push(`Source Branch: ${data.source_branch}`);
        section.push(`Target Branch: ${data.target_branch}`);
        section.push(`Created: ${data.created_at}`);
        section.push(`URL: ${data.web_url}`);
        section.push(`\nDescription:\n${data.description || 'No description'}`);
        break;

      case 'wiki':
        section.push(`Title: ${data.title}`);
        section.push(`Project: ${parsed.projectPath || 'Unknown'}`);
        section.push(`Slug: ${data.slug}`);
        section.push(`\nContent:\n${data.content || 'No content'}`);
        break;

      case 'epic':
        section.push(`Title: ${data.title}`);
        section.push(`Group: ${data.group?.full_path || parsed.projectPath || 'Unknown'}`);
        section.push(`State: ${data.state}`);
        section.push(`Author: ${data.author?.name || 'Unknown'}`);
        section.push(`Created: ${data.created_at}`);
        section.push(`URL: ${data.web_url}`);
        section.push(`\nDescription:\n${data.description || 'No description'}`);
        break;
    }

    sections.push(section.join('\n'));
  });

  return sections.join('\n\n');
}

/**
 * Get a summary line for each resource
 */
export function getResourceSummaryLines(resources: FetchedResource[]): string[] {
  return resources.map((resource, index) => {
    if (!resource.data) {
      return `${index + 1}. ❌ ${resource.parsed.originalInput} - ${resource.error || 'Failed to fetch'}`;
    }

    const { parsed, data } = resource;
    const icon = parsed.type === 'issue' || parsed.type === 'work_item' ? '🔵' :
                 parsed.type === 'merge_request' ? '🟣' :
                 parsed.type === 'wiki' ? '📄' :
                 parsed.type === 'epic' ? '🎯' : '❓';

    return `${index + 1}. ${icon} ${data.title || parsed.resourceSlug || 'Untitled'} (${parsed.type})`;
  });
}
