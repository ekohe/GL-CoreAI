/* eslint-disable @typescript-eslint/no-redeclare */

import { getDeepSeekApiKey, getDeepSeekModel } from "./../index";
import { taskPrompts, codeReviewPrompts } from "./../prompts/index";
import { aiGeneratedSummaries, splitString } from "./../tools";
import { CodeReviewRenderer } from "../codeReviewRenderer";
import { DEFAULT_AI_MODELS } from "../constants";

const aiProvider = "deepseek";
const aIApiUrl = "https://api.deepseek.com/v1/chat/completions";

async function fetchLLMTaskSummarizer(
  issueDetails: any,
  issueData: any,
  discussions: any
) {
  const personalAIApiKey = await getDeepSeekApiKey();
  if (!personalAIApiKey) return;

  const model = (await getDeepSeekModel()) || "";
  // Generate messages prompt
  const messages = taskPrompts.getPrompt(issueData, discussions);

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
  const responseSection = document.createElement("div");
  responseSection.className = "ai-response-container";
  responseSection.style.cssText = `
    color: #1a1a2e;
    font-size: 0.9rem;
    line-height: 1.7;
    padding: 0;
    min-height: 60px;
    opacity: 0.7;
    transition: opacity 0.3s ease;
  `;
  responseSection.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px; color: #666;">
      <div class="loading-dots" style="display: flex; gap: 4px;">
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></span>
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></span>
        <span style="width: 6px; height: 6px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></span>
      </div>
      <span>Analyzing issue and discussions...</span>
    </div>
  `;
  issueDetails.current.appendChild(responseSection);

  try {
    let response: any;
    response = await fetch(aIApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${personalAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    // Check if the response is not OK
    if (!response.ok) {
      throw new Error("Error calling LLM API");
    }

    // Get a reader for the response body stream
    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
    if (!reader) return;

    let responseContent = "";
    let accumulatedChunk = "";
    const maxRetries = 5;
    let retryCount = 0;

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
          responseSection.style.opacity = "1";
          return responseContent.trim(); // End of stream
        }

        accumulatedChunk += data;

        // Parse the JSON response incrementally
        try {
          const jsonResponse = JSON.parse(accumulatedChunk.split("data: ")[1]);
          const deltaContent = jsonResponse.choices[0].delta.content;
          if (deltaContent) {
            responseContent += deltaContent;
            // Update the DOM with the content, trimming backticks and HTML
            responseSection.style.opacity = "1";
            responseSection.innerHTML = responseContent
              .replace(/```html/g, "")
              .replace(/```/g, "")
              .trim();
          }
          // Reset accumulatedChunk and retryCount after successful parse
          accumulatedChunk = "";
          retryCount = 0;
        } catch (e) {
          // Increment retry count and pause before retrying
          retryCount++;
          if (retryCount > maxRetries) {
            // Attempt to parse the accumulated chunks as a whole
            try {
              const jsonResponse = JSON.parse(
                accumulatedChunk.split("data: ")[1]
              );
              const deltaContent = jsonResponse.choices[0].delta.content;
              if (deltaContent) {
                responseContent += deltaContent;

                responseSection.innerHTML = responseContent
                  .replace(/```html/g, "")
                  .replace(/```/g, "")
                  .trim();
              }
            } catch (finalError) {
              throw new Error("Error parsing accumulated JSON response");
            }
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 100)); // Pause for 100ms before retrying
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
    responseSection.innerHTML = "";
  }
}

async function invokingCodeAnalysis(issueDetails: any, diffsData: any) {
  const personalAIApiKey = await getDeepSeekApiKey();
  if (!personalAIApiKey) return;

  const model = (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;

  // Generate messages prompt
  const messages = codeReviewPrompts.getPrompt(diffsData);

  // Create main container
  const mainContainer = document.createElement("div");
  issueDetails.current.appendChild(mainContainer);

  // Show initial loading state
    CodeReviewRenderer.showLoadingState(mainContainer);

  try {
    // Call the LLM API
    const response = await fetch(aIApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${personalAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    // Check if the response is not OK
    if (!response.ok) {
      throw new Error("Error calling LLM API");
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
          if (data.startsWith("data: ")) {
            const jsonResponse = JSON.parse(data.substring(6));
            const deltaContent = jsonResponse.choices?.[0]?.delta?.content;

            if (deltaContent) {
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
        Failed to get code review from DeepSeek. Please try again.
      </p>
    `;
    mainContainer.appendChild(errorContainer);
  }
}

export { fetchLLMTaskSummarizer, invokingCodeAnalysis };
