/* eslint-disable @typescript-eslint/no-redeclare */
/**
 * Base LLM module - Contains shared functionality for all LLM providers
 * This consolidates common code patterns used across OpenAI, Claude, DeepSeek, and Ollama
 */

import { getUserRole } from "../index";
import { DEFAULT_USER_ROLE, UserRoleType } from "../constants";

// ============================================================================
// Types
// ============================================================================

export interface LLMConfig {
  provider: string;
  apiUrl: string;
  model: string;
  apiKey?: string;
}

export interface StreamHandlerOptions {
  onProgress?: (content: string) => void;
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
  progressInterval?: number;
}

// ============================================================================
// User Role Utilities
// ============================================================================

/**
 * Get the current user role from storage
 * Falls back to default role if not set
 */
export async function getCurrentUserRole(): Promise<UserRoleType> {
  const role = await getUserRole();
  return (role as UserRoleType) || DEFAULT_USER_ROLE;
}

// ============================================================================
// UI Component Builders
// ============================================================================

/**
 * Create a model info banner element
 */
export function createModelBanner(provider: string, model: string): HTMLElement {
  const banner = document.createElement("div");
  banner.className = "ai-model-banner";
  banner.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    margin-bottom: 16px;
    color: white;
    font-size: 0.85rem;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  `;
  banner.innerHTML = `
    <span style="display: inline-flex; animation: pulse 1.5s infinite;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    </span>
    <span>Generating summary with <strong>${provider.charAt(0).toUpperCase() + provider.slice(1)}</strong> (${model})...</span>
  `;
  return banner;
}

/**
 * Create a loading response container
 */
export function createLoadingContainer(): HTMLElement {
  const container = document.createElement("div");
  container.className = "ai-response-container";
  container.style.cssText = `
    color: #1a1a2e;
    font-size: 0.9rem;
    line-height: 1.7;
    padding: 0;
    min-height: 60px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  `;
  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; color: #666;">
      <div class="loading-dots" style="display: flex; gap: 4px;">
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></span>
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></span>
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></span>
      </div>
      <span>Analyzing issue and discussions...</span>
    </div>
  `;
  return container;
}

/**
 * Update banner to show completion state
 */
export function showBannerComplete(banner: HTMLElement, message: string): void {
  banner.style.background = "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
  banner.style.boxShadow = "0 2px 8px rgba(17, 153, 142, 0.3)";
  banner.innerHTML = `
    <span style="display: inline-flex;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </span>
    <span>${message}</span>
  `;
}

/**
 * Update banner to show error state
 */
export function showBannerError(banner: HTMLElement, message: string): void {
  banner.style.background = "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)";
  banner.style.boxShadow = "0 2px 8px rgba(235, 51, 73, 0.3)";
  banner.innerHTML = `
    <span style="display: inline-flex;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    </span>
    <span>${message}</span>
  `;
}

/**
 * Create an error container element
 */
export function createErrorContainer(provider: string): HTMLElement {
  const container = document.createElement("div");
  container.style.cssText = `
    border: 1px solid #dc3545;
    border-radius: 8px;
    padding: 16px;
    background-color: #f8d7da;
    margin: 16px 0;
  `;
  container.innerHTML = `
    <h4 style="margin: 0 0 8px 0; color: #721c24;">Error Processing Review</h4>
    <p style="margin: 0; color: #721c24;">
      Failed to get code review from ${provider}. Please try again.
    </p>
  `;
  return container;
}

// ============================================================================
// Response Content Processing
// ============================================================================

/**
 * Clean response content by removing markdown code blocks
 */
export function cleanResponseContent(content: string): string {
  return content
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();
}

/**
 * Update response container with content
 */
export function updateResponseContainer(container: HTMLElement, content: string): void {
  container.style.opacity = "1";
  container.innerHTML = cleanResponseContent(content);
}

// ============================================================================
// Stream Parsing Utilities
// ============================================================================

/**
 * Parse OpenAI-format streaming response chunk
 * Used by OpenAI, DeepSeek (OpenAI-compatible API)
 */
export function parseOpenAIStreamChunk(data: string): string | null {
  if (!data.startsWith("data: ")) return null;

  try {
    const jsonResponse = JSON.parse(data.substring(6));
    return jsonResponse.choices?.[0]?.delta?.content || null;
  } catch {
    return null;
  }
}

/**
 * Parse Claude streaming response chunk
 */
export function parseClaudeStreamChunk(data: string): string | null {
  if (data.includes("event: content_block_delta")) return null;
  if (!data.startsWith("data: ")) return null;

  try {
    const jsonData = JSON.parse(data.substring(6));
    if (jsonData.type === "content_block_delta" && jsonData.delta?.text) {
      return jsonData.delta.text;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse Ollama streaming response chunk
 */
export function parseOllamaStreamChunk(line: string): { content: string | null; done: boolean } {
  try {
    const jsonResponse = JSON.parse(line);
    return {
      content: jsonResponse.message?.content || null,
      done: jsonResponse.done || false,
    };
  } catch {
    return { content: null, done: false };
  }
}

// ============================================================================
// Claude Message Transformation
// ============================================================================

/**
 * Transform standard messages format to Claude format
 * Extracts system message and converts user/assistant messages
 */
export function transformMessagesForClaude(messages: any[]): { system: string; messages: any[] } {
  let system = "";
  const claudeMessages = messages
    .map((msg: any) => {
      if (msg.role === "system") {
        system += msg.content;
        return null;
      } else if (msg.role === "user") {
        return { role: "user", content: msg.content };
      } else if (msg.role === "assistant") {
        return { role: "assistant", content: msg.content };
      }
      return null;
    })
    .filter(Boolean);

  return { system, messages: claudeMessages };
}

// ============================================================================
// Request Builders
// ============================================================================

/**
 * Build OpenAI API request options
 */
export function buildOpenAIRequest(apiKey: string, model: string, messages: any[], stream = true): RequestInit {
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
    }),
  };
}

/**
 * Build Claude API request options
 */
export function buildClaudeRequest(apiKey: string, model: string, system: string, messages: any[], stream = true): RequestInit {
  return {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      system,
      messages,
      stream,
      max_tokens: 4000,
    }),
  };
}

// ============================================================================
// Generic Stream Handler
// ============================================================================

/**
 * Handle streaming response with progressive updates
 * Returns the final response content
 */
export async function handleStreamingResponse(
  response: Response,
  parseChunk: (data: string) => string | null,
  options: StreamHandlerOptions = {}
): Promise<string> {
  const { onProgress, onComplete, progressInterval = 1000 } = options;

  const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
  if (!reader) throw new Error("Failed to get response reader");

  let responseContent = "";
  let lastUpdateTime = Date.now();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = value.split("\n");
    for (const line of lines) {
      if (line.length === 0 || line.startsWith(":")) continue;
      if (line === "data: [DONE]") {
        onComplete?.(responseContent.trim());
        return responseContent.trim();
      }

      const content = parseChunk(line);
      if (content) {
        responseContent += content;

        const now = Date.now();
        if (now - lastUpdateTime > progressInterval || responseContent.length < 100) {
          onProgress?.(responseContent);
          lastUpdateTime = now;
        }
      }
    }
  }

  onComplete?.(responseContent.trim());
  return responseContent.trim();
}

