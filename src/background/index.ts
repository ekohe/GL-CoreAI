/* eslint-disable import/first */
export {};

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "https://ekohe.com",
    });
  }
});

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

// Utility function to retrieve a value from Chrome storage
const getFromStorage = (
  key: string,
  sendResponse: (response: any) => void,
  defaultValue: any = null
) => {
  chrome.storage.sync.get(key, (result) => {
    sendResponse({ [key]: result[key] || defaultValue });
  });
};

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const actionsMap: { [key: string]: { key: string; defaultValue?: any } } = {
    getOpenAIApiKey: { key: "GASOpenAIKey" },
    getDeepSeekApiKey: { key: "GASDeepSeekAIKey" },
    getClaudeApiKey: { key: "GASClaudeKey" },
    getGitLabApiKey: { key: "GASGitLabAccessToken" },
    getGoogleAccessToken: { key: "GASGoogleAccessToken" },
    getUserAccessToken: { key: "GASUserAccessToken" },
    getCurrentTabURL: { key: "GASCurrentTabUrl" },
    getGitLab: { key: "GASGitLab" },
    getThemeType: { key: "GASThemeType", defaultValue: "theme-green" },
    getThemeColor: { key: "GASThemeColor", defaultValue: "#000000" },
    getAiProvider: { key: "GASAiProvider", defaultValue: "openai" },
    getOpenAIModel: { key: "GASOpenaiModel", defaultValue: "gpt-4o" },
    getDeepSeekModel: {
      key: "GASDeepSeekModel",
      defaultValue: "deepseek-chat",
    },
    getClaudeModel: {
      key: "GASClaudeModel",
      defaultValue: "claude-3-opus-20240229",
    },
    getOllamaURL: {
      key: "GASOllamaURL",
      defaultValue: "http://localhost:11434",
    },
    getOllamaModel: { key: "GASOllamaModel", defaultValue: "llama3.2" },
  };

  const action = actionsMap[request.action];

  if (action) {
    getFromStorage(action.key, sendResponse, action.defaultValue);
    return true; // This keeps the message channel open for the async response
  }
});

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openSettingPage") {
    openChromeInternalPage(
      `chrome-extension://${chrome.runtime.id}/packs/static/settings.html`
    );
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "llamaAPI") {
    await fetch(request.aIApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.data),
    })
      .then((response) => response.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error) => sendResponse({ ok: false, error }));

    return true; // Keep the message channel open for async response
  }
});
