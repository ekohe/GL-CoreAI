/**
 * Multi-Issue Link Parser
 *
 * Parses various GitLab link formats including:
 * - Full issue URLs: https://gitlab.com/group/project/-/issues/123
 * - Issue numbers: #123 or just 123
 * - Wiki page URLs: https://gitlab.com/group/project/-/wikis/page-name
 * - Task/work item URLs: https://gitlab.com/group/project/-/work_items/123
 * - Cross-project references: group/project#123
 * - Merge request URLs: https://gitlab.com/group/project/-/merge_requests/123
 */

// Supported GitLab resource types
export type GitLabResourceType = 'issue' | 'merge_request' | 'wiki' | 'work_item' | 'epic' | 'unknown';

// Parsed resource reference
export interface ParsedGitLabResource {
  type: GitLabResourceType;
  projectPath: string | null;  // e.g., "group/project" or null for current project
  resourceId: number | null;   // e.g., 123 for issues
  resourceSlug: string | null; // e.g., "page-name" for wiki pages
  originalInput: string;       // The original input text
  fullUrl: string | null;      // Full URL if available
  isValid: boolean;
}

// URL patterns for different GitLab resources
const GITLAB_URL_PATTERNS = {
  // Full issue URL: https://gitlab.com/group/project/-/issues/123
  issue: /https?:\/\/([^\/]+)\/(.+?)\/-\/issues\/(\d+)/,

  // Work item URL: https://gitlab.com/group/project/-/work_items/123
  workItem: /https?:\/\/([^\/]+)\/(.+?)\/-\/work_items\/(\d+)/,

  // Merge request URL: https://gitlab.com/group/project/-/merge_requests/123
  mergeRequest: /https?:\/\/([^\/]+)\/(.+?)\/-\/merge_requests\/(\d+)/,

  // Wiki page URL: https://gitlab.com/group/project/-/wikis/page-name
  wiki: /https?:\/\/([^\/]+)\/(.+?)\/-\/wikis\/([^?#]+)/,

  // Epic URL: https://gitlab.com/groups/group/-/epics/123
  epic: /https?:\/\/([^\/]+)\/groups\/(.+?)\/-\/epics\/(\d+)/,
};

// Reference patterns (text-based)
const REFERENCE_PATTERNS = {
  // Cross-project issue reference: group/project#123
  crossProjectIssue: /^([a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)+)#(\d+)$/,

  // Local issue reference: #123
  localIssue: /^#(\d+)$/,

  // Plain number: 123
  plainNumber: /^(\d+)$/,
};

/**
 * Parse a single input string and extract GitLab resource information
 */
export function parseGitLabResource(input: string): ParsedGitLabResource {
  const trimmedInput = input.trim();

  // Default result
  const result: ParsedGitLabResource = {
    type: 'unknown',
    projectPath: null,
    resourceId: null,
    resourceSlug: null,
    originalInput: trimmedInput,
    fullUrl: null,
    isValid: false,
  };

  if (!trimmedInput) {
    return result;
  }

  // Try URL patterns first
  if (trimmedInput.startsWith('http')) {
    // Issue URL
    const issueMatch = trimmedInput.match(GITLAB_URL_PATTERNS.issue);
    if (issueMatch) {
      return {
        type: 'issue',
        projectPath: issueMatch[2],
        resourceId: parseInt(issueMatch[3], 10),
        resourceSlug: null,
        originalInput: trimmedInput,
        fullUrl: trimmedInput,
        isValid: true,
      };
    }

    // Work item URL
    const workItemMatch = trimmedInput.match(GITLAB_URL_PATTERNS.workItem);
    if (workItemMatch) {
      return {
        type: 'work_item',
        projectPath: workItemMatch[2],
        resourceId: parseInt(workItemMatch[3], 10),
        resourceSlug: null,
        originalInput: trimmedInput,
        fullUrl: trimmedInput,
        isValid: true,
      };
    }

    // Merge request URL
    const mrMatch = trimmedInput.match(GITLAB_URL_PATTERNS.mergeRequest);
    if (mrMatch) {
      return {
        type: 'merge_request',
        projectPath: mrMatch[2],
        resourceId: parseInt(mrMatch[3], 10),
        resourceSlug: null,
        originalInput: trimmedInput,
        fullUrl: trimmedInput,
        isValid: true,
      };
    }

    // Wiki URL
    const wikiMatch = trimmedInput.match(GITLAB_URL_PATTERNS.wiki);
    if (wikiMatch) {
      return {
        type: 'wiki',
        projectPath: wikiMatch[2],
        resourceId: null,
        resourceSlug: decodeURIComponent(wikiMatch[3]),
        originalInput: trimmedInput,
        fullUrl: trimmedInput,
        isValid: true,
      };
    }

    // Epic URL
    const epicMatch = trimmedInput.match(GITLAB_URL_PATTERNS.epic);
    if (epicMatch) {
      return {
        type: 'epic',
        projectPath: epicMatch[2],
        resourceId: parseInt(epicMatch[3], 10),
        resourceSlug: null,
        originalInput: trimmedInput,
        fullUrl: trimmedInput,
        isValid: true,
      };
    }
  }

  // Try reference patterns
  // Cross-project reference: group/project#123
  const crossProjectMatch = trimmedInput.match(REFERENCE_PATTERNS.crossProjectIssue);
  if (crossProjectMatch) {
    return {
      type: 'issue',
      projectPath: crossProjectMatch[1],
      resourceId: parseInt(crossProjectMatch[2], 10),
      resourceSlug: null,
      originalInput: trimmedInput,
      fullUrl: null,
      isValid: true,
    };
  }

  // Local issue reference: #123
  const localIssueMatch = trimmedInput.match(REFERENCE_PATTERNS.localIssue);
  if (localIssueMatch) {
    return {
      type: 'issue',
      projectPath: null, // Will use current project
      resourceId: parseInt(localIssueMatch[1], 10),
      resourceSlug: null,
      originalInput: trimmedInput,
      fullUrl: null,
      isValid: true,
    };
  }

  // Plain number: 123
  const plainNumberMatch = trimmedInput.match(REFERENCE_PATTERNS.plainNumber);
  if (plainNumberMatch) {
    return {
      type: 'issue',
      projectPath: null, // Will use current project
      resourceId: parseInt(plainNumberMatch[1], 10),
      resourceSlug: null,
      originalInput: trimmedInput,
      fullUrl: null,
      isValid: true,
    };
  }

  return result;
}

/**
 * Parse multiple inputs (comma, space, or newline separated)
 */
export function parseMultipleGitLabResources(input: string): ParsedGitLabResource[] {
  // Split by comma, newline, or multiple spaces
  const items = input
    .split(/[,\n]+/)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  return items.map(parseGitLabResource);
}

/**
 * Extract all issue/resource references from a text block
 * This is useful for detecting references within chat messages
 */
export function extractResourcesFromText(text: string): ParsedGitLabResource[] {
  const resources: ParsedGitLabResource[] = [];

  // Match URLs
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  const urls = text.match(urlRegex) || [];
  urls.forEach(url => {
    const parsed = parseGitLabResource(url);
    if (parsed.isValid) {
      resources.push(parsed);
    }
  });

  // Match cross-project references (group/project#123)
  const crossProjectRegex = /([a-zA-Z0-9._-]+(?:\/[a-zA-Z0-9._-]+)+)#(\d+)/g;
  let crossMatch: RegExpExecArray | null;
  while ((crossMatch = crossProjectRegex.exec(text)) !== null) {
    resources.push({
      type: 'issue',
      projectPath: crossMatch[1],
      resourceId: parseInt(crossMatch[2], 10),
      resourceSlug: null,
      originalInput: crossMatch[0],
      fullUrl: null,
      isValid: true,
    });
  }

  // Match local issue references (#123) but not URLs
  const localRefRegex = /(?<![\/\w])#(\d+)(?!\d)/g;
  let localMatch: RegExpExecArray | null;
  while ((localMatch = localRefRegex.exec(text)) !== null) {
    // Avoid duplicates from URL parsing
    if (!resources.some(r => r.originalInput === localMatch![0])) {
      resources.push({
        type: 'issue',
        projectPath: null,
        resourceId: parseInt(localMatch[1], 10),
        resourceSlug: null,
        originalInput: localMatch[0],
        fullUrl: null,
        isValid: true,
      });
    }
  }

  return resources;
}

/**
 * Get display label for a resource type
 */
export function getResourceTypeLabel(type: GitLabResourceType): string {
  const labels: Record<GitLabResourceType, string> = {
    issue: 'Issue',
    merge_request: 'Merge Request',
    wiki: 'Wiki Page',
    work_item: 'Task',
    epic: 'Epic',
    unknown: 'Unknown',
  };
  return labels[type];
}

/**
 * Get icon for a resource type
 */
export function getResourceTypeIcon(type: GitLabResourceType): string {
  const icons: Record<GitLabResourceType, string> = {
    issue: '🔵',
    merge_request: '🟣',
    wiki: '📄',
    work_item: '✅',
    epic: '🎯',
    unknown: '❓',
  };
  return icons[type];
}

/**
 * Format a parsed resource for display
 */
export function formatResourceForDisplay(resource: ParsedGitLabResource): string {
  const icon = getResourceTypeIcon(resource.type);
  const label = getResourceTypeLabel(resource.type);

  if (resource.resourceId) {
    const project = resource.projectPath ? `${resource.projectPath}` : 'Current project';
    return `${icon} ${label} #${resource.resourceId} (${project})`;
  }

  if (resource.resourceSlug) {
    const project = resource.projectPath ? `${resource.projectPath}` : 'Current project';
    return `${icon} ${label}: ${resource.resourceSlug} (${project})`;
  }

  return `${icon} ${label}`;
}
