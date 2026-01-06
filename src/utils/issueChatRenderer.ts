/**
 * IssueChatRenderer - Renders chat messages and responses for issue conversations
 * Uses React components for proper markdown rendering
 */
import { createRoot, Root } from "react-dom/client";
import { createElement } from "react";
import ChatMessage from "../components/ChatMessage";

// Store roots for cleanup
const containerRoots = new Map<HTMLElement, Root>();

export class IssueChatRenderer {
  private static createStyles(): void {
    if (document.querySelector("style[data-issue-chat-renderer]")) {
      return;
    }

    const style = document.createElement("style");
    style.setAttribute("data-issue-chat-renderer", "true");
    style.textContent = `
      /* Prevent scrollbar layout shift */
      .chat-streaming-wrapper,
      .chat-response-wrapper,
      .chat-user-wrapper {
        overflow-anchor: none;
      }

      .chat-assistant-message {
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
      }

      .chat-message-container {
        margin-bottom: 16px;
        animation: chatFadeIn 0.3s ease-out;
      }

      @keyframes chatFadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chat-user-message {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        border-radius: 16px 16px 4px 16px;
        margin-left: 20%;
        margin-bottom: 12px;
        font-size: 14px;
        line-height: 1.5;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }

      .chat-assistant-message {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #1e293b;
        padding: 16px;
        border-radius: 16px 16px 16px 4px;
        margin-right: 10%;
        font-size: 14px;
        line-height: 1.6;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }

      .chat-assistant-message p {
        margin: 0 0 12px 0;
      }

      .chat-assistant-message p:last-child {
        margin-bottom: 0;
      }

      .chat-assistant-message ul,
      .chat-assistant-message ol {
        margin: 8px 0;
        padding-left: 24px;
      }

      .chat-assistant-message li {
        margin-bottom: 4px;
        line-height: 1.5;
      }

      .chat-assistant-message li p {
        margin: 0;
      }

      .chat-assistant-message h1,
      .chat-assistant-message h2,
      .chat-assistant-message h3,
      .chat-assistant-message h4,
      .chat-assistant-message h5 {
        color: #0f172a;
        margin: 16px 0 8px 0;
        font-weight: 600;
        line-height: 1.3;
      }

      .chat-assistant-message h1:first-child,
      .chat-assistant-message h2:first-child,
      .chat-assistant-message h3:first-child {
        margin-top: 0;
      }

      .chat-assistant-message h1 { font-size: 1.25rem; }
      .chat-assistant-message h2 { font-size: 1.125rem; }
      .chat-assistant-message h3 { font-size: 1rem; }
      .chat-assistant-message h4 { font-size: 0.9rem; }
      .chat-assistant-message h5 { font-size: 0.85rem; }

      .chat-assistant-message strong {
        font-weight: 600;
        color: #0f172a;
      }

      .chat-assistant-message em {
        font-style: italic;
      }

      .chat-assistant-message del {
        color: #94a3b8;
        text-decoration: line-through;
      }

      .chat-assistant-message blockquote,
      .chat-blockquote {
        border-left: 3px solid #667eea;
        margin: 12px 0;
        padding: 8px 16px;
        background: #f1f5f9;
        border-radius: 0 8px 8px 0;
        color: #475569;
      }

      .chat-assistant-message blockquote p {
        margin: 0;
      }

      .chat-code-block {
        background: #1e293b;
        color: #e2e8f0;
        padding: 12px 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 12px 0;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.5;
      }

      .chat-code-block code {
        background: none !important;
        padding: 0 !important;
        color: inherit !important;
        font-size: inherit;
      }

      .chat-inline-code {
        background: #e2e8f0;
        color: #be185d;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Consolas', monospace;
        font-size: 0.9em;
      }

      .chat-link {
        color: #2563eb;
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;
      }

      .chat-link:hover {
        border-bottom-color: #2563eb;
      }

      .chat-hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 16px 0;
      }

      .chat-table-wrapper {
        overflow-x: auto;
        margin: 12px 0;
      }

      .chat-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }

      .chat-table th,
      .chat-table td {
        border: 1px solid #e2e8f0;
        padding: 8px 12px;
        text-align: left;
      }

      .chat-table th {
        background: #f1f5f9;
        font-weight: 600;
      }

      .chat-table tr:nth-child(even) {
        background: #fafbfc;
      }

      .chat-streaming-cursor {
        display: inline-block;
        animation: blink 1s step-end infinite;
        color: #667eea;
        font-weight: bold;
      }

      @keyframes blink {
        50% { opacity: 0; }
      }

      .chat-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        margin-right: 10%;
      }

      .chat-loading-dots {
        display: flex;
        gap: 4px;
      }

      .chat-loading-dots span {
        width: 8px;
        height: 8px;
        background: #667eea;
        border-radius: 50%;
        animation: chatBounce 1.4s infinite ease-in-out both;
      }

      .chat-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .chat-loading-dots span:nth-child(2) { animation-delay: -0.16s; }
      .chat-loading-dots span:nth-child(3) { animation-delay: 0s; }

      @keyframes chatBounce {
        0%, 80%, 100% {
          transform: scale(0.6);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .chat-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 12px 16px;
        border-radius: 12px;
        margin-right: 10%;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .chat-action-buttons {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      }

      .chat-action-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #e2e8f0;
        color: #475569;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .chat-action-button:hover {
        background: #cbd5e1;
        color: #1e293b;
      }

      .chat-action-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .chat-action-button.chat-action-success {
        background: #dcfce7;
        color: #16a34a;
      }

      .chat-action-button.chat-action-error {
        background: #fef2f2;
        color: #dc2626;
      }

      .chat-copy-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #e2e8f0;
        color: #475569;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .chat-copy-button:hover {
        background: #cbd5e1;
        color: #1e293b;
      }

      .chat-list {
        margin: 8px 0;
        padding-left: 24px;
      }

      .chat-list-ordered {
        list-style-type: decimal;
      }

      .chat-list-item {
        margin-bottom: 4px;
        line-height: 1.5;
      }

      .chat-heading {
        margin: 16px 0 8px 0;
        font-weight: 600;
        line-height: 1.3;
      }

      .chat-heading:first-child {
        margin-top: 0;
      }

      .chat-paragraph {
        margin: 0 0 12px 0;
        line-height: 1.6;
      }

      .chat-paragraph:last-child {
        margin-bottom: 0;
      }

      /* Task list styles (GFM) */
      .chat-assistant-message input[type="checkbox"] {
        margin-right: 8px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get or create a React root for a container
   */
  private static getRoot(container: HTMLElement): Root {
    let root = containerRoots.get(container);
    if (!root) {
      root = createRoot(container);
      containerRoots.set(container, root);
    }
    return root;
  }

  /**
   * Clean up a container's React root
   */
  public static cleanup(container: HTMLElement): void {
    const root = containerRoots.get(container);
    if (root) {
      root.unmount();
      containerRoots.delete(container);
    }
  }

  /**
   * Show loading state for chat response
   */
  public static showLoadingState(container: HTMLElement): void {
    this.createStyles();
    container.innerHTML = '';

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "chat-loading chat-message-container";
    loadingDiv.innerHTML = `
      <div class="chat-loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span style="color: #64748b; font-size: 14px;">Thinking...</span>
    `;

    container.appendChild(loadingDiv);
  }

  /**
   * Show streaming response (updates as content comes in)
   * Uses React for proper markdown rendering
   */
  public static renderStreamingResponse(container: HTMLElement, content: string): void {
    this.createStyles();

    // Find or create the message wrapper
    let messageWrapper = container.querySelector('.chat-streaming-wrapper') as HTMLElement;
    if (!messageWrapper) {
      container.innerHTML = '';
      messageWrapper = document.createElement("div");
      messageWrapper.className = "chat-streaming-wrapper";
      container.appendChild(messageWrapper);
    }

    // Render the React component
    const root = this.getRoot(messageWrapper);
    root.render(createElement(ChatMessage, { content, role: "assistant", isStreaming: true }));
  }

  /**
   * Render final response with React markdown
   * @param container - The container element to render into
   * @param content - The markdown content to render
   * @param onAddToComments - Optional callback to add content as a GitLab comment
   */
  public static renderResponse(
    container: HTMLElement,
    content: string,
    onAddToComments?: (content: string) => Promise<{ success: boolean; noteUrl?: string; error?: string }>
  ): void {
    this.createStyles();
    container.innerHTML = '';

    const messageWrapper = document.createElement("div");
    messageWrapper.className = "chat-response-wrapper";
    container.appendChild(messageWrapper);

    // Render the React component
    const root = this.getRoot(messageWrapper);
    root.render(createElement(ChatMessage, { content, role: "assistant", isStreaming: false }));

    // Add action buttons after the message
    setTimeout(() => {
      const assistantMessage = container.querySelector('.chat-assistant-message');
      if (assistantMessage && !assistantMessage.querySelector('.chat-action-buttons')) {
        const actionsContainer = document.createElement("div");
        actionsContainer.className = "chat-action-buttons";

        // Copy button
        const copyButton = document.createElement("button");
        copyButton.className = "chat-action-button";
        copyButton.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        `;
        copyButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(content);
            copyButton.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            `;
            copyButton.classList.add("chat-action-success");
            setTimeout(() => {
              copyButton.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              `;
              copyButton.classList.remove("chat-action-success");
            }, 2000);
          } catch {
            copyButton.innerHTML = "Failed";
            copyButton.classList.add("chat-action-error");
          }
        });
        actionsContainer.appendChild(copyButton);

        // Insert to comment box button (if callback provided)
        if (onAddToComments) {
          const insertButton = document.createElement("button");
          insertButton.className = "chat-action-button";
          insertButton.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="8" x2="12" y2="14"/>
              <line x1="9" y1="11" x2="15" y2="11"/>
            </svg>
            Insert to comment
          `;
          insertButton.title = "Insert this response into the issue comment box for review";
          insertButton.addEventListener("click", async () => {
            insertButton.disabled = true;
            insertButton.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" style="animation: spin 1s linear infinite; transform-origin: center;"/>
              </svg>
              Inserting...
            `;

            try {
              const result = await onAddToComments(content);
              if (result.success) {
                insertButton.innerHTML = `
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Inserted!
                `;
                insertButton.classList.add("chat-action-success");

                // Reset button after a short delay
                setTimeout(() => {
                  insertButton.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="8" x2="12" y2="14"/>
                      <line x1="9" y1="11" x2="15" y2="11"/>
                    </svg>
                    Insert to comment
                  `;
                  insertButton.classList.remove("chat-action-success");
                  insertButton.disabled = false;
                }, 2000);
              } else {
                insertButton.innerHTML = `
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Failed
                `;
                insertButton.classList.add("chat-action-error");
                insertButton.disabled = false;
                insertButton.title = result.error || "Failed to insert into comment box";

                // Reset after delay
                setTimeout(() => {
                  insertButton.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="8" x2="12" y2="14"/>
                      <line x1="9" y1="11" x2="15" y2="11"/>
                    </svg>
                    Insert to comment
                  `;
                  insertButton.classList.remove("chat-action-error");
                  insertButton.title = "Insert this response into the issue comment box for review";
                }, 3000);
              }
            } catch (error: any) {
              insertButton.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Failed
              `;
              insertButton.classList.add("chat-action-error");
              insertButton.disabled = false;
              insertButton.title = error.message || "Unknown error";
            }
          });
          actionsContainer.appendChild(insertButton);
        }

        assistantMessage.appendChild(actionsContainer);
      }
    }, 100);
  }

  /**
   * Render user message using React
   */
  public static renderUserMessage(container: HTMLElement, message: string): void {
    this.createStyles();

    const messageWrapper = document.createElement("div");
    messageWrapper.className = "chat-user-wrapper";
    container.appendChild(messageWrapper);

    const root = this.getRoot(messageWrapper);
    root.render(createElement(ChatMessage, { content: message, role: "user" }));
  }

  /**
   * Show error state
   */
  public static showErrorState(container: HTMLElement, error: string): void {
    this.createStyles();
    container.innerHTML = '';

    const errorDiv = document.createElement("div");
    errorDiv.className = "chat-error chat-message-container";
    errorDiv.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <span>${error}</span>
    `;

    container.appendChild(errorDiv);
  }
}
