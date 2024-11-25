/* eslint-disable @typescript-eslint/no-redeclare */

import {
  getAiProvider,
  getOpenAIApiKey,
  getOpenAIModel,
  getOllamaModel,
  getOllamaURL,
} from ".";
import { getPrompt } from "./prompts";

async function fetchLLMResponse(
  issueDetails: any,
  issueData: any,
  discussions: any
) {
  const personalOpenAIApiKey = await getOpenAIApiKey();
  if (!personalOpenAIApiKey) return;

  const aiProvider = await getAiProvider();
  const openAIModel = await getOpenAIModel();
  const ollamaModel = await getOllamaModel();
  const ollamaURL = await getOllamaURL();

  const chatAPIs = {
    ollama: `${ollamaURL}/api/chat`,
    openai: "https://api.openai.com/v1/chat/completions",
  };

  // Generate messages prompt
  const messages = getPrompt(issueData, discussions);
  const useOpenAI = aiProvider === "openai";

  const model = useOpenAI ? openAIModel : ollamaModel;
  const aIApiUrl = useOpenAI ? chatAPIs.openai : chatAPIs.ollama;

  let urlSection = document.createElement("p");
  urlSection.innerHTML = `<em>Asking model: ${aiProvider} (${model})</em>`;
  urlSection.style.color = "black";
  urlSection.style.paddingBottom = "0px";
  urlSection.style.marginBottom = "5px";
  issueDetails.current.appendChild(urlSection);

  let responseSection = document.createElement("p");
  responseSection.style.color = "black";
  responseSection.style.paddingBottom = "0px";
  responseSection.style.marginBottom = "5px";
  issueDetails.current.appendChild(responseSection);

  try {
    // Call the LLM API
    const response = await fetch(aIApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${personalOpenAIApiKey}`,
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
          urlSection.innerHTML = `<em>Generated model: ${aiProvider} (${model})</em>`;
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
    console.log("Error fetching data from OpenAI:", error);
  }
}

export { fetchLLMResponse };
