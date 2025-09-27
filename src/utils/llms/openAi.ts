/* eslint-disable @typescript-eslint/no-redeclare */

import { getOpenAIApiKey, getOpenAIModel } from "./../index";
import { taskPrompts, codeReviewPrompts } from "./../prompts/index";
import { aiGeneratedSummaries, splitString } from "./../tools";
import { CodeReviewRenderer } from "../codeReviewRenderer";

const aiProvider = "openai";
const aIApiUrl = "https://api.openai.com/v1/chat/completions";

async function fetchLLMTaskSummarizer(
  issueDetails: any,
  issueData: any,
  discussions: any
) {
  const personalAIApiKey = await getOpenAIApiKey();
  if (!personalAIApiKey) return;

  const model = (await getOpenAIModel()) || "";
  // Generate messages prompt
  const messages = taskPrompts.getPrompt(issueData, discussions);

  let urlSection = document.createElement("p");
  urlSection.innerHTML = `<em>Invoking ${aiProvider} model: (${model})</em>`;
  urlSection.style.color = "#333333B2";
  urlSection.style.fontSize = "18px";
  urlSection.style.paddingBottom = "0px";
  urlSection.style.marginBottom = "10px";
  issueDetails.current.appendChild(urlSection);

  let responseSection = document.createElement("p");
  responseSection.style.color = "black";
  responseSection.style.paddingBottom = "0px";
  responseSection.style.marginBottom = "5px";
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
          // Update the DOM when the stream is done
          urlSection.innerHTML = aiGeneratedSummaries(aiProvider, model);
          // responseSection.innerHTML += `<br><p style="text-align: center; font-style: italic;">${model} may make errors.</p>`;
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
    console.log(`Error fetching data from ${aiProvider}:`, error);
  }
}

async function invokingCodeAnalysis(issueDetails: any, diffsData: any) {
  const personalAIApiKey = await getOpenAIApiKey();
  if (!personalAIApiKey) return;

  const model = await getOpenAIModel() || "gpt-4o-mini";

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
        Failed to get code review from OpenAI. Please try again.
      </p>
    `;
    mainContainer.appendChild(errorContainer);
  }
}

export { fetchLLMTaskSummarizer, invokingCodeAnalysis };
