/* eslint-disable @typescript-eslint/no-redeclare */

import { getOllamaModel, getOllamaURL, llamaApiChat } from "./../index";
import { taskPrompts, mergeRequestPrompts } from "./../prompts/index";
import { aiGeneratedSummaries, splitString } from "./../tools";

const aiProvider = "ollama";

async function fetchLLMTaskSummarizer(
  issueDetails: any,
  issueData: any,
  discussions: any
) {
  const model = (await getOllamaModel()) || "";
  const ollamaURL = await getOllamaURL();
  const aIApiUrl = `${ollamaURL}/api/chat`;

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
    const response: any = await llamaApiChat("llamaAPI", aIApiUrl, {
      model: model,
      messages: messages,
      stream: false,
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
  const model = await getOllamaModel();
  const ollamaURL = await getOllamaURL();
  const aIApiUrl = `${ollamaURL}/api/chat`;

  // Generate messages prompt
  const messages = mergeRequestPrompts.getPrompt(diffsData.changes);

  let preCoderesponseSection = document.createElement("pre");
  preCoderesponseSection.style.paddingBottom = "0px";
  preCoderesponseSection.style.marginBottom = "5px";
  issueDetails.current.appendChild(preCoderesponseSection);

  let headerSection = document.createElement("h3");
  headerSection.innerText = diffsData.fileName;
  headerSection.style.margin = "5px";
  preCoderesponseSection.appendChild(headerSection);

  let responseSection = document.createElement("code");
  preCoderesponseSection.appendChild(responseSection);

  try {
    const response: any = await llamaApiChat("llamaAPI", aIApiUrl, {
      model: model,
      messages: messages,
      stream: true,
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

      // Split the stream data by sentences
      const arr = value.split(/(?<=\.\s)/);

      for (const data of arr) {
        // Ignore empty or comment messages
        if (data.length === 0 || data.startsWith(":")) continue;
        if (data === "data: [DONE]") {
          return responseContent.trim(); // End of stream
        }

        accumulatedChunk += data;

        // Parse the JSON response incrementally
        try {
          const jsonResponse = JSON.parse(accumulatedChunk.split("data: ")[1]);
          const analysisChunks = splitString(
            jsonResponse.choices[0].delta.content,
            1000
          );
          if (analysisChunks.length > 0) {
            for (const chunk of analysisChunks) {
              responseContent += chunk;
            }

            responseSection.innerHTML = responseContent.trim();
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

                responseSection.innerHTML = responseContent.trim();
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

export { fetchLLMTaskSummarizer, invokingCodeAnalysis };
