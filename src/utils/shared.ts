// Shared utilities that work in both service worker and regular contexts
// These utilities don't access window, document, or other browser-only APIs

import {
  encryptSensitiveValues,
  decryptSensitiveValues,
  isSensitiveKey,
  encrypt,
  decrypt,
  isEncrypted,
} from './encryptionManager';

interface PlainObjectType {
  [key: string]: any;
}

/**
 * Get values from Chrome storage with automatic decryption of sensitive keys
 */
const getStorage = (
  keys: string | string[] | PlainObjectType,
  callback: (v: any) => any
) => {
  if (chrome.storage) {
    chrome.storage.sync.get(keys, async (result: any) => {
      try {
        // Decrypt sensitive values before returning
        const decrypted = await decryptSensitiveValues(result);
        callback(decrypted);
      } catch (error) {
        console.error('Error decrypting storage values:', error);
        callback(result); // Fall back to raw values
      }
    });
  } else {
    callback(keys);
  }
};

/**
 * Set values to Chrome storage with automatic encryption of sensitive keys
 */
const setStorage = (obj: PlainObjectType, callback?: () => any) => {
  if (chrome.storage) {
    // Encrypt sensitive values before storing
    encryptSensitiveValues(obj)
      .then((encrypted) => {
        chrome.storage.sync.set(encrypted, callback ?? (() => {}));
      })
      .catch((error) => {
        console.error('Error encrypting storage values:', error);
        // Fall back to storing unencrypted if encryption fails
        chrome.storage.sync.set(obj, callback ?? (() => {}));
      });
  } else {
    callback?.();
  }
};

/**
 * Get a single sensitive value with decryption
 */
const getSecureValue = async (key: string): Promise<string | undefined> => {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], async (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting secure value:', chrome.runtime.lastError);
        resolve(undefined);
        return;
      }

      const value = result[key];
      if (typeof value === 'string' && isSensitiveKey(key) && isEncrypted(value)) {
        try {
          resolve(await decrypt(value));
        } catch {
          resolve(value);
        }
      } else {
        resolve(value);
      }
    });
  });
};

/**
 * Set a single sensitive value with encryption
 */
const setSecureValue = async (key: string, value: string): Promise<void> => {
  return new Promise(async (resolve) => {
    let valueToStore = value;

    if (isSensitiveKey(key) && value && !isEncrypted(value)) {
      try {
        valueToStore = await encrypt(value);
      } catch (error) {
        console.error('Error encrypting value:', error);
      }
    }

    chrome.storage.sync.set({ [key]: valueToStore }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error setting secure value:', chrome.runtime.lastError);
      }
      resolve();
    });
  });
};

/**
 * Remove keys from storage
 */
const removeStorage = (keys: string | string[], callback?: () => void): void => {
  if (chrome.storage) {
    chrome.storage.sync.remove(keys, callback ?? (() => {}));
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
  getStorage({ GASDisabledSites: [] }, ({ GASDisabledSites }) => {
    const result = GASDisabledSites.includes(domain);
    cb(result, domain, GASDisabledSites);
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
    setStorage({ GASDisabledSites: sites }, () => cb?.(!isDisabled));
  });
};

export type { PlainObjectType };
export {
  getStorage,
  setStorage,
  getSecureValue,
  setSecureValue,
  removeStorage,
  isGitLabIssuesPage,
  checkDisabledGitLabSites,
  toggleDisabledGitLabSites,
};
