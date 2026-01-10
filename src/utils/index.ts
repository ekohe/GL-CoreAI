/* eslint-disable no-unreachable */
import { AiBOT } from "./common";
// PlainObjectType is used by shared utilities
// Import shared utilities
import {
  isGitLabIssuesPage,
  checkDisabledGitLabSites,
  toggleDisabledGitLabSites,
  getStorage,
  setStorage,
} from './shared';

async function fetchFromGitLabAPI(url: string) {
  const gitLabWebURL = await getGitLabWebURL();

  const requestUrl = url.startsWith("http")
    ? url  // Use the provided full URL as-is
    : [gitLabWebURL, url].join("");

  if (requestUrl === undefined) {
    throw new Error(`GitLab API request URL is wrong.`);
  }

  // Use cookie-based authentication (user is already logged into GitLab in the browser)
  const response = await fetch(requestUrl, {
    credentials: 'include',  // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });

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
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action }, function (response) {
      // Debug: log the raw response from background to diagnose issues
      if (chrome.runtime.lastError) {
        console.error(`[getFromBackground] runtime error:`, chrome.runtime.lastError);
        resolve(undefined);
        return;
      }

      if (response && response[key] !== undefined) {
        resolve(response[key]);
      } else {
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

// Retrieve GitLab Web URL
const getGitLabWebURL = async (): Promise<string | undefined> => {
  return getFromBackground("getGitLab", "GASGitLab");
};

// Retrieve GitLab API key (optional - for users who prefer token-based auth)
const getGitLabApiKey = async (): Promise<string | undefined> => {
  return getFromBackground("getGitLabApiKey", "GASGitLabAccessToken");
};

// Retrieve OpenAI API key
const getOpenAIApiKey = async (): Promise<string | undefined> => {
  return getFromBackground("getOpenAIApiKey", "GASOpenAIKey");
};

const getDeepSeekApiKey = async (): Promise<string | undefined> => {
  return getFromBackground("getDeepSeekApiKey", "GASDeepSeekAIKey");
};

// Retrieve Claude API key
const getClaudeApiKey = async (): Promise<string | undefined> => {
  return getFromBackground("getClaudeApiKey", "GASClaudeKey");
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

const getDeepSeekModel = async (): Promise<string | undefined> => {
  return getFromBackground("getDeepSeekModel", "GASDeepSeekModel");
};

const getClaudeModel = async (): Promise<string | undefined> => {
  return getFromBackground("getClaudeModel", "GASClaudeModel");
};

const getOllamaModel = async (): Promise<string | undefined> => {
  return getFromBackground("getOllamaModel", "GASOllamaModel");
};

const getOllamaURL = async (): Promise<string | undefined> => {
  return getFromBackground("getOllamaURL", "GASOllamaURL");
};

// Retrieve Personalization Settings
const getOccupation = async (): Promise<string | undefined> => {
  return getFromBackground("getOccupation", "GASOccupation");
};

const getNickname = async (): Promise<string | undefined> => {
  return getFromBackground("getNickname", "GASNickname");
};

const getAboutYou = async (): Promise<string | undefined> => {
  return getFromBackground("getAboutYou", "GASAboutYou");
};

const getCustomInstructions = async (): Promise<string | undefined> => {
  return getFromBackground("getCustomInstructions", "GASCustomInstructions");
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

// getStorage and setStorage now imported from shared utilities

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

// Shared utilities now imported at top of file

// Security: Validate token format
const isValidGoogleToken = (token: string): boolean => {
  return Boolean(token) && token.length > 20 && !token.includes(' ') && /^[A-Za-z0-9._-]+$/.test(token);
};

// Check if token is expired
const isTokenExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) return false;
  return Date.now() > expiresAt;
};

// Get token expiry from storage
const getGoogleTokenExpiry = async (): Promise<number | undefined> => {
  const result = await getFromBackground("getGoogleTokenExpiry", "GASGoogleTokenExpiry");
  return result ? parseInt(result as string) : undefined;
};

// Get the last time we validated the Google token with Google API
const getGoogleLastValidated = async (): Promise<number | undefined> => {
  const result = await getFromBackground("getGoogleLastValidated", "GASGoogleLastValidated");
  return result ? parseInt(result as string) : undefined;
};

// 30 days in milliseconds
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Check if we need to validate token (if it's been more than 30 days)
const needsTokenValidation = (lastValidated?: number): boolean => {
  if (!lastValidated) return true; // Never validated, need to validate
  return Date.now() - lastValidated >= THIRTY_DAYS_MS;
};

const getGoogleAccount = async (token: string) => {
  try {
    // Validate token before making API call
    if (!isValidGoogleToken(token)) {
      throw new Error("Invalid token format");
    }

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer " + token }),
      }
    );

    if (response.status === 401) {
      throw new Error("Token expired or invalid");
    }

    return await response.json();
  } catch (error: any) {
    throw new Error("Failed to fetch data: " + error.message); // Throw error so caller can handle it
  }
};

// Refresh Google token
const refreshGoogleToken = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (chrome.runtime.lastError || !token) {
        resolve(null);
      } else if (isValidGoogleToken(token)) {
        // Store refreshed token with 30-day expiry
        const tokenExpiresAt = Date.now() + THIRTY_DAYS_MS;
        setStorage({
          GASGoogleAccessToken: token,
          GASGoogleTokenExpiry: tokenExpiresAt
        });
        resolve(token);
      } else {
        console.error("Invalid token format received during refresh");
        resolve(null);
      }
    });
  });
};

const launchGoogleAuthentication = async (
  event: any,
  setGoogleAccessToken: any,
  setIsAuthenticating?: (isAuth: boolean) => void,
  setErrorText?: (error: string) => void
) => {
  const currentTarget = event.currentTarget;
  currentTarget.disabled = true;
  setIsAuthenticating?.(true);

  const clientId = AiBOT.googleAppClientId;

  // Define your client ID and redirect URL from the Google Developer Console
  const redirectUri = `https://${AiBOT.appId}.chromiumapp.org/`;
  const scopes = AiBOT.googleAppScopes.join(" ");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(
    scopes
  )}&include_granted_scopes=true&prompt=consent`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true, // Setting this to true opens a pop-up for authentication
    },
    function (responseUrl) {
      currentTarget.disabled = false;
      setIsAuthenticating?.(false);

      if (chrome.runtime.lastError) {
        const error = chrome.runtime.lastError.message || "Unknown error";
        console.error("Authentication failed:", error);

        // Enhanced error handling
        let userMessage = "Authentication failed. Please try again.";
        if (error.includes('canceled') || error.includes('cancelled')) {
          userMessage = "Authentication was cancelled. Please try again.";
        } else if (error.includes('network') || error.includes('connection')) {
          userMessage = "Network error during authentication. Check your connection and try again.";
        } else if (error.includes('blocked')) {
          userMessage = "Authentication was blocked. Please check your browser settings.";
        }

        setErrorText?.(userMessage);
        return;
      }

      if (!responseUrl) {
        console.error("No response URL received");
        setErrorText?.("Authentication failed. No response received.");
        return;
      }

      try {
        const url = new URL(responseUrl);
        const tokenMatch = url.hash.match(/access_token=([^&]*)/);

        if (tokenMatch) {
          const accessToken = decodeURIComponent(tokenMatch[1]);

          // Security validation
          if (!isValidGoogleToken(accessToken)) {
            console.error("Invalid token format received");
            setErrorText?.("Invalid authentication response. Please try again.");
            return;
          }

          // Set token expiry to 30 days after authentication
          const tokenExpiresAt = Date.now() + THIRTY_DAYS_MS;

          // Store token, expiry, and last validated timestamp
          setStorage({
            GASGoogleAccessToken: accessToken,
            GASGoogleTokenExpiry: tokenExpiresAt,
            GASGoogleLastValidated: Date.now()
          }, () => {
            setGoogleAccessToken(accessToken);
          });
        } else {
          console.error("Access token not found in response");
          setErrorText?.("Authentication response incomplete. Please try again.");
        }
      } catch (urlError) {
        console.error("Error parsing authentication response:", urlError);
        setErrorText?.("Invalid authentication response format.");
      }
    }
  );
};

const openChromeSettingPage = (): void => {
  chrome.runtime.sendMessage({ action: "openSettingPage" });
};

export {
  // Storage functions (from shared)
  getStorage,
  setStorage,
  // GitLab functions (from shared)
  isGitLabIssuesPage,
  checkDisabledGitLabSites,
  toggleDisabledGitLabSites,
  // Local functions
  getGitLabWebURL,
  getGitLabApiKey,
  getOpenAIApiKey,
  getDeepSeekApiKey,
  getClaudeApiKey,
  getThemeType,
  getThemeColor,
  getAiProvider,
  getOpenAIModel,
  getDeepSeekModel,
  getClaudeModel,
  getOllamaModel,
  getOllamaURL,
  getOccupation,
  getNickname,
  getAboutYou,
  getCustomInstructions,
  getDomainFromURL,
  getGoogleAccessToken,
  getUserAccessToken,
  getCurrentTabURL,
  chunkArray,
  calculateTicketAge,
  fetchFromGitLabAPI,
  getGoogleAccount,
  launchGoogleAuthentication,
  openChromeSettingPage,
  llamaApiChat,
  // New authentication utilities
  isValidGoogleToken,
  isTokenExpired,
  getGoogleTokenExpiry,
  getGoogleLastValidated,
  needsTokenValidation,
  refreshGoogleToken,
};
