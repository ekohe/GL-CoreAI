/* eslint-disable no-useless-escape */
import { fetchFromGitLabAPI, getGitLabWebURL } from ".";

const URLs = {
  project: `/api/v4/projects/`,
};

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
    console.log("Error fetching projectPath:", projectPath);
    return undefined;
  }

  const encodedPath = encodeURIComponent(projectPath);
  const searchUrl = `${URLs.project}${encodedPath}`;

  try {
    const project = await fetchFromGitLabAPI(searchUrl);
    return project.id;
  } catch (error) {
    console.log("Error fetching project:", error);
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

export {
  getProjectIdFromPath,
  extractProjectPathAndIssueIdOrMergeRequestId,
  fetchIssueDetails,
  fetchLinkedIssues,
  fetchIssueDiscussions,
  fetchMergeRequests,
  fetchMergeRequestChanges,
  fetchLastCommitDetails,
  fetchCommits,
  fetchLastMergeDetails,
  fetchLatestCommentURL,
};
