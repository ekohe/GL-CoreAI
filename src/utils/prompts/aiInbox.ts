/**
 * AI Inbox Prompts - Prompts for processing GitLab todos into actionable summaries
 */

import { buildPersonalizationContext, UserPersonalization } from "../llms/base";

// GitLab Todo type from API
export interface GitLabTodo {
  id: number;
  project: {
    id: number;
    name: string;
    path_with_namespace: string;
    web_url: string;
  };
  author: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
  };
  action_name: string;
  target_type: string;
  target: {
    id: number;
    iid: number;
    title: string;
    description?: string;
    state: string;
    web_url: string;
    due_date?: string;
    labels?: string[];
  };
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
}

// Processed todo summary structure
export interface TodoSummary {
  headsUp: PriorityItem[];
  catchUp: TopicGroup[];
}

export interface PriorityItem {
  id: string;
  gitlabTodoId: number; // Actual GitLab todo ID for API operations
  title: string;
  summary: string;
  urgency: "high" | "medium" | "low";
  project: string;
  projectUrl: string;
  targetUrl: string;
  targetType: string;
  author: string;
  authorAvatar: string;
  emailCount: number;
  createdAt: string;
  actionName: string;
  isClientFeedback?: boolean;
}

export interface TopicGroup {
  topic: string;
  items: TopicItem[];
  emailCount: number;
  avatars: string[];
  isClientFeedback?: boolean;
}

export interface TopicItem {
  summary: string;
  targetUrl: string;
  createdAt?: string;
  isClientFeedback?: boolean;
}

/**
 * Build the system prompt for AI Inbox processing
 */
export function buildSystemPrompt(personalization?: UserPersonalization): string {
  const personalizationContext = buildPersonalizationContext(personalization);

  return `You are an intelligent assistant helping users manage their GitLab todos effectively. Your role is to analyze todos and create two types of summaries:

1. **Heads Up (Priorities)**: Action items that require immediate attention
   - Focus on urgent items, items assigned to the user, mentions, direct requests
   - Identify items with deadlines or blocking issues
   - Highlight new assignments or review requests

2. **Catch Up (Topic Summaries)**: Grouped summaries of other updates
   - Group related items by project or topic
   - Summarize discussions and updates concisely
   - De-emphasize informational or FYI items

${personalizationContext}

IMPORTANT GUIDELINES:
- Write summaries in a friendly, conversational tone
- Use action-oriented language for priorities (e.g., "Review the code changes", "Respond to John's question")
- For Catch Up items, start summaries with the person's name when relevant (e.g., "Maya N. announced...")
- Be concise but informative
- Identify the author/initiator clearly
- Indicate the number of related emails/updates when grouping
- Focus on what the USER needs to do or know

CLIENT FEEDBACK DETECTION:
- Mark items as "isClientFeedback: true" if they appear to be from external clients/customers
- Client feedback indicators: labels containing "client", "customer", "external", "feedback", "bug-report"
- Also check if author username looks like an external account (not company employees)
- Client feedback items are HIGH PRIORITY and should be highlighted`;
}

/**
 * Build the user prompt for processing todos
 */
export function buildTodoProcessingPrompt(todos: GitLabTodo[]): string {
  // Format todos for the AI to process
  const formattedTodos = todos.map((todo, index) => {
    return `[Todo ${index + 1}]
- ID: ${todo.id}
- Project: ${todo.project.name} (${todo.project.path_with_namespace})
- Target Type: ${todo.target_type}
- Action: ${todo.action_name}
- Title: ${todo.target.title}
- State: ${todo.target.state}
- Author: ${todo.author.name} (@${todo.author.username})
- Body: ${todo.body || "No additional details"}
- Created: ${todo.created_at}
- Due Date: ${todo.target.due_date || "Not set"}
- Labels: ${todo.target.labels?.join(", ") || "None"}
- URL: ${todo.target.web_url}`;
  }).join("\n\n");

  return `Please analyze the following ${todos.length} GitLab todos and create a summary with two sections:

**TODOS DATA:**
${formattedTodos}

**REQUIRED OUTPUT FORMAT:**
Please respond with a JSON object in this exact structure:
{
  "headsUp": [
    {
      "id": "unique_id",
      "title": "Short action-oriented title",
      "summary": "Brief description with context - mention the person who triggered this",
      "urgency": "high|medium|low",
      "project": "Project Name",
      "targetType": "Issue|MergeRequest|etc",
      "actionName": "mentioned|assigned|etc",
      "emailCount": 1,
      "isClientFeedback": false
    }
  ],
  "catchUp": [
    {
      "topic": "Topic/Project Name",
      "items": [
        {
          "summary": "Concise summary of updates, starting with person name when relevant",
          "isClientFeedback": false
        }
      ],
      "emailCount": 3,
      "isClientFeedback": false
    }
  ]
}

CLASSIFICATION RULES:
- Heads Up: Direct mentions, assignments, review requests, items with due dates, blocking issues, CLIENT FEEDBACK
- Catch Up: General updates, comments on issues you're watching, completed tasks, FYI items
- isClientFeedback: Set to true for any feedback from external clients/customers (check labels and author)

Keep summaries concise and actionable. Maximum 5 items in Heads Up, group others into Catch Up topics.`;
}

/**
 * Build prompt for chat follow-up about todos
 */
export function buildTodoChatPrompt(
  userQuery: string,
  todos: GitLabTodo[],
  previousSummary: TodoSummary | null,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): string {
  const todoContext = todos.slice(0, 20).map((todo) => {
    return `- ${todo.target.title} (${todo.target_type} by ${todo.author.name}) - ${todo.action_name}`;
  }).join("\n");

  const historyContext = conversationHistory.map(msg =>
    `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
  ).join("\n");

  return `You are helping the user with their GitLab todos inbox.

CURRENT TODOS CONTEXT:
${todoContext}

${previousSummary ? `
CURRENT SUMMARY:
- Heads Up: ${previousSummary.headsUp.length} priority items
- Catch Up: ${previousSummary.catchUp.length} topic groups
` : ""}

${historyContext ? `CONVERSATION HISTORY:\n${historyContext}\n` : ""}

USER QUESTION: ${userQuery}

Please provide a helpful, concise response. You can:
- Answer questions about specific todos
- Help prioritize tasks
- Suggest actions to take
- Provide context about projects or issues
- Help draft responses or updates

Be conversational and actionable in your response.`;
}

/**
 * Get suggested prompts for AI Inbox chat
 */
export function getSuggestedPrompts(todoCount: number, slackEnabled?: boolean): string[] {
  const basePrompts = [
    "What should I focus on first?",
    "Summarize my urgent items",
    "Which items are overdue?",
  ];

  if (todoCount > 10) {
    basePrompts.push("Group todos by project");
  }

  if (todoCount > 5) {
    basePrompts.push("What can I delegate?");
  }

  if (slackEnabled) {
    basePrompts.push("Send this to Slack");
  }

  return basePrompts;
}
