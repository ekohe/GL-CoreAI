/* eslint-disable @typescript-eslint/no-redeclare */

import { getDeepSeekApiKey, getDeepSeekModel } from "./../index";
import { taskPrompts, codeReviewPrompts, mergeRequestActionsPrompts, issueActionsPrompts, issueChatPrompts } from "./../prompts/index";
import { aiGeneratedSummaries } from "./../tools";
import { CodeReviewRenderer } from "../codeReviewRenderer";
import { MRActionsRenderer } from "../mrActionsRenderer";
import { IssueActionsRenderer } from "../issueActionsRenderer";
import { IssueChatRenderer } from "../issueChatRenderer";
import { DEFAULT_AI_MODELS, MRActionType, IssueActionType } from "../constants";
import {
  getUserOccupation,
  createModelBanner,
  createLoadingContainer,
  showBannerComplete,
  showBannerError,
  updateResponseContainer,
  createErrorContainer,
} from "./base";
import type { ChatContext } from "./index";

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

  // Create UI elements using shared base functions
  const urlSection = createModelBanner(aiProvider, model);
  issueDetails.current.appendChild(urlSection);

  const responseSection = createLoadingContainer();
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
          showBannerComplete(urlSection, aiGeneratedSummaries(aiProvider, model));
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
            // Update the DOM with the content using shared utility
            updateResponseContainer(responseSection, responseContent);
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
                updateResponseContainer(responseSection, responseContent);
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
    showBannerError(urlSection, "Failed to generate summary. Please check your API key and try again.");
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

    // Show error message using the shared error container
    mainContainer.appendChild(createErrorContainer("DeepSeek"));
  }
}

async function invokingMRAction(containerRef: any, diffsData: any, actionType: MRActionType) {
  const personalAIApiKey = await getDeepSeekApiKey();
  if (!personalAIApiKey) return;

  const model = (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;

  // Generate messages prompt for the specific action type
  const messages = mergeRequestActionsPrompts.getPrompt(diffsData, actionType);

  // Create main container
  const mainContainer = document.createElement("div");
  containerRef.current.appendChild(mainContainer);

  // Show initial loading state
  MRActionsRenderer.showLoadingState(mainContainer, actionType);

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
          MRActionsRenderer.render(mainContainer, responseContent.trim(), actionType);
          return responseContent.trim();
        }

        // Parse the JSON response incrementally
        try {
          if (data.startsWith("data: ")) {
            const jsonResponse = JSON.parse(data.substring(6));
            const deltaContent = jsonResponse.choices?.[0]?.delta?.content;

            if (deltaContent) {
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
    MRActionsRenderer.showErrorState(mainContainer, "Failed to get response from DeepSeek. Please try again.");
  }
}

async function invokingIssueAction(containerRef: any, issueData: any, discussions: any, actionType: IssueActionType) {
  const personalAIApiKey = await getDeepSeekApiKey();
  if (!personalAIApiKey) return;

  const model = (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;

  // Get user role for role-based prompts
  const occupation = await getUserOccupation();

  // Generate messages prompt for the specific action type with user role
  const messages = issueActionsPrompts.getPrompt(issueData, discussions, actionType, occupation);

  const mainContainer = document.createElement("div");
  containerRef.current.appendChild(mainContainer);

  IssueActionsRenderer.showLoadingState(mainContainer, actionType);

  try {
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

    if (!response.ok) {
      throw new Error("Error calling LLM API");
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
          if (data.startsWith("data: ")) {
            const jsonResponse = JSON.parse(data.substring(6));
            const deltaContent = jsonResponse.choices?.[0]?.delta?.content;

            if (deltaContent) {
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
    IssueActionsRenderer.showErrorState(mainContainer, "Failed to get response from DeepSeek. Please try again.");
  }
}

async function invokingIssueChat(
  containerRef: any,
  userQuery: string,
  chatContext: ChatContext,
  onComplete?: (response: string) => void,
  onAddToComments?: (content: string) => Promise<{ success: boolean; noteUrl?: string; error?: string }>
) {
  const personalAIApiKey = await getDeepSeekApiKey();
  if (!personalAIApiKey) return;

  const model = (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;
  const occupation = await getUserOccupation();

  const messages = issueChatPrompts.getChatPrompt(userQuery, {
    issueData: chatContext.issueData,
    discussions: chatContext.discussions,
    previousResponse: chatContext.previousResponse,
    conversationHistory: chatContext.conversationHistory,
    currentUser: chatContext.currentUser,
  }, occupation);

  const messageContainer = document.createElement("div");
  containerRef.current.appendChild(messageContainer);

  IssueChatRenderer.showLoadingState(messageContainer);

  try {
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

    if (!response.ok) {
      throw new Error("Error calling LLM API");
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
          if (data.startsWith("data: ")) {
            const jsonResponse = JSON.parse(data.substring(6));
            const deltaContent = jsonResponse.choices?.[0]?.delta?.content;

            if (deltaContent) {
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
    IssueChatRenderer.showErrorState(messageContainer, "Failed to get response from DeepSeek. Please try again.");
  }
}

export { fetchLLMTaskSummarizer, invokingCodeAnalysis, invokingMRAction, invokingIssueAction, invokingIssueChat };
