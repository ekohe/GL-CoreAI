/* eslint-disable @typescript-eslint/no-redeclare */

import { getClaudeApiKey, getClaudeModel } from "./../index";
import { taskPrompts, codeReviewPrompts } from "./../prompts/index";
import { aiGeneratedSummaries } from "./../tools";
import { CodeReviewRenderer } from "../codeReviewRenderer";
import { DEFAULT_AI_MODELS } from "../constants";

const aiProvider = "claude";
const aIApiUrl = "https://api.anthropic.com/v1/messages";

async function fetchLLMTaskSummarizer(
  issueDetails: any,
  issueData: any,
  discussions: any
) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
  const messages = taskPrompts.getPrompt(issueData, discussions);
  let system = "";

  // Create model info banner
  const urlSection = document.createElement("div");
  urlSection.className = "ai-model-banner";
  urlSection.style.cssText = `
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
  urlSection.innerHTML = `
    <span style="display: inline-flex; animation: pulse 1.5s infinite;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    </span>
    <span>Generating summary with <strong>${aiProvider.charAt(0).toUpperCase() + aiProvider.slice(1)}</strong> (${model})...</span>
  `;
  issueDetails.current.appendChild(urlSection);

  // Create response container with better styling
  const responseContainer = document.createElement("div");
  responseContainer.className = "ai-response-container";
  responseContainer.style.cssText = `
    color: #1a1a2e;
    font-size: 0.9rem;
    line-height: 1.7;
    padding: 0;
    min-height: 60px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  `;
  responseContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; color: #666;">
      <div class="loading-dots" style="display: flex; gap: 4px;">
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></span>
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></span>
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></span>
      </div>
      <span>Analyzing issue and discussions...</span>
    </div>
  `;
  issueDetails.current.appendChild(responseContainer);

  try {
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

    const requestBody = {
      model: model,
      system: system,
      messages: claudeMessages,
      stream: true,
      max_tokens: 4000,
    };

    // Call the LLM API
    const response = await fetch(aIApiUrl, {
      method: "POST",
      headers: {
        "x-api-key": personalAIApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is not OK
    if (!response.ok) {
      throw new Error("Error calling Claude API");
    }

    // Get a reader for the response body stream
    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
    if (!reader) return;

    let responseContent = "";

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Split the stream data by new lines
      const arr = value.split("\n");
      for (const data of arr) {
        // Ignore empty or comment messages
        if (data.length === 0 || data.startsWith(":")) continue;
        if (data === "data: [DONE]") {
          // Update the banner to show completion
          urlSection.style.background = "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)";
          urlSection.style.boxShadow = "0 2px 8px rgba(17, 153, 142, 0.3)";
          urlSection.innerHTML = `
            <span style="display: inline-flex;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <span>${aiGeneratedSummaries(aiProvider, model)}</span>
          `;
          responseContainer.style.opacity = "1";
          return responseContent.trim(); // End of stream
        }

        // Parse the JSON response incrementally
        try {
          // Claude's streaming format is different from OpenAI's
          // It uses "event: content_block_delta" and "data: {"type":"content_block_delta",...}"
          if (data.includes("event: content_block_delta")) {
            continue; // Skip the event line and process the data line
          }

          if (data.startsWith("data: ")) {
            const jsonData = JSON.parse(data.substring(6)); // Remove "data: " prefix

            if (
              jsonData.type === "content_block_delta" &&
              jsonData.delta &&
              jsonData.delta.text
            ) {
              const deltaContent = jsonData.delta.text;
              responseContent += deltaContent;

              // Update the DOM with new content
              responseContainer.style.opacity = "1";
              responseContainer.innerHTML = responseContent
                .replace(/```html/g, "")
                .replace(/```/g, "")
                .trim();
            }
          }
        } catch (error) {
          // Continue reading even if there's a parsing error
          continue;
        }
      }
    }

    return responseContent.trim();
  } catch (error) {

    // Show error state in the banner
    urlSection.style.background = "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)";
    urlSection.style.boxShadow = "0 2px 8px rgba(235, 51, 73, 0.3)";
    urlSection.innerHTML = `
      <span style="display: inline-flex;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </span>
      <span>Failed to generate summary. Please check your API key and try again.</span>
    `;
    responseContainer.innerHTML = "";
  }
}

async function invokingCodeAnalysis(issueDetails: any, diffsData: any) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
  const messages = codeReviewPrompts.getPrompt(diffsData);
  let system = "";

  // Create main container
  const mainContainer = document.createElement("div");
  issueDetails.current.appendChild(mainContainer);

  // Show initial loading state
    CodeReviewRenderer.showLoadingState(mainContainer);

  try {
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

    const requestBody = {
      model: model,
      system: system,
      messages: claudeMessages,
      stream: true,
      max_tokens: 4000,
    };

    // Call the LLM API
    const response = await fetch(aIApiUrl, {
      method: "POST",
      headers: {
        "x-api-key": personalAIApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if the response is not OK
    if (!response.ok) {
      throw new Error("Error calling Claude API");
    }

    // Get a reader for the response body stream
    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
    if (!reader) return;

    let responseContent = "";
    let lastUpdateTime = Date.now();

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Split the stream data by new lines
      const arr = value.split("\n");
      for (const data of arr) {
        // Ignore empty or comment messages
        if (data.length === 0 || data.startsWith(":")) continue;
        if (data === "data: [DONE]") {
          // Use the shared renderer when stream is done
                CodeReviewRenderer.renderCodeReview(mainContainer, responseContent.trim());
                return responseContent.trim();
        }

        // Parse the JSON response incrementally
        try {
          // Claude's streaming format
          if (data.includes("event: content_block_delta")) {
            continue; // Skip the event line and process the data line
          }

          if (data.startsWith("data: ")) {
            const jsonData = JSON.parse(data.substring(6)); // Remove "data: " prefix

            if (
              jsonData.type === "content_block_delta" &&
              jsonData.delta &&
              jsonData.delta.text
            ) {
              const deltaContent = jsonData.delta.text;
              responseContent += deltaContent;

              // Update progressively (every 1000ms to avoid too frequent updates)
              const now = Date.now();
              if (now - lastUpdateTime > 1000 || responseContent.length < 100) {
                if (CodeReviewRenderer.isCompleteJSON(responseContent.trim())) {
                  CodeReviewRenderer.renderCodeReview(mainContainer, responseContent.trim());
                  return responseContent.trim();
                } else {
                  CodeReviewRenderer.showProgressiveState(mainContainer, responseContent.trim());
                }
                lastUpdateTime = now;
              }
            }
          }
        } catch (error) {
          // Continue reading stream
          continue;
        }
      }
    }

    // Final render
        CodeReviewRenderer.renderCodeReview(mainContainer, responseContent.trim());

    return responseContent.trim();
  } catch (error) {

    // Show error message using the renderer
    const errorContainer = document.createElement("div");
    errorContainer.style.cssText = `
      border: 1px solid #dc3545;
      border-radius: 8px;
      padding: 16px;
      background-color: #f8d7da;
      margin: 16px 0;
    `;
    errorContainer.innerHTML = `
      <h4 style="margin: 0 0 8px 0; color: #721c24;">Error Processing Review</h4>
      <p style="margin: 0; color: #721c24;">
        Failed to get code review from Claude. Please try again.
      </p>
    `;
    mainContainer.appendChild(errorContainer);
  }
}

export { fetchLLMTaskSummarizer, invokingCodeAnalysis };