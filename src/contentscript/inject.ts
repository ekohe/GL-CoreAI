/* eslint-disable @typescript-eslint/no-use-before-define */
import { isGitLabIssuesPage, setStorage } from "../utils";
import extView from "../utils/extView";
import "../assets/styles/inject.css";

export {};

const currentTabUrl = window.document.URL;

if (isGitLabIssuesPage(currentTabUrl)) {
  extView.displayExtView();

  setStorage(
    {
      GASCurrentTabUrl: currentTabUrl,
      GASGitLab: [window.location.protocol, window.location.hostname].join(
        "//"
      ),
    },
    () => {}
  );
}
