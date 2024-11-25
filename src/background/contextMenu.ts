import {
  checkDisabledGitLabSites,
  isGitLabIssuesPage,
  toggleDisabledGitLabSites,
} from "../utils";
import { AiBOT } from "../utils/common";

const menus = {
  gitlab_recognition(isDisabled: boolean = true) {
    return `Turn ${isDisabled ? "On" : "Off"} ${AiBOT.name}`;
  },
};

//No message to send or receive, only to trigger contextMenu on startup

Object.entries(menus).forEach(([menuId, titleFunc]) => {
  chrome.contextMenus.create({
    id: menuId,
    contexts: ["page", "browser_action"],
    title: typeof titleFunc === "string" ? titleFunc : titleFunc(),
  });
});
// })

const updateContextMenus = (url?: string) => {
  chrome.contextMenus.update("issue_summary", { visible: false });

  if (isGitLabIssuesPage(url)) {
    checkDisabledGitLabSites(url as string, (isDisabled: boolean) => {
      chrome.contextMenus.update("issue_summary", {
        visible: true,
        title: menus.gitlab_recognition(isDisabled),
      });
    });
  }
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "issue_summary") {
    if (!tab || !tab.url || !tab.id) {
      return;
    }

    toggleDisabledGitLabSites(tab.url, (currentIsDisabled: boolean) => {
      updateContextMenus(tab.url);

      chrome.tabs.sendMessage(tab.id as number, {
        name: "disabledNewsSitesChanged",
        isDisabled: currentIsDisabled,
      });
    });
  }
});

export { updateContextMenus };
