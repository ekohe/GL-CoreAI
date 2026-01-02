// Shared utilities that work in both service worker and regular contexts
// These utilities don't access window, document, or other browser-only APIs

interface PlainObjectType {
  [key: string]: any;
}

const getStorage = (
  keys: string | string[] | PlainObjectType,
  callback: (v: any) => any
) => {
  if (chrome.storage) {
    chrome.storage.sync.get(keys, (result: any) => callback(result));
  } else {
    callback(keys);
  }
};

const setStorage = (obj: PlainObjectType, callback?: () => any) => {
  if (chrome.storage) {
    chrome.storage.sync.set(obj, callback ?? (() => {}));
  } else {
    callback?.();
  }
};

const isGitLabIssuesPage = (url?: string) => {
  if (!url) {
    return false;
  }

  // Check for GitLab issue, work item, or merge request pages
  const regexp = new RegExp("/-/issues/\\d+|https://gitlab\\.|/-/work_items/\\d+|/-/merge_requests/\\d+");
  return regexp.test(url);
};

const checkDisabledGitLabSites = (
  url: string,
  cb: (result: boolean, domain: string, sites: string[]) => any
) => {
  const { host: domain } = new URL(url as string);
  getStorage({ disabled_gitlab_sites: [] }, ({ disabled_gitlab_sites }) => {
    const result = disabled_gitlab_sites.includes(domain);
    cb(result, domain, disabled_gitlab_sites);
  });
};

const toggleDisabledGitLabSites = (
  url: string,
  cb?: (isDisabled: boolean) => any
) => {
  checkDisabledGitLabSites(url, (isDisabled, domain, sites) => {
    if (isDisabled) {
      sites = sites.filter((site) => site !== domain);
    } else {
      sites.push(domain);
    }
    setStorage({ disabled_gitlab_sites: sites }, () => cb?.(!isDisabled));
  });
};

export type { PlainObjectType };
export {
  getStorage,
  setStorage,
  isGitLabIssuesPage,
  checkDisabledGitLabSites,
  toggleDisabledGitLabSites,
};
