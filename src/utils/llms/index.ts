/* eslint-disable @typescript-eslint/no-redeclare */

import * as openAi from "./openAi";
import * as deepSeek from "./deepSeek";
import * as ollama from "./ollama";
import * as claude from "./claude";

import { getAiProvider } from "./../index";
import { MRActionType, IssueActionType } from "../constants";

type ProviderFunctionMap = {
  [key: string]: (...args: any[]) => Promise<void>;
};

import type { GitLabUser } from "../gitlab";

// Chat context for follow-up conversations
export interface ChatContext {
  issueData: any;
  discussions: any;
  previousResponse: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  currentUser?: GitLabUser | null;
}

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

async function invokingMRAction(
  containerRef: any,
  diffsData: any,
  actionType: MRActionType
): Promise<void> {
  const providerFunctions: ProviderFunctionMap = {
    openai: async (containerRef, diffsData, actionType) => {
      await openAi.invokingMRAction(containerRef, diffsData, actionType);
    },
    deepseek: async (containerRef, diffsData, actionType) => {
      await deepSeek.invokingMRAction(containerRef, diffsData, actionType);
    },
    ollama: async (containerRef, diffsData, actionType) => {
      await ollama.invokingMRAction(containerRef, diffsData, actionType);
    },
    claude: async (containerRef, diffsData, actionType) => {
      await claude.invokingMRAction(containerRef, diffsData, actionType);
    },
  };

  await executeProviderFunction(providerFunctions, containerRef, diffsData, actionType);
}

async function invokingIssueAction(
  containerRef: any,
  issueData: any,
  discussions: any,
  actionType: IssueActionType
): Promise<string | void> {
  const providerFunctions: ProviderFunctionMap = {
    openai: async (containerRef, issueData, discussions, actionType) => {
      await openAi.invokingIssueAction(containerRef, issueData, discussions, actionType);
    },
    deepseek: async (containerRef, issueData, discussions, actionType) => {
      await deepSeek.invokingIssueAction(containerRef, issueData, discussions, actionType);
    },
    ollama: async (containerRef, issueData, discussions, actionType) => {
      await ollama.invokingIssueAction(containerRef, issueData, discussions, actionType);
    },
    claude: async (containerRef, issueData, discussions, actionType) => {
      await claude.invokingIssueAction(containerRef, issueData, discussions, actionType);
    },
  };

  await executeProviderFunction(providerFunctions, containerRef, issueData, discussions, actionType);
}

// Type for the add to comments callback
type AddToCommentsCallback = (content: string) => Promise<{ success: boolean; noteUrl?: string; error?: string }>;

async function invokingIssueChat(
  containerRef: any,
  userQuery: string,
  chatContext: ChatContext,
  onComplete?: (response: string) => void,
  onAddToComments?: AddToCommentsCallback
): Promise<void> {
  const providerFunctions: ProviderFunctionMap = {
    openai: async (containerRef, userQuery, chatContext, onComplete, onAddToComments) => {
      await openAi.invokingIssueChat(containerRef, userQuery, chatContext, onComplete, onAddToComments);
    },
    deepseek: async (containerRef, userQuery, chatContext, onComplete, onAddToComments) => {
      await deepSeek.invokingIssueChat(containerRef, userQuery, chatContext, onComplete, onAddToComments);
    },
    ollama: async (containerRef, userQuery, chatContext, onComplete, onAddToComments) => {
      await ollama.invokingIssueChat(containerRef, userQuery, chatContext, onComplete, onAddToComments);
    },
    claude: async (containerRef, userQuery, chatContext, onComplete, onAddToComments) => {
      await claude.invokingIssueChat(containerRef, userQuery, chatContext, onComplete, onAddToComments);
    },
  };

  await executeProviderFunction(providerFunctions, containerRef, userQuery, chatContext, onComplete, onAddToComments);
}

export { gitLabIssueSummarize, invokingCodeAnalysis, invokingMRAction, invokingIssueAction, invokingIssueChat };
