/* eslint-disable no-useless-escape */
import { fetchFromGitLabAPI, getGitLabWebURL, getStorage, setStorage } from ".";

const URLs = {
  project: `/api/v4/projects/`,
  currentUser: `/api/v4/user`,
};

// GitLab User type
export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  email?: string;
  avatar_url?: string;
  web_url?: string;
  state?: string;
  is_admin?: boolean;
  created_at?: string;
}

// Cache key for storing user info
const GITLAB_USER_CACHE_KEY = "GASGitLabCurrentUser";
const GITLAB_USER_CACHE_EXPIRY_KEY = "GASGitLabUserCacheExpiry";
// Cache for 24 hours
const USER_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Fetch the current logged-in GitLab user
 */
async function fetchCurrentUser(): Promise<GitLabUser | null> {
  try {
    const user = await fetchFromGitLabAPI(URLs.currentUser);
    return user as GitLabUser;
  } catch (error) {
    console.error("Failed to fetch current GitLab user:", error);
    return null;
  }
}

/**
 * Get current user from cache or fetch from API
 */
async function getCurrentUser(): Promise<GitLabUser | null> {
  return new Promise((resolve) => {
    getStorage([GITLAB_USER_CACHE_KEY, GITLAB_USER_CACHE_EXPIRY_KEY], async (result) => {
      const cachedUser = result[GITLAB_USER_CACHE_KEY];
      const cacheExpiry = result[GITLAB_USER_CACHE_EXPIRY_KEY];

      // Check if cache is valid
      if (cachedUser && cacheExpiry && Date.now() < cacheExpiry) {
        try {
          const user = typeof cachedUser === 'string' ? JSON.parse(cachedUser) : cachedUser;
          resolve(user as GitLabUser);
          return;
        } catch {
          // Invalid cache, fetch fresh
        }
      }

      // Fetch fresh user data
      const user = await fetchCurrentUser();
      if (user) {
        // Cache the user
        const cacheData: Record<string, any> = {};
        cacheData[GITLAB_USER_CACHE_KEY] = JSON.stringify(user);
        cacheData[GITLAB_USER_CACHE_EXPIRY_KEY] = Date.now() + USER_CACHE_DURATION_MS;
        setStorage(cacheData);
      }
      resolve(user);
    });
  });
}

/**
 * Clear the cached user (useful when switching accounts or on logout)
 */
async function clearCurrentUserCache(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.remove([GITLAB_USER_CACHE_KEY, GITLAB_USER_CACHE_EXPIRY_KEY], () => {
      resolve();
    });
  });
}

function extractProjectPathAndIssueIdOrMergeRequestId(url: string) {
  const issuePattern =
    /https?:\/\/[^/]+\/(.+?)(?:\/-)?\/((issues|work_items)\/(\d+))/;
  const issueMatch = url.match(issuePattern);

  const mergeRequestPattern =
    /https?:\/\/[^/]+\/(.+?)(?:\/-)?\/((merge_requests)\/(\d+))/;
  const mergeRequestMatch = url.match(mergeRequestPattern);

  if (issueMatch) {
    const projectPath = issueMatch[1].replace(/\/-$/, "");
    const issueId = parseInt(issueMatch[4], 10);

    return { projectPath, issueId, mergeRequestId: undefined };
  } else if (mergeRequestMatch) {
    const projectPath = mergeRequestMatch[1].replace(/\/-$/, "");
    const mergeRequestId = parseInt(mergeRequestMatch[4], 10);

    return { projectPath, issueId: undefined, mergeRequestId };
  } else {
    return {
      projectPath: undefined,
      issueId: undefined,
      mergeRequestId: undefined,
    };
  }
}

async function getProjectIdFromPath(url: string) {
  const { projectPath } = extractProjectPathAndIssueIdOrMergeRequestId(url);
  if (projectPath === undefined) {
    return undefined;
  }

  const encodedPath = encodeURIComponent(projectPath);
  const searchUrl = `${URLs.project}${encodedPath}`;

  try {
    const project = await fetchFromGitLabAPI(searchUrl);
    return project.id;
  } catch (error) {
    return undefined;
  }
}

// Fetch the issue details for the project
async function fetchIssueDetails(
  projectId: string,
  issueId: number | undefined
) {
  return (await fetchFromGitLabAPI(
    `${URLs.project}${projectId}/issues/${issueId}`
  )) as IssueType;
}

async function fetchIssueDiscussions(
  projectId: number | string,
  issueId: number | undefined
) {
  let discussions: any = [];
  let page = 1;
  let perPage = 100; // Adjust as needed, GitLab's default is usually 20

  while (true) {
    const discussionsUrl = `${URLs.project}${projectId}/issues/${issueId}/discussions?order_by=created_at&sort=asc&page=${page}&per_page=${perPage}`;
    const pageDiscussions = await fetchFromGitLabAPI(discussionsUrl);

    const formattedDiscussions = pageDiscussions.map((discussion: any) => ({
      id: discussion.id,
      notes: discussion.notes.map((note: any) => ({
        // id: note.id,
        body: note.body,
        author: {
          // id: note.author.id,
          name: note.author.name,
          username: note.author.username,
        },
        created_at: note.created_at,
        updated_at: note.updated_at,
      })),
    }));

    discussions = discussions.concat(formattedDiscussions);

    if (pageDiscussions.length < perPage) {
      break; // No more pages
    }

    page++;
  }

  return discussions;
}

async function fetchMergeRequests(
  projectId: number,
  issueId: number | undefined
) {
  const mergeRequestsUrl = `${URLs.project}${projectId}/merge_requests?state=all&scope=all&search=${issueId}&order_by=created_at`;
  const merge_requests = await fetchFromGitLabAPI(mergeRequestsUrl);
  return merge_requests;
}

// MergeRequest type
export interface MergeRequestData {
  id: number;
  iid: number;
  title: string;
  description?: string;
  state: string;
  source_branch: string;
  target_branch: string;
  author?: {
    id: number;
    username: string;
    name: string;
    avatar_url?: string;
    web_url?: string;
  };
  assignee?: {
    id: number;
    username: string;
    name: string;
    avatar_url?: string;
    web_url?: string;
  };
  assignees?: Array<{
    id: number;
    username: string;
    name: string;
    avatar_url?: string;
    web_url?: string;
  }>;
  reviewers?: Array<{
    id: number;
    username: string;
    name: string;
    avatar_url?: string;
    web_url?: string;
  }>;
  labels?: string[];
  milestone?: {
    id: number;
    title: string;
  };
  draft?: boolean;
  work_in_progress?: boolean;
  merge_status?: string;
  detailed_merge_status?: string;
  has_conflicts?: boolean;
  user_notes_count?: number;
  changes_count?: string;
  created_at?: string;
  updated_at?: string;
  merged_at?: string;
  closed_at?: string;
  merged_by?: {
    name: string;
    username: string;
  };
  web_url?: string;
}

async function fetchMergeRequestDetails(
  projectId: number | string,
  mergeRequestId: number | undefined
): Promise<MergeRequestData | null> {
  if (!mergeRequestId) return null;

  try {
    const mrUrl = `${URLs.project}${projectId}/merge_requests/${mergeRequestId}`;
    const response = await fetchFromGitLabAPI(mrUrl);
    return response as MergeRequestData;
  } catch (error) {
    console.error("Failed to fetch MR details:", error);
    return null;
  }
}

async function fetchMergeRequestChanges(
  projectId: number,
  mergeRequestId: number | undefined
) {
  const mergeRequestsUrl = `${URLs.project}${projectId}/merge_requests/${mergeRequestId}/changes`;
  const response = await fetchFromGitLabAPI(mergeRequestsUrl);

  // Group diffs by file path
  const groupedChanges = response.changes.reduce((acc: any, change: any) => {
    if (!acc[change.old_path]) {
      acc[change.old_path] = [];
    }
    acc[change.old_path].push(change.diff);
    return acc;
  }, {});

  const changes = Object.keys(groupedChanges).map((filePath) => {
    return {
      fileName: filePath,
      changes: groupedChanges[filePath].join("\n"),
      extension: filePath.split(".").pop() || "",
    };
  });

  return changes;
}

async function fetchCommits(projectId: number, mergeRequestId: number) {
  const commitsUrl = `${URLs.project}${projectId}/merge_requests/${mergeRequestId}/commits`;
  const commits = await fetchFromGitLabAPI(commitsUrl);
  return commits;
}

async function fetchLastCommitDetails(projectId: number, issueId: number) {
  const mergeRequests = await fetchMergeRequests(projectId, issueId);
  if (mergeRequests.length === 0) return null;

  const latestMergeRequest = mergeRequests[mergeRequests.length - 1];
  const commits = await fetchCommits(projectId, latestMergeRequest.iid);
  if (commits.length === 0) return null;

  return {
    title: commits[0].title,
    web_url: commits[0].web_url,
  };
}

async function fetchLinkedIssues(projectId: number, issueId: number) {
  const relatedIssuesUrl = `${URLs.project}${projectId}/issues/${issueId}/links?order_by=created_at`;
  const relatedIssues = await fetchFromGitLabAPI(relatedIssuesUrl);
  return relatedIssues.length;
}

async function fetchLastMergeDetails(
  projectId: number,
  issueId: number | undefined
) {
  const mergeRequests = await fetchMergeRequests(projectId, issueId);
  if (mergeRequests.length === 0) return null;

  const latestMergeRequest = mergeRequests[0];
  return {
    title: latestMergeRequest.title,
    web_url: latestMergeRequest.web_url,
    target_branch: latestMergeRequest.target_branch,
  };
}

async function fetchLatestCommentURL(
  projectPath: string | undefined,
  projectId: number | string,
  issueId: number | undefined
) {
  const discussions = await fetchIssueDiscussions(projectId, issueId);
  if (discussions.length === 0) return undefined;

  let latestNote: any = undefined;
  discussions.forEach((discussion: any) => {
    discussion.notes.forEach((note: any) => {
      if (
        !latestNote ||
        new Date(note.created_at) > new Date(latestNote.created_at)
      ) {
        latestNote = note;
      }
    });
  });
  const gitLabWebURL = await getGitLabWebURL();
  if (!gitLabWebURL) return undefined;
  if (!latestNote?.id) return undefined;

  return `${gitLabWebURL}/${projectPath}/-/issues/${issueId}#note_${latestNote.id}`;
}

/**
 * Post a comment/note to an issue
 */
async function postIssueComment(
  projectId: number | string | undefined,
  issueId: number | undefined,
  body: string
): Promise<{ success: boolean; noteUrl?: string; error?: string }> {
  if (!projectId || !issueId) {
    return { success: false, error: "Missing project or issue ID" };
  }

  try {
    const gitLabWebURL = await getGitLabWebURL();
    if (!gitLabWebURL) {
      return { success: false, error: "Could not determine GitLab URL" };
    }

    const response = await fetch(
      `${gitLabWebURL}/api/v4/projects/${projectId}/issues/${issueId}/notes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ body }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Failed to post comment: ${errorText}` };
    }

    const note = await response.json();

    // Get the project path for the URL
    const projectResponse = await fetch(
      `${gitLabWebURL}/api/v4/projects/${projectId}`,
      { credentials: "include" }
    );

    let noteUrl: string | undefined;
    if (projectResponse.ok) {
      const project = await projectResponse.json();
      noteUrl = `${gitLabWebURL}/${project.path_with_namespace}/-/issues/${issueId}#note_${note.id}`;
    }

    return { success: true, noteUrl };
  } catch (error: any) {
    console.error("Error posting issue comment:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

export {
  getProjectIdFromPath,
  extractProjectPathAndIssueIdOrMergeRequestId,
  fetchIssueDetails,
  fetchLinkedIssues,
  fetchIssueDiscussions,
  fetchMergeRequests,
  fetchMergeRequestDetails,
  fetchMergeRequestChanges,
  fetchLastCommitDetails,
  fetchCommits,
  fetchLastMergeDetails,
  fetchLatestCommentURL,
  postIssueComment,
  // Current user functions
  fetchCurrentUser,
  getCurrentUser,
  clearCurrentUserCache,
};
