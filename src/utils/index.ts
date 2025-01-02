/* eslint-disable no-unreachable */
import { AiBOT } from "./common";

async function fetchFromGitLabAPI(url: string) {
  const gitLabWebURL = await getGitLabWebURL();
  const requestUrl = url.startsWith("http")
    ? gitLabWebURL
    : [gitLabWebURL, url].join("");

  if (requestUrl === undefined) {
    throw new Error(`GitLab API request URL is wrong.`);
  }
  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(`GitLab API error: ${response.statusText}`);
  }

  return await response.json();
}

// Utility function to send a message to the background script and retrieve the result
const getFromBackground = async (
  action: string,
  key: string
): Promise<string | undefined> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action }, function (response) {
      if (response && response[key]) {
        resolve(response[key]);
      } else {
        console.log(`No ${key} found`);
        resolve(undefined);
      }
    });
  });
};

const llamaApiChat = async (
  action: string,
  aIApiUrl: string,
  data: any
): Promise<string | undefined> => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action, aIApiUrl, data }, (response) => {
      resolve(response || undefined);
    });
  });
};

// Retrieve GitLab API key
const getGitLabApiKey = async (): Promise<string | undefined> => {
  return getFromBackground("getGitLabApiKey", "GASGitLabAccessToken");
};

// Retrieve GitLab Web URL
const getGitLabWebURL = async (): Promise<string | undefined> => {
  return getFromBackground("getGitLab", "GASGitLab");
};

// Retrieve OpenAI API key
const getOpenAIApiKey = async (): Promise<string | undefined> => {
  return getFromBackground("getOpenAIApiKey", "GASOpenAIKey");
};

// Retrieve Theme Type
const getThemeType = async (): Promise<string | undefined> => {
  return getFromBackground("getThemeType", "GASThemeType");
};

// Retrieve Theme Color
const getThemeColor = async (): Promise<string | undefined> => {
  return getFromBackground("getThemeColor", "GASThemeColor");
};

// Retrieve AI Provider
const getAiProvider = async (): Promise<string | undefined> => {
  return getFromBackground("getAiProvider", "GASAiProvider");
};

const getOpenAIModel = async (): Promise<string | undefined> => {
  return getFromBackground("getOpenAIModel", "GASOpenaiModel");
};

const getOllamaModel = async (): Promise<string | undefined> => {
  return getFromBackground("getOllamaModel", "GASOllamaModel");
};

const getOllamaURL = async (): Promise<string | undefined> => {
  return getFromBackground("getOllamaURL", "GASOllamaURL");
};

const getGoogleAccessToken = async (): Promise<string | undefined> => {
  return getFromBackground("getGoogleAccessToken", "GASGoogleAccessToken");
};

const getUserAccessToken = async (): Promise<string | undefined> => {
  return getFromBackground("getUserAccessToken", "GASUserAccessToken");
};

const getCurrentTabURL = async (): Promise<string | undefined> => {
  return getFromBackground("getCurrentTabURL", "GASCurrentTabUrl");
};

const getStorage = (
  keys: string | string[] | PlainObjectType,
  callback: (v: any) => any
) => {
  if (chrome.storage) {
    chrome.storage.sync.get(keys, (result: any) => callback(result));
  } else {
    console.log("Local storage is not available in this browser.");

    callback(keys);
  }
};

const setStorage = (obj: PlainObjectType, callback?: () => any) => {
  if (chrome.storage) {
    chrome.storage.sync.set(obj, callback ?? (() => {}));
  } else {
    console.log("Local storage is not available in this browser.");

    callback?.();
  }
};

const calculateTicketAge = (date: string): number => {
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format");
  }

  const ageInDays = Math.floor(
    (new Date().getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return ageInDays;
};

const getDomainFromURL = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
};

const chunkArray = (array: any, size: number) => {
  return array.reduce((acc: any, item: any, index: number) => {
    const chunkIndex = Math.floor(index / size);

    if (!acc[chunkIndex]) {
      acc[chunkIndex] = []; // Start a new chunk
    }

    acc[chunkIndex].push(item); // Add item to the chunk

    return acc;
  }, []);
};

const isGitLabIssuesPage = (url?: string) => {
  if (!url) {
    return;
  }

  // domain check
  // const { host } = new URL(url);
  // return SITES.some((domain) => host.endsWith(domain));
  const regexp = new RegExp("/-/issues/d+|https://gitlab.|/-/work_items/d+");
  return regexp.test(url);
};

const checkDisabledGitLabSites = (
  url: string,
  cb: (resule: boolean, domain: string, sites: string[]) => any
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

const getGoogleAccount = async (token: string) => {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer " + token }),
      }
    );
    return await response.json();
  } catch (error: any) {
    throw new Error("Failed to fetch data: " + error.message); // Throw error so caller can handle it
  }
};

const getUserAccount = async (token: string) => {
  try {
    return {
      id: "1234",
      name: "Encore",
      email: "encore@apple.com",
      verified_email: true,
    };
  } catch (error: any) {
    throw new Error("Failed to fetch data: " + error.message); // Throw error so caller can handle it
  }
};

const launchGoogleAuthentication = async (
  event: any,
  setGoogleAccessToken: any
) => {
  const currentTarget = event.currentTarget;
  currentTarget.disabled = true;
  const clientId = AiBOT.googleAppClientId;

  // Define your client ID and redirect URL from the Google Developer Console
  const redirectUri = `https://${AiBOT.appId}.chromiumapp.org/`;
  const scopes = AiBOT.googleAppScopes.join(" ");
  const authUrl = `
    https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
    scopes
  )}&include_granted_scopes=true&prompt=consent`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true, // Setting this to true opens a pop-up for authentication
    },
    function (responseUrl) {
      if (chrome.runtime.lastError || !responseUrl) {
        console.error("Authentication failed:", chrome.runtime.lastError);
        return;
      }
      const url = new URL(responseUrl);
      const tokenMatch = url.hash.match(/access_token=([^&]*)/);

      if (tokenMatch) {
        const accessToken = tokenMatch[1];

        setStorage({ GASGoogleAccessToken: accessToken }, () => {
          setGoogleAccessToken(accessToken);
        });
      } else {
        console.error("Access token not found in response");
      }

      currentTarget.disabled = false;
    }
  );
};

const openChromeSettingPage = (): void => {
  chrome.runtime.sendMessage({ action: "openSettingPage" });
};

export {
  getStorage,
  setStorage,
  getGitLabWebURL,
  getGitLabApiKey,
  getOpenAIApiKey,
  getThemeType,
  getThemeColor,
  getAiProvider,
  getOpenAIModel,
  getOllamaModel,
  getOllamaURL,
  getDomainFromURL,
  getGoogleAccessToken,
  getUserAccessToken,
  getCurrentTabURL,
  chunkArray,
  calculateTicketAge,
  fetchFromGitLabAPI,
  isGitLabIssuesPage,
  checkDisabledGitLabSites,
  toggleDisabledGitLabSites,
  getGoogleAccount,
  getUserAccount,
  launchGoogleAuthentication,
  openChromeSettingPage,
  llamaApiChat,
};
