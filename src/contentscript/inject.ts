/* eslint-disable @typescript-eslint/no-use-before-define */
import { isGitLabIssuesPage, setStorage, getStorage } from "../utils";
import "../assets/styles/inject.css";
import { AiBOT } from "../utils/common";

export {};

const currentTabUrl = window.document.URL;

// Storage key for trigger position
const TRIGGER_POSITION_KEY = "GASIconPosition";
const DEFAULT_POSITION = { bottom: 100 }; // Default bottom position in pixels

// Get icon URL from extension host
const getExtensionIconUrl = (): string => {
  return chrome.runtime.getURL("static/icons/icon48.png");
};

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

// Load saved position from storage
const loadIconPosition = async (): Promise<{ bottom: number }> => {
  return new Promise((resolve) => {
    getStorage(TRIGGER_POSITION_KEY, (result: any) => {
      const savedPosition = result?.[TRIGGER_POSITION_KEY];
      if (savedPosition && typeof savedPosition.bottom === "number") {
        resolve(savedPosition);
      } else {
        resolve(DEFAULT_POSITION);
      }
    });
  });
};

// Save position to storage
const saveIconPosition = (bottom: number): void => {
  setStorage({ [TRIGGER_POSITION_KEY]: { bottom } }, () => {});
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

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === "showNotification") {
      showNotification(message.message, message.type);
    }

    // Handle inserting text into GitLab issue comment box
    if (message.action === "insertIntoCommentBox") {
      const result = insertTextIntoCommentBox(message.text);
      sendResponse(result);
      return true; // Keep channel open for async response
    }
  });

  // Helper function to insert text into GitLab issue comment box
  const insertTextIntoCommentBox = (text: string): { success: boolean; error?: string } => {
    try {
      // GitLab uses different selectors for the comment textarea
      // Try multiple selectors to find the comment box
      const selectors = [
        // New GitLab UI - note form
        "#note-body",
        "#note_note",
        // Legacy and alternative selectors
        ".js-note-text",
        ".note-textarea",
        "textarea[name='note[note]']",
        // Vue-based markdown editor
        ".js-vue-markdown-field textarea",
        // General comment textarea
        "[data-testid='comment-field'] textarea",
        "textarea.js-gfm-input",
        // Discussion textarea
        ".js-main-target-form textarea",
      ];

      let textarea: HTMLTextAreaElement | null = null;

      for (const selector of selectors) {
        const element = document.querySelector(selector) as HTMLTextAreaElement;
        if (element && element.offsetParent !== null) {
          textarea = element;
          break;
        }
      }

      if (!textarea) {
        // Try to find any visible textarea in the notes section
        const notesSection = document.querySelector(".notes-form, .js-main-target-form, [data-testid='notes-container']");
        if (notesSection) {
          textarea = notesSection.querySelector("textarea") as HTMLTextAreaElement;
        }
      }

      if (!textarea) {
        return {
          success: false,
          error: "Could not find the comment box. Please click on the comment field first and try again."
        };
      }

      // Focus the textarea first
      textarea.focus();

      // Get current content and cursor position
      const currentValue = textarea.value;
      const cursorPos = textarea.selectionStart || currentValue.length;

      // Insert text at cursor position (or append if at end)
      const newValue = currentValue.slice(0, cursorPos) +
        (currentValue.length > 0 && cursorPos > 0 ? "\n\n" : "") +
        text +
        currentValue.slice(cursorPos);

      // Set the new value
      textarea.value = newValue;

      // Trigger input event for Vue/React reactivity
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));

      // For GitLab's Vue-based editors, we might need to trigger a special event
      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        data: text,
      });
      textarea.dispatchEvent(inputEvent);

      // Scroll to the bottom of the textarea to show inserted text
      textarea.scrollTop = textarea.scrollHeight;

      // Move cursor to end of inserted text
      const newCursorPos = cursorPos + (currentValue.length > 0 && cursorPos > 0 ? 2 : 0) + text.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);

      showNotification(`${AiBOT.name} summary added to comment box!`, "success");
      return { success: true };
    } catch (error: any) {
      console.error("Error inserting text into comment box:", error);
      return {
        success: false,
        error: error.message || "Failed to insert text into comment box"
      };
    }
  };

  const createSidePanelTrigger = async () => {
    const existingTrigger = document.getElementById("gl-ai-side-panel-trigger");
    if (existingTrigger) {
      existingTrigger.remove();
    }

    // Load saved position
    const savedPosition = await loadIconPosition();

    const trigger = document.createElement("button");
    trigger.id = "gl-ai-side-panel-trigger";

    // Create icon image element using extension host URL
    const iconImg = document.createElement("img");
    iconImg.src = getExtensionIconUrl();
    iconImg.style.cssText = `
      width: 40px;
      height: 40px;
      pointer-events: none;
    `;
    trigger.appendChild(iconImg);

    trigger.style.cssText = `
      position: fixed;
      bottom: ${savedPosition.bottom}px;
      right: 15px;
      z-index: 10000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 50%;
      padding: 8px;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    `;

    // Dragging state variables
    let isDragging = false;
    let hasMoved = false;
    let startY = 0;
    let startBottom = 0;
    let dragTimeout: ReturnType<typeof setTimeout> | null = null;

    // Mouse down - start potential drag
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startY = e.clientY;
      startBottom = parseInt(trigger.style.bottom) || savedPosition.bottom;
      hasMoved = false;

      // Set up drag after a short delay to distinguish from click
      dragTimeout = setTimeout(() => {
        isDragging = true;
        trigger.style.cursor = "grabbing";
        trigger.style.transition = "box-shadow 0.2s ease";
        trigger.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.6)";
      }, 100);

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Mouse move - handle dragging
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;

      if (Math.abs(deltaY) > 5) {
        hasMoved = true;
        if (dragTimeout) {
          clearTimeout(dragTimeout);
          dragTimeout = null;
        }
        isDragging = true;
        trigger.style.cursor = "grabbing";
        trigger.style.transition = "box-shadow 0.2s ease";
      }

      if (isDragging) {
        // Calculate new position with boundaries
        // When using bottom positioning, moving mouse down (positive deltaY) should decrease bottom value
        const triggerHeight = trigger.offsetHeight;
        const windowHeight = window.innerHeight;
        const minBottom = 0;
        const maxBottom = windowHeight - triggerHeight;

        let newBottom = startBottom - deltaY; // Subtract deltaY because bottom positioning is inverted
        newBottom = Math.max(minBottom, Math.min(maxBottom, newBottom));

        trigger.style.bottom = `${newBottom}px`;
      }
    };

    // Mouse up - end drag or trigger click
    const handleMouseUp = async (e: MouseEvent) => {
      if (dragTimeout) {
        clearTimeout(dragTimeout);
        dragTimeout = null;
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (isDragging && hasMoved) {
        // Save the new position
        const finalBottom = parseInt(trigger.style.bottom) || DEFAULT_POSITION.bottom;
        saveIconPosition(finalBottom);

        trigger.style.cursor = "grab";
        trigger.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
        trigger.style.transition = "box-shadow 0.2s ease, transform 0.2s ease";
      } else if (!hasMoved) {
        // This was a click, not a drag
        trigger.style.transform = "scale(0.95)";
        setTimeout(() => {
          trigger.style.transform = "scale(1)";
        }, 150);
        await toggleSidePanel();
      }

      isDragging = false;
      hasMoved = false;
    };

    // Touch events for mobile support
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        startY = touch.clientY;
        startBottom = parseInt(trigger.style.bottom) || savedPosition.bottom;
        hasMoved = false;

        dragTimeout = setTimeout(() => {
          isDragging = true;
          trigger.style.cursor = "grabbing";
        }, 100);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaY = touch.clientY - startY;

        if (Math.abs(deltaY) > 5) {
          hasMoved = true;
          if (dragTimeout) {
            clearTimeout(dragTimeout);
            dragTimeout = null;
          }
          isDragging = true;
          e.preventDefault(); // Prevent scrolling while dragging
        }

        if (isDragging) {
          // When using bottom positioning, moving finger down (positive deltaY) should decrease bottom value
          const triggerHeight = trigger.offsetHeight;
          const windowHeight = window.innerHeight;
          const minBottom = 0;
          const maxBottom = windowHeight - triggerHeight;

          let newBottom = startBottom - deltaY; // Subtract deltaY because bottom positioning is inverted
          newBottom = Math.max(minBottom, Math.min(maxBottom, newBottom));

          trigger.style.bottom = `${newBottom}px`;
        }
      }
    };

    const handleTouchEnd = async () => {
      if (dragTimeout) {
        clearTimeout(dragTimeout);
        dragTimeout = null;
      }

      if (isDragging && hasMoved) {
        const finalBottom = parseInt(trigger.style.bottom) || DEFAULT_POSITION.bottom;
        saveIconPosition(finalBottom);
        trigger.style.cursor = "grab";
      } else if (!hasMoved) {
        trigger.style.transform = "scale(0.95)";
        setTimeout(() => {
          trigger.style.transform = "scale(1)";
        }, 150);
        await toggleSidePanel();
      }

      isDragging = false;
      hasMoved = false;
    };

    // Attach event listeners
    trigger.addEventListener("mousedown", handleMouseDown);
    trigger.addEventListener("touchstart", handleTouchStart, { passive: true });
    trigger.addEventListener("touchmove", handleTouchMove, { passive: false });
    trigger.addEventListener("touchend", handleTouchEnd);

    // Hover effects (only when not dragging)
    trigger.addEventListener("mouseenter", () => {
      if (!isDragging) {
        trigger.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
        trigger.style.transform = "scale(1.05)";
      }
    });
    trigger.addEventListener("mouseleave", () => {
      if (!isDragging) {
        trigger.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
        trigger.style.transform = "scale(1)";
      }
    });

    document.body.appendChild(trigger);

    // Update position on window resize to keep within bounds
    window.addEventListener("resize", () => {
      const currentBottom = parseInt(trigger.style.bottom) || DEFAULT_POSITION.bottom;
      const triggerHeight = trigger.offsetHeight;
      const windowHeight = window.innerHeight;
        const maxBottom = windowHeight - triggerHeight;

      if (currentBottom > maxBottom) {
        trigger.style.bottom = `${Math.max(0, maxBottom)}px`;
        saveIconPosition(Math.max(0, maxBottom));
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSidePanelTrigger);
  } else {
    createSidePanelTrigger();
  }
}
