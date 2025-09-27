/* eslint-disable @typescript-eslint/no-redeclare */

import * as openAi from "./openAi";
import * as deepSeek from "./deepSeek";
import * as ollama from "./ollama";
import * as claude from "./claude";

import { getAiProvider } from "./../index";

type ProviderFunctionMap = {
  [key: string]: (...args: any[]) => Promise<void>;
};

async function executeProviderFunction(
  providerFunctions: ProviderFunctionMap,
  ...args: any[]
): Promise<void> {
  const aiProvider = await getAiProvider();
  if (!aiProvider) return;

  const providerFunction = providerFunctions[aiProvider];
  if (providerFunction) {
    await providerFunction(...args);
  }
}

async function gitLabIssueSummarize(
  issueDetails: any,
  issueData: any,
  discussions: any
): Promise<void> {
  const providerFunctions: ProviderFunctionMap = {
    openai: async (issueDetails, issueData, discussions) => {
      await openAi.fetchLLMTaskSummarizer(issueDetails, issueData, discussions);
    },
    deepseek: async (issueDetails, issueData, discussions) => {
      await deepSeek.fetchLLMTaskSummarizer(
        issueDetails,
        issueData,
        discussions
      );
    },
    ollama: async (issueDetails, issueData, discussions) => {
      await ollama.fetchLLMTaskSummarizer(issueDetails, issueData, discussions);
    },
    claude: async (issueDetails, issueData, discussions) => {
      await claude.fetchLLMTaskSummarizer(issueDetails, issueData, discussions);
    },
  };

  await executeProviderFunction(
    providerFunctions,
    issueDetails,
    issueData,
    discussions
  );
}

async function invokingCodeAnalysis(
  issueDetails: any,
  diffsData: any
): Promise<void> {
  const providerFunctions: ProviderFunctionMap = {
    openai: async (issueDetails, diffsData) => {
      await openAi.invokingCodeAnalysis(issueDetails, diffsData);
    },
    deepseek: async (issueDetails, diffsData) => {
      await deepSeek.invokingCodeAnalysis(issueDetails, diffsData);
    },
    ollama: async (issueDetails, diffsData) => {
      await ollama.invokingCodeAnalysis(issueDetails, diffsData);
    },
    claude: async (issueDetails, diffsData) => {
      await claude.invokingCodeAnalysis(issueDetails, diffsData);
    },
  };

  await executeProviderFunction(providerFunctions, issueDetails, diffsData);
}

export { gitLabIssueSummarize, invokingCodeAnalysis };
