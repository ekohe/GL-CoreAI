/* eslint-disable @typescript-eslint/no-use-before-define */
import { isGitLabIssuesPage, setStorage } from "../utils";
import "../assets/styles/inject.css";

export {};

const currentTabUrl = window.document.URL;

const toggleSidePanel = async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      action: "toggleSidePanel"
    });

    if (response && response.success) {
    } else {
      console.error("Failed to send side panel toggle request");
    }
  } catch (error) {
    console.error("Error sending message to background script:", error);
  }
};

const showNotification = (message: string, type: "success" | "error" | "info" = "info") => {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 10001;
    background: ${type === "error" ? "#dc3545" : type === "success" ? "#28a745" : "#0066cc"};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    max-width: 300px;
    transform: translateX(400px);
    transition: transform 0.3s ease-out;
  `;

  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 10);

  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
};

if (isGitLabIssuesPage(currentTabUrl)) {
  setStorage(
    {
      GASCurrentTabUrl: currentTabUrl,
      GASGitLab: [window.location.protocol, window.location.hostname].join(
        "//"
      ),
    },
    () => {}
  );

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "showNotification") {
      showNotification(message.message, message.type);
    }
  });

  const createSidePanelTrigger = () => {
    const existingTrigger = document.getElementById("gl-ai-side-panel-trigger");
    if (existingTrigger) {
      existingTrigger.remove();
    }

    const trigger = document.createElement("button");
    trigger.id = "gl-ai-side-panel-trigger";
    trigger.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>GL CoreAI</span>
    `;
    trigger.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    `;

    trigger.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      trigger.style.background = "#004499";
      trigger.style.transform = "scale(0.95)";

      setTimeout(() => {
        trigger.style.background = "#0066cc";
        trigger.style.transform = "translateY(0)";
      }, 150);

      await toggleSidePanel();
    });
    trigger.addEventListener("mouseenter", () => {
      trigger.style.background = "#0056b3";
      trigger.style.transform = "translateY(-1px)";
    });
    trigger.addEventListener("mouseleave", () => {
      trigger.style.background = "#0066cc";
      trigger.style.transform = "translateY(0)";
    });

    document.body.appendChild(trigger);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSidePanelTrigger);
  } else {
    createSidePanelTrigger();
  }
}
