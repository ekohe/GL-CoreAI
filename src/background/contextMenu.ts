import {
  checkDisabledGitLabSites,
  isGitLabIssuesPage,
} from "../utils/serviceWorkerUtils";
import { AiBOT } from "../utils/common";

const menus = {
  open_side_panel(status: boolean = true) {
    return `Toggle ${AiBOT.name}`;
  },
};

// No message to send or receive, only to trigger contextMenu on startup

// Create context menus only on extension install/update to avoid duplicate ID errors
chrome.runtime.onInstalled.addListener(() => {
  // Remove all existing menus first to ensure clean state
  chrome.contextMenus.removeAll(() => {
    try {
      // Create the side panel menu
      chrome.contextMenus.create({
        id: "open_side_panel",
        contexts: ["page", "action"],
        title: menus.open_side_panel(true),
      });
    } catch (error) {
      console.error("Error creating context menus:", error);
    }
  });
});

const updateContextMenus = (url?: string) => {
  try {
    chrome.contextMenus.update("open_side_panel", { visible: false });

    if (isGitLabIssuesPage(url)) {
      checkDisabledGitLabSites(url as string, (isDisabled: boolean) => {
        try {
          chrome.contextMenus.update("open_side_panel", {
            visible: !isDisabled, // Only show side panel option when enabled
            title: menus.open_side_panel(isDisabled),
          });
        } catch (error) {
          console.error("Error updating context menus:", error);
        }
      });
    }
  } catch (error) {
    console.error("Error in updateContextMenus:", error);
  }
};

try {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab || !tab.url || !tab.id) {
      return;
    }

    if (info.menuItemId === "open_side_panel") {
      try {
        if (!tab.windowId) {
          console.error("No window ID available");
          return;
        }

        chrome.runtime.sendMessage({
          action: "toggleSidePanelFromContextMenu",
          windowId: tab.windowId
        });
      } catch (error) {
        console.error("Failed to toggle side panel:", error);
      }
    }
  });
} catch (error) {
  console.error("Error setting up context menu click listener:", error);
}

export { updateContextMenus };
