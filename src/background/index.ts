/* eslint-disable import/first */
// Initialize contextMenu module
import "./contextMenu";
// Import the function we need
import { updateContextMenus } from "./contextMenu";
import {
  DEFAULT_AI_MODELS,
  DEFAULT_AI_PROVIDER,
  DEFAULT_OLLAMA_URL,
  DEFAULT_APPEARANCE,
  DEFAULT_LANGUAGE,
} from "../utils/constants";
import {
  isSensitiveKey,
  decrypt,
  isEncrypted,
  migrateToEncryptedStorage,
} from "../utils/encryptionManager";

export {};

// Track side panel state per window
const sidePanelOpenState = new Map<number, boolean>();

// Listen for window removal to clean up state
try {
  chrome.windows.onRemoved.addListener((windowId) => {
    sidePanelOpenState.delete(windowId);
  });
} catch (error) {
  console.error("Error setting up window listeners:", error);
}

// Helper function to toggle side panel
const toggleSidePanelForWindow = (windowId: number, callback: (success: boolean) => void) => {
  const isOpen = sidePanelOpenState.get(windowId) || false;

  if (isOpen) {
    // Close by disabling and re-enabling
    chrome.sidePanel.setOptions({ enabled: false }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error disabling side panel:", chrome.runtime.lastError);
        callback(false);
      } else {
        // Re-enable immediately so it can be opened again
        setTimeout(() => {
          chrome.sidePanel.setOptions({ enabled: true }, () => {
            if (chrome.runtime.lastError) {
              console.error("Error re-enabling side panel:", chrome.runtime.lastError);
            }
            sidePanelOpenState.set(windowId, false);
            callback(true);
          });
        }, 100);
      }
    });
  } else {
    // Open the side panel
    chrome.sidePanel.open({ windowId }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error opening side panel:", chrome.runtime.lastError);
        callback(false);
      } else {
        sidePanelOpenState.set(windowId, true);
        callback(true);
      }
    });
  }
};

chrome.runtime.onInstalled.addListener(async function (details) {
  // Migrate existing unencrypted data to encrypted format
  await migrateToEncryptedStorage();

  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://ekohe.com",
    });
  }
});

// Clean up when tabs are closed (no state to track now)
chrome.tabs.onRemoved.addListener((tabId) => {
});

// Update context menus when tab changes
try {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
      if (changeInfo.status === "complete" && tab.url) {
        updateContextMenus(tab.url);
      }
    } catch (error) {
      console.error("Error in tabs.onUpdated listener:", error);
    }
  });
} catch (error) {
  console.error("Error setting up tabs.onUpdated listener:", error);
}

// Update context menus when switching tabs
try {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url) {
        updateContextMenus(tab.url);
      }
    } catch (error) {
      console.error("Error getting tab info:", error);
    }
  });
} catch (error) {
  console.error("Error setting up tabs.onActivated listener:", error);
}

// Note: All side panel operations now use callback-based approach to preserve user gestures
// This ensures Chrome's user gesture requirement is met for sidePanel.open()

// Note: chrome.action.onClicked is not used when a popup is configured in manifest.json
// The popup will automatically show when users click the extension icon

// chrome.storage.onChanged.addListener((changes, namespace) => {
//   for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
//     console.log(
//       `Storage key "${key}" in namespace "${namespace}" changed.`,
//       `Old value was "${oldValue}", new value is "${newValue}".`
//     );
//   }
// });

// chrome.storage.sync.remove(
//   ["GASGitLab", "GASGitLabAccessToken", "GASThemeType", "GASThemeColor"],
//   () => {}
// );

// Utility function to retrieve a value from Chrome storage with decryption support
const getFromStorage = (
  key: string,
  sendResponse: (response: any) => void,
  defaultValue: any = null
) => {
  chrome.storage.sync.get(key, async (result) => {
    let value = result[key] !== undefined ? result[key] : defaultValue;

    // Decrypt if this is a sensitive key and value is encrypted
    if (isSensitiveKey(key) && typeof value === 'string' && isEncrypted(value)) {
      try {
        value = await decrypt(value);
      } catch (error) {
        console.error(`Error decrypting ${key}:`, error);
        // Keep the encrypted value as fallback
      }
    }

    sendResponse({ [key]: value });
  });
};

// Utility function to open Chrome internal pages
const openChromeInternalPage = (chromeExtURL: string) => {
  chrome.tabs.query({}, function (tabs: any) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].url === chromeExtURL) {
        chrome.tabs.update(tabs[i].id, { active: true });
        return;
      }
    }
    chrome.tabs.create({ url: chromeExtURL, active: true });
  });
};

// Storage action map for message handling
const storageActionsMap: { [key: string]: { key: string; defaultValue?: any } } = {
  getOpenAIApiKey: { key: "GASOpenAIKey" },
  getDeepSeekApiKey: { key: "GASDeepSeekAIKey" },
  getClaudeApiKey: { key: "GASClaudeKey" },
  getOpenRouterApiKey: { key: "GASOpenRouterKey" },
  getGitLabApiKey: { key: "GASGitLabAccessToken" },
  getGoogleAccessToken: { key: "GASGoogleAccessToken" },
  getGoogleTokenExpiry: { key: "GASGoogleTokenExpiry" },
  getGoogleLastValidated: { key: "GASGoogleLastValidated" },
  getUserAccessToken: { key: "GASUserAccessToken" },
  getCurrentTabURL: { key: "GASCurrentTabUrl" },
  getGitLab: { key: "GASGitLab" },
  getThemeType: { key: "GASThemeType", defaultValue: "theme-green" },
  getThemeColor: { key: "GASThemeColor", defaultValue: "#000000" },
  getAiProvider: { key: "GASAiProvider", defaultValue: DEFAULT_AI_PROVIDER },
  getOpenAIModel: { key: "GASOpenaiModel", defaultValue: DEFAULT_AI_MODELS.openai },
  getDeepSeekModel: { key: "GASDeepSeekModel", defaultValue: DEFAULT_AI_MODELS.deepseek },
  getClaudeModel: { key: "GASClaudeModel", defaultValue: DEFAULT_AI_MODELS.claude },
  getOllamaURL: { key: "GASOllamaURL", defaultValue: DEFAULT_OLLAMA_URL },
  getOllamaModel: { key: "GASOllamaModel", defaultValue: DEFAULT_AI_MODELS.ollama },
  getOpenRouterModel: { key: "GASOpenRouterModel", defaultValue: DEFAULT_AI_MODELS.openrouter },
  getOccupation: { key: "GASOccupation", defaultValue: "" },
  getNickname: { key: "GASNickname", defaultValue: "" },
  getAboutYou: { key: "GASAboutYou", defaultValue: "" },
  getCustomInstructions: { key: "GASCustomInstructions", defaultValue: "" },
  getAppearance: { key: "GASAppearance", defaultValue: DEFAULT_APPEARANCE },
  getLanguage: { key: "GASLanguage", defaultValue: DEFAULT_LANGUAGE },
};

// Consolidated message listener for all runtime messages
// IMPORTANT: Do NOT use async here - Chrome's messaging API requires returning
// the literal boolean `true` (not Promise<true>) to keep the channel open.
try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      // Handle storage get requests
      const storageAction = storageActionsMap[request.action];
      if (storageAction) {
        getFromStorage(storageAction.key, sendResponse, storageAction.defaultValue);
        return true; // Keep channel open for async storage response
      }

      // Handle settings page
      if (request.action === "openSettingPage") {
        openChromeInternalPage(
          `chrome-extension://${chrome.runtime.id}/packs/static/settings.html`
        );
        return false; // No async response needed
      }

      // Handle side panel operations - MUST preserve user gesture context
      if (request.action === "toggleSidePanel") {
        const windowId = sender.tab?.windowId;

        if (!windowId) {
          console.error("No window ID available for side panel operation");
          sendResponse({ success: false, error: "No window ID available" });
          return false;
        }

        // Toggle the side panel
        toggleSidePanelForWindow(windowId, (success: boolean) => {
          if (success) {
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: "Failed to toggle side panel" });
          }
        });

        return true; // Keep message channel open for async response
      }

      // Handle side panel toggle from context menu
      if (request.action === "toggleSidePanelFromContextMenu") {
        const windowId = request.windowId;

        if (!windowId) {
          console.error("No window ID provided for context menu toggle");
          return false;
        }

        toggleSidePanelForWindow(windowId, (success: boolean) => {
          if (!success) {
            console.error("Failed to toggle side panel via context menu");
          }
        });

        return false; // No response needed
      }

      // Handle Ollama API requests
      if (request.action === "llamaAPI") {
        fetch(request.aIApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request.data),
        })
          .then((response) => response.json())
          .then((data) => {
            sendResponse({ ok: true, data });
          })
          .catch((error) => {
            sendResponse({ ok: false, error });
          });
        return true; // Keep message channel open for async response
      }

      return false; // No response needed for unhandled actions
    } catch (error) {
      console.error("Error in runtime message listener:", error);
      sendResponse({ success: false, error: "Internal extension error" });
      return false;
    }
  });
} catch (error) {
  console.error("Error setting up runtime message listener:", error);
}
