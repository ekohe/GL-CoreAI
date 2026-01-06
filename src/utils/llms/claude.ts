/* eslint-disable @typescript-eslint/no-redeclare */

import { getClaudeApiKey, getClaudeModel } from "./../index";
import { taskPrompts, codeReviewPrompts, mergeRequestActionsPrompts, issueActionsPrompts, issueChatPrompts } from "./../prompts/index";
import { aiGeneratedSummaries } from "./../tools";
import { CodeReviewRenderer } from "../codeReviewRenderer";
import { MRActionsRenderer } from "../mrActionsRenderer";
import { IssueActionsRenderer } from "../issueActionsRenderer";
import { IssueChatRenderer } from "../issueChatRenderer";
import { DEFAULT_AI_MODELS, MRActionType, IssueActionType } from "../constants";
import {
  getCurrentUserRole,
  createModelBanner,
  createLoadingContainer,
  showBannerComplete,
  showBannerError,
  updateResponseContainer,
  transformMessagesForClaude,
  createErrorContainer,
} from "./base";
import type { ChatContext } from "./index";

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

  // Create UI elements using shared base functions
  const urlSection = createModelBanner(aiProvider, model);
  issueDetails.current.appendChild(urlSection);

  const responseContainer = createLoadingContainer();
  issueDetails.current.appendChild(responseContainer);

  try {
    // Transform messages for Claude format using shared utility
    const { system, messages: claudeMessages } = transformMessagesForClaude(messages);

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
          showBannerComplete(urlSection, aiGeneratedSummaries(aiProvider, model));
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

              // Update the DOM with new content using shared utility
              updateResponseContainer(responseContainer, responseContent);
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
    showBannerError(urlSection, "Failed to generate summary. Please check your API key and try again.");
    responseContainer.innerHTML = "";
  }
}

async function invokingCodeAnalysis(issueDetails: any, diffsData: any) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
  const messages = codeReviewPrompts.getPrompt(diffsData);

  // Create main container
  const mainContainer = document.createElement("div");
  issueDetails.current.appendChild(mainContainer);

  // Show initial loading state
  CodeReviewRenderer.showLoadingState(mainContainer);

  try {
    // Transform messages for Claude format using shared utility
    const { system, messages: claudeMessages } = transformMessagesForClaude(messages);

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

    // Show error message using the shared error container
    mainContainer.appendChild(createErrorContainer("Claude"));
  }
}

async function invokingMRAction(containerRef: any, diffsData: any, actionType: MRActionType) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
  const messages = mergeRequestActionsPrompts.getPrompt(diffsData, actionType);

  // Create main container
  const mainContainer = document.createElement("div");
  containerRef.current.appendChild(mainContainer);

  // Show initial loading state
  MRActionsRenderer.showLoadingState(mainContainer, actionType);

  try {
    // Transform messages for Claude format using shared utility
    const { system, messages: claudeMessages } = transformMessagesForClaude(messages);

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
          MRActionsRenderer.render(mainContainer, responseContent.trim(), actionType);
          return responseContent.trim();
        }

        // Parse the JSON response incrementally
        try {
          if (data.includes("event: content_block_delta")) {
            continue;
          }

          if (data.startsWith("data: ")) {
            const jsonData = JSON.parse(data.substring(6));

            if (
              jsonData.type === "content_block_delta" &&
              jsonData.delta &&
              jsonData.delta.text
            ) {
              const deltaContent = jsonData.delta.text;
              responseContent += deltaContent;

              // Update progressively
              const now = Date.now();
              if (now - lastUpdateTime > 1000 || responseContent.length < 100) {
                if (MRActionsRenderer.isCompleteJSON(responseContent.trim())) {
                  MRActionsRenderer.render(mainContainer, responseContent.trim(), actionType);
                  return responseContent.trim();
                } else {
                  MRActionsRenderer.showProgressState(mainContainer, responseContent.trim());
                }
                lastUpdateTime = now;
              }
            }
          }
        } catch (error) {
          continue;
        }
      }
    }

    // Final render
    MRActionsRenderer.render(mainContainer, responseContent.trim(), actionType);

    return responseContent.trim();
  } catch (error) {
    MRActionsRenderer.showErrorState(mainContainer, "Failed to get response from Claude. Please try again.");
  }
}

async function invokingIssueAction(containerRef: any, issueData: any, discussions: any, actionType: IssueActionType) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;

  // Get user role for role-based prompts
  const userRole = await getCurrentUserRole();

  // Generate messages prompt for the specific action type with user role
  const messages = issueActionsPrompts.getPrompt(issueData, discussions, actionType, userRole);

  const mainContainer = document.createElement("div");
  containerRef.current.appendChild(mainContainer);

  IssueActionsRenderer.showLoadingState(mainContainer, actionType);

  try {
    // Transform messages for Claude format using shared utility
    const { system, messages: claudeMessages } = transformMessagesForClaude(messages);

    const requestBody = {
      model: model,
      system: system,
      messages: claudeMessages,
      stream: true,
      max_tokens: 4000,
    };

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

    if (!response.ok) {
      throw new Error("Error calling Claude API");
    }

    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
    if (!reader) return;

    let responseContent = "";
    let lastUpdateTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const arr = value.split("\n");
      for (const data of arr) {
        if (data.length === 0 || data.startsWith(":")) continue;
        if (data === "data: [DONE]") {
          IssueActionsRenderer.render(mainContainer, responseContent.trim(), actionType);
          return responseContent.trim();
        }

        try {
          if (data.includes("event: content_block_delta")) {
            continue;
          }

          if (data.startsWith("data: ")) {
            const jsonData = JSON.parse(data.substring(6));

            if (
              jsonData.type === "content_block_delta" &&
              jsonData.delta &&
              jsonData.delta.text
            ) {
              const deltaContent = jsonData.delta.text;
              responseContent += deltaContent;

              const now = Date.now();
              if (now - lastUpdateTime > 1000 || responseContent.length < 100) {
                if (IssueActionsRenderer.isCompleteJSON(responseContent.trim())) {
                  IssueActionsRenderer.render(mainContainer, responseContent.trim(), actionType);
                  return responseContent.trim();
                } else {
                  IssueActionsRenderer.showProgressState(mainContainer, responseContent.trim());
                }
                lastUpdateTime = now;
              }
            }
          }
        } catch (error) {
          continue;
        }
      }
    }

    IssueActionsRenderer.render(mainContainer, responseContent.trim(), actionType);
    return responseContent.trim();
  } catch (error) {
    IssueActionsRenderer.showErrorState(mainContainer, "Failed to get response from Claude. Please try again.");
  }
}

async function invokingIssueChat(
  containerRef: any,
  userQuery: string,
  chatContext: ChatContext,
  onComplete?: (response: string) => void,
  onAddToComments?: (content: string) => Promise<{ success: boolean; noteUrl?: string; error?: string }>
) {
  const personalAIApiKey = await getClaudeApiKey();
  if (!personalAIApiKey) return;

  const model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
  const userRole = await getCurrentUserRole();

  const messages = issueChatPrompts.getChatPrompt(userQuery, {
    issueData: chatContext.issueData,
    discussions: chatContext.discussions,
    previousResponse: chatContext.previousResponse,
    conversationHistory: chatContext.conversationHistory,
    currentUser: chatContext.currentUser,
  }, userRole);

  const messageContainer = document.createElement("div");
  containerRef.current.appendChild(messageContainer);

  IssueChatRenderer.showLoadingState(messageContainer);

  try {
    const { system, messages: claudeMessages } = transformMessagesForClaude(messages);

    const requestBody = {
      model: model,
      system: system,
      messages: claudeMessages,
      stream: true,
      max_tokens: 4000,
    };

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

    if (!response.ok) {
      throw new Error("Error calling Claude API");
    }

    const reader = response.body
      ?.pipeThrough(new TextDecoderStream())
      .getReader();
    if (!reader) return;

    let responseContent = "";
    let lastUpdateTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const arr = value.split("\n");
      for (const data of arr) {
        if (data.length === 0 || data.startsWith(":")) continue;
        if (data === "data: [DONE]") {
          IssueChatRenderer.renderResponse(messageContainer, responseContent.trim(), onAddToComments);
          onComplete?.(responseContent.trim());
          return responseContent.trim();
        }

        try {
          if (data.includes("event: content_block_delta")) {
            continue;
          }

          if (data.startsWith("data: ")) {
            const jsonData = JSON.parse(data.substring(6));

            if (
              jsonData.type === "content_block_delta" &&
              jsonData.delta &&
              jsonData.delta.text
            ) {
              const deltaContent = jsonData.delta.text;
              responseContent += deltaContent;

              const now = Date.now();
              if (now - lastUpdateTime > 300 || responseContent.length < 50) {
                IssueChatRenderer.renderStreamingResponse(messageContainer, responseContent);
                lastUpdateTime = now;
              }
            }
          }
        } catch (error) {
          continue;
        }
      }
    }

    IssueChatRenderer.renderResponse(messageContainer, responseContent.trim(), onAddToComments);
    onComplete?.(responseContent.trim());
    return responseContent.trim();
  } catch (error) {
    IssueChatRenderer.showErrorState(messageContainer, "Failed to get response from Claude. Please try again.");
  }
}

export { fetchLLMTaskSummarizer, invokingCodeAnalysis, invokingMRAction, invokingIssueAction, invokingIssueChat };