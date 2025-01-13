/* eslint-disable eqeqeq */

import { getThemeColor, getThemeType } from ".";
import { AiBOT } from "./common";
import logo from "../assets/icons/logo.png";

/* eslint-disable import/no-anonymous-default-export */
const defaultTitle = AiBOT.name;

const themeColor = await getThemeColor();
const themeType = await getThemeType();

const createExtView = (): void => {
  let root = document.createElement("div");
  root.id = "extGitLabAiSummarizer";
  root.className = "logoOnly";

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL(`/packs/static/index.html`);
  iframe.setAttribute("theme", `${themeType}`);

  const headerExtLogo = document.createElement("img");
  headerExtLogo.id = "gitlabAISummarizerHeaderExtLogo";
  headerExtLogo.src = chrome.runtime.getURL(logo);
  headerExtLogo.alt = defaultTitle;

  headerExtLogo.addEventListener("click", async () => {
    toggleExtView();
  });

  const headerCloseIcon = document.createElement("span");
  headerCloseIcon.id = "gitlabAISummarizerHeaderCloseIcon";
  headerCloseIcon.innerHTML = `
    <svg fill="#f9f7f9" height="34px" width="34px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 330.002 330.002" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.660004"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_103_" d="M233.252,155.997L120.752,6.001c-4.972-6.628-14.372-7.97-21-3c-6.628,4.971-7.971,14.373-3,21 l105.75,140.997L96.752,306.001c-4.971,6.627-3.627,16.03,3,21c2.698,2.024,5.856,3.001,8.988,3.001 c4.561,0,9.065-2.072,12.012-6.001l112.5-150.004C237.252,168.664,237.252,161.33,233.252,155.997z"></path> </g></svg>`;

  headerCloseIcon.addEventListener("click", async () => {
    toggleExtView();
  });

  headerCloseIcon.addEventListener("mouseover", () => {
    headerCloseIcon.style.backgroundColor = `${themeColor}`;
    const svgIcon = headerCloseIcon.querySelector("svg");
    if (svgIcon && svgIcon?.style) svgIcon.style.color = "white";
  });

  headerCloseIcon.addEventListener("mouseout", () => {
    headerCloseIcon.style.backgroundColor = `white`;
    const svgIcon = headerCloseIcon.querySelector("svg");
    if (svgIcon && svgIcon?.style) svgIcon.style.color = "black";
  });

  document.body.appendChild(root);
  root.appendChild(headerExtLogo);
  root.appendChild(iframe);
  root.appendChild(headerCloseIcon);
};

const displayExtView = () => {
  let root = document.querySelector<HTMLDivElement>("#extGitLabAiSummarizer");
  if (root) {
    if (root.classList.contains("logoOnly")) {
      root.classList.toggle("logoOnly");
    }
  } else {
    createExtView();
  }
};

const toggleExtView = () => {
  let root = document.querySelector<HTMLDivElement>("#extGitLabAiSummarizer");
  let body = document.querySelector<HTMLBodyElement>("body");
  let webRoot = document.documentElement;

  if (body) {
    // CSS: Transform for body has bad influence on our extension,
    getComputedStyle(body)["transform"] != "none"
      ? (body.style.transform = "none")
      : body.style.removeProperty("transform");

    getComputedStyle(body)["maxWidth"] != "none"
      ? (body.style.maxWidth = "none")
      : body.style.removeProperty("maxWidth");

    getComputedStyle(body)["filter"] != "none"
      ? (body.style.filter = "none")
      : body.style.removeProperty("filter");

    getComputedStyle(body)["perspective"] != "none"
      ? (body.style.perspective = "none")
      : body.style.removeProperty("perspective");

    getComputedStyle(webRoot)["perspective"] != "none"
      ? (webRoot.style.perspective = "none")
      : webRoot.style.removeProperty("perspective");
  }

  if (root) {
    root.classList.toggle("logoOnly");
  } else {
    createExtView();
  }
};

const destroyExtView = () => {
  let root = document.querySelector<HTMLDivElement>("#extGitLabAiSummarizer");
  if (root) root.remove();
};

export default {
  displayExtView,
  toggleExtView,
  destroyExtView,
};
