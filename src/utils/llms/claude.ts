/* eslint-disable @typescript-eslint/no-redeclare */

import { getClaudeApiKey, getClaudeModel } from "./../index";
import { taskPrompts, codeReviewPrompts } from "./../prompts/index";
import { aiGeneratedSummaries } from "./../tools";
import { CodeReviewRenderer } from "../codeReviewRenderer";

const aiProvider = "claude";
const aIApiUrl = "https://api.anthropic.com/v1/messages";

async function fetchLLMTaskSummarizer(
  issueDetails: any,
  issueData: any,
  discussions: any
) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || "claude-3-opus-20240229";
  const messages = taskPrompts.getPrompt(issueData, discussions);
  let system = "";

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

    // Create a response container for streaming
    const responseContainer = document.createElement("div");
    responseContainer.style.whiteSpace = "pre-wrap";
    responseContainer.style.fontSize = "16px";
    responseContainer.style.fontFamily =
      "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    responseContainer.style.lineHeight = "1.6";
    responseContainer.style.color = "#333";
    responseContainer.style.backgroundColor = "#f8f9fa";
    responseContainer.style.padding = "20px";
    responseContainer.style.borderRadius = "8px";
    responseContainer.style.margin = "10px 0";
    issueDetails.current.appendChild(responseContainer);

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
          // Update the DOM when the stream is done
          responseContainer.textContent = responseContent.trim();
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
              responseContainer.textContent = responseContent;
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
    console.log(`Error fetching data from ${aiProvider}:`, error);
  }
}

async function invokingCodeAnalysis(issueDetails: any, diffsData: any) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || "claude-3-opus-20240229";
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
    console.log(`Error fetching data from ${aiProvider}:`, error);

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