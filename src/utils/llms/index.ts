/* eslint-disable @typescript-eslint/no-redeclare */

import * as openAi from "./openAi";
import * as deepSeek from "./deepSeek";
import * as ollama from "./ollama";
import * as claude from "./claude";
import * as openRouter from "./openRouter";

import { getAiProvider, getOpenAIApiKey, getClaudeApiKey, getDeepSeekApiKey, getOllamaURL, getOpenRouterApiKey } from "./../index";
import { MRActionType, IssueActionType, DEFAULT_AI_MODELS, DEFAULT_OLLAMA_URL } from "../constants";
import { aiInboxPrompts } from "../prompts";
import type { GitLabTodo, TodoSummary, PriorityItem, TopicGroup } from "../prompts/aiInbox";
import { IssueChatRenderer } from "../issueChatRenderer";
import { getUserPersonalization, buildPersonalizationContext } from "./base";
import { isSlackConfigured, sendSlackMessage } from "../slack";
import { AiBOT } from "../common";
import { GitLabUser } from "../gitlab";

type ProviderFunctionMap = {
  [key: string]: (...args: any[]) => Promise<void>;
};

// Chat context for follow-up conversations
export interface ChatContext {
  issueData: any;
  discussions: any;
  previousResponse: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  currentUser?: GitLabUser | null;
  // Enriched context from QueryRouter (external resources)
  enrichedResourcesContent?: string;
  enrichedResourcesSummaries?: string[];
}

// AI Inbox chat context
export interface AIInboxChatContext {
  todos: GitLabTodo[];
  summary: TodoSummary | null;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
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
    openrouter: async (issueDetails, issueData, discussions) => {
      await openRouter.fetchLLMTaskSummarizer(issueDetails, issueData, discussions);
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
    openrouter: async (issueDetails, diffsData) => {
      await openRouter.invokingCodeAnalysis(issueDetails, diffsData);
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
    openrouter: async (containerRef, diffsData, actionType) => {
      await openRouter.invokingMRAction(containerRef, diffsData, actionType);
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
    openrouter: async (containerRef, issueData, discussions, actionType) => {
      await openRouter.invokingIssueAction(containerRef, issueData, discussions, actionType);
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
    openrouter: async (containerRef, userQuery, chatContext, onComplete, onAddToComments) => {
      await openRouter.invokingIssueChat(containerRef, userQuery, chatContext, onComplete, onAddToComments);
    },
  };

  await executeProviderFunction(providerFunctions, containerRef, userQuery, chatContext, onComplete, onAddToComments);
}

/**
 * Process GitLab todos with AI to generate summaries
 */
async function invokingAIInboxProcess(
  todos: GitLabTodo[],
  provider: string,
  model: string
): Promise<TodoSummary> {
  const personalization = await getUserPersonalization();
  const systemPrompt = aiInboxPrompts.buildSystemPrompt(personalization);
  const userPrompt = aiInboxPrompts.buildTodoProcessingPrompt(todos);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  let apiUrl: string;
  let headers: Record<string, string>;
  let body: any;

  if (provider === "claude") {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) throw new Error("Claude API key not configured");

    apiUrl = "https://api.anthropic.com/v1/messages";
    headers = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    body = {
      model: model || DEFAULT_AI_MODELS.claude,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 4000,
    };
  } else if (provider === "deepseek") {
    const apiKey = await getDeepSeekApiKey();
    if (!apiKey) throw new Error("DeepSeek API key not configured");

    apiUrl = "https://api.deepseek.com/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = { model: model || DEFAULT_AI_MODELS.deepseek, messages };
  } else if (provider === "ollama") {
    const ollamaUrl = (await getOllamaURL()) || DEFAULT_OLLAMA_URL;
    apiUrl = `${ollamaUrl}/api/chat`;
    headers = { "Content-Type": "application/json" };
    body = { model: model || DEFAULT_AI_MODELS.ollama, messages, stream: false };
  } else if (provider === "openrouter") {
    const apiKey = await getOpenRouterApiKey();
    if (!apiKey) throw new Error("OpenRouter API key not configured");

    apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": chrome.runtime.getURL("/"),
      "X-Title": AiBOT.name,
    };
    body = { model: model || DEFAULT_AI_MODELS.openrouter, messages };
  } else {
    // Default to OpenAI
    const apiKey = await getOpenAIApiKey();
    if (!apiKey) throw new Error("OpenAI API key not configured");

    apiUrl = "https://api.openai.com/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = { model: model || DEFAULT_AI_MODELS.openai, messages };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();

  // Extract content based on provider
  let content: string;
  if (provider === "claude") {
    content = data.content?.[0]?.text || "";
  } else if (provider === "ollama") {
    content = data.message?.content || "";
  } else {
    // OpenAI, DeepSeek, and OpenRouter use the same response format
    content = data.choices?.[0]?.message?.content || "";
  }

  // Parse the JSON response
  try {
    // Extract JSON from the response (might be wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Helper to detect client feedback from labels
      const hasClientLabels = (todo: GitLabTodo): boolean => {
        const clientKeywords = ["client", "customer", "external", "feedback", "bug-report", "support"];
        const labels = todo.target.labels || [];
        return labels.some(label =>
          clientKeywords.some(kw => label.toLowerCase().includes(kw))
        );
      };

      // Transform to proper format with all required fields
      const headsUp: PriorityItem[] = (parsed.headsUp || []).map((item: any, index: number) => {
        const todo = todos[index];
        const isClient = item.isClientFeedback || (todo && hasClientLabels(todo));
        return {
          id: item.id || `priority-${index}`,
          gitlabTodoId: todo?.id || 0,
          title: item.title || "Untitled",
          summary: item.summary || "",
          urgency: isClient ? "high" : (item.urgency || "medium"),
          project: item.project || "Unknown Project",
          projectUrl: todo?.project?.web_url || "",
          targetUrl: todo?.target?.web_url || "",
          targetType: item.targetType || "Issue",
          author: todo?.author?.name || "Unknown",
          authorAvatar: todo?.author?.avatar_url || "",
          emailCount: item.emailCount || 1,
          createdAt: todo?.created_at || new Date().toISOString(),
          actionName: item.actionName || "update",
          isClientFeedback: isClient,
        };
      });

      // Track todo index for catch-up items
      let todoIndex = headsUp.length;

      const catchUp: TopicGroup[] = (parsed.catchUp || []).map((group: any) => {
        const groupTodos = todos.slice(todoIndex, todoIndex + (group.items?.length || 0));
        const hasClientItem = groupTodos.some(t => hasClientLabels(t)) || group.isClientFeedback;

        const items = (group.items || []).map((item: any, itemIndex: number) => {
          const itemTodo = groupTodos[itemIndex];
          const isItemClient = item.isClientFeedback || (itemTodo && hasClientLabels(itemTodo));
          return {
            summary: item.summary || "",
            targetUrl: itemTodo?.target?.web_url || item.targetUrl || "",
            createdAt: itemTodo?.created_at || "",
            isClientFeedback: isItemClient,
          };
        });

        todoIndex += group.items?.length || 0;

        return {
          topic: group.topic || "Other Updates",
          items,
          emailCount: group.emailCount || items.length || 0,
          avatars: groupTodos.slice(0, 3).map(t => t.author.avatar_url),
          isClientFeedback: hasClientItem,
        };
      });

      return { headsUp, catchUp };
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e);
  }

  // Return empty summary if parsing fails
  return { headsUp: [], catchUp: [] };
}

/**
 * Handle chat interactions about AI Inbox todos
 */
async function invokingAIInboxChat(
  containerRef: any,
  userQuery: string,
  context: AIInboxChatContext,
  provider: string,
  onComplete?: (response: string) => void
): Promise<void> {
  const container = containerRef?.current;
  if (!container) return;

  // Check if user wants to send to Slack
  const slackKeywords = ["send to slack", "share to slack", "post to slack", "slack this", "share on slack", "notify slack"];
  const wantsSlack = slackKeywords.some(keyword => userQuery.toLowerCase().includes(keyword));
  const slackConfigured = await isSlackConfigured();

  // If user wants to send to Slack and it's configured
  if (wantsSlack && slackConfigured) {
    // Create response container
    const responseContainer = document.createElement("div");
    responseContainer.className = "chat-response-wrapper";
    container.appendChild(responseContainer);
    IssueChatRenderer.showLoadingState(responseContainer);

    // Get the last assistant message from history to send to Slack
    const lastAssistantMessage = context.conversationHistory
      .filter(msg => msg.role === "assistant")
      .pop();

    if (lastAssistantMessage) {
      const result = await sendSlackMessage(lastAssistantMessage.content);
      if (result.success) {
        const successMessage = "I've sent the previous response to your Slack channel! Your team should see it shortly.";
        IssueChatRenderer.renderResponse(responseContainer, successMessage);
        onComplete?.(successMessage);
        return;
      } else {
        const errorMessage = `I wasn't able to send to Slack: ${result.error}. Please check your Slack settings.`;
        IssueChatRenderer.renderResponse(responseContainer, errorMessage);
        onComplete?.(errorMessage);
        return;
      }
    } else {
      // No previous message to send, create a summary first
      IssueChatRenderer.renderResponse(
        responseContainer,
        "I'll create a summary first, then you can ask me to send it to Slack."
      );
      onComplete?.("I'll create a summary first, then you can ask me to send it to Slack.");
      return;
    }
  }

  // Create loading container
  const loadingContainer = document.createElement("div");
  loadingContainer.className = "chat-response-wrapper";
  container.appendChild(loadingContainer);
  IssueChatRenderer.showLoadingState(loadingContainer);

  const personalization = await getUserPersonalization();
  const personalizationContext = buildPersonalizationContext(personalization);

  // Build system prompt with Slack capability info
  const slackInfo = slackConfigured
    ? "You can send messages to Slack. If the user asks to 'send to Slack' or 'share on Slack', the system will automatically post the previous response to their configured Slack channel."
    : "";

  const systemPrompt = `You are a helpful assistant that helps users manage their GitLab todos inbox.
${personalizationContext}

Be conversational, concise, and actionable. Help users:
- Understand their todos better
- Prioritize their work
- Find specific items
- Draft responses when needed
${slackInfo ? `\n${slackInfo}` : ""}`;

  const todoContext = context.todos.slice(0, 20).map((todo) => {
    return `- ${todo.target.title} (${todo.target_type} by ${todo.author.name}) - ${todo.action_name}`;
  }).join("\n");

  const conversationMessages = context.conversationHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Current todos context:\n${todoContext}` },
    ...conversationMessages,
    { role: "user", content: userQuery },
  ];

  let apiUrl: string;
  let headers: Record<string, string>;
  let body: any;

  if (provider === "claude") {
    const apiKey = await getClaudeApiKey();
    if (!apiKey) throw new Error("Claude API key not configured");

    apiUrl = "https://api.anthropic.com/v1/messages";
    headers = {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "anthropic-dangerous-direct-browser-access": "true",
    };
    body = {
      model: DEFAULT_AI_MODELS.claude,
      system: systemPrompt,
      messages: [
        { role: "user", content: `Current todos context:\n${todoContext}` },
        ...conversationMessages,
        { role: "user", content: userQuery },
      ],
      max_tokens: 2000,
      stream: true,
    };
  } else if (provider === "deepseek") {
    const apiKey = await getDeepSeekApiKey();
    if (!apiKey) throw new Error("DeepSeek API key not configured");

    apiUrl = "https://api.deepseek.com/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = { model: DEFAULT_AI_MODELS.deepseek, messages, stream: true };
  } else if (provider === "ollama") {
    const ollamaUrl = (await getOllamaURL()) || DEFAULT_OLLAMA_URL;
    apiUrl = `${ollamaUrl}/api/chat`;
    headers = { "Content-Type": "application/json" };
    body = { model: DEFAULT_AI_MODELS.ollama, messages, stream: true };
  } else if (provider === "openrouter") {
    const apiKey = await getOpenRouterApiKey();
    if (!apiKey) throw new Error("OpenRouter API key not configured");

    apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": chrome.runtime.getURL("/"),
      "X-Title": AiBOT.name,
    };
    body = { model: DEFAULT_AI_MODELS.openrouter, messages, stream: true };
  } else {
    const apiKey = await getOpenAIApiKey();
    if (!apiKey) throw new Error("OpenAI API key not configured");

    apiUrl = "https://api.openai.com/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    body = { model: DEFAULT_AI_MODELS.openai, messages, stream: true };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
    if (!reader) throw new Error("Failed to get response reader");

    let responseContent = "";
    let lastUpdateTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = value.split("\n");
      for (const line of lines) {
        if (line.length === 0 || line.startsWith(":")) continue;
        if (line === "data: [DONE]") {
          IssueChatRenderer.renderResponse(loadingContainer, responseContent.trim());
          onComplete?.(responseContent.trim());
          return;
        }

        try {
          let content = "";
          if (provider === "claude") {
            const jsonStr = line.replace(/^data: /, "");
            if (jsonStr) {
              const json = JSON.parse(jsonStr);
              content = json.delta?.text || "";
            }
          } else if (provider === "ollama") {
            const json = JSON.parse(line);
            content = json.message?.content || "";
          } else {
            // OpenAI, DeepSeek, and OpenRouter use the same streaming format
            const jsonStr = line.replace(/^data: /, "");
            if (jsonStr) {
              const json = JSON.parse(jsonStr);
              content = json.choices?.[0]?.delta?.content || "";
            }
          }

          if (content) {
            responseContent += content;
            const now = Date.now();
            if (now - lastUpdateTime > 100 || responseContent.length < 50) {
              IssueChatRenderer.renderStreamingResponse(loadingContainer, responseContent);
              lastUpdateTime = now;
            }
          }
        } catch {
          // Ignore parsing errors for incomplete chunks
        }
      }
    }

    IssueChatRenderer.renderResponse(loadingContainer, responseContent.trim());
    onComplete?.(responseContent.trim());
  } catch (error: any) {
    IssueChatRenderer.showErrorState(loadingContainer, error.message || "Failed to process message");
    throw error;
  }
}

export {
  gitLabIssueSummarize,
  invokingCodeAnalysis,
  invokingMRAction,
  invokingIssueAction,
  invokingIssueChat,
  invokingAIInboxProcess,
  invokingAIInboxChat,
};
