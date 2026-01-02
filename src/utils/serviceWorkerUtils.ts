// Service Worker Safe Utilities
// Re-export shared utilities for service worker context

export {
  getStorage,
  setStorage,
  isGitLabIssuesPage,
  checkDisabledGitLabSites,
  toggleDisabledGitLabSites,
} from './shared';
