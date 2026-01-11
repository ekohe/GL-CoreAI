/**
 * Issue Chat Prompts
 *
 * Prompts for follow-up conversations about issues.
 * Builds on initial action responses and allows users to ask follow-up questions.
 *
 * DEPENDENCIES: Uses shared utilities from ./shared.ts
 * IMPACT: Changes here affect the issue chat/conversation feature
 */

import type { GitLabUser } from "../gitlab";
import { DEFAULT_OCCUPATION } from "../constants";
import { buildPersonalizationContext, type UserPersonalization } from "../llms/base";
import { NAME_FORMATTING_INSTRUCTION, getOccupationContext, formatIssueDetails, formatDiscussions } from "./shared";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface IssueChatContext {
  issueData: any;
  discussions: any;
  previousResponse: string;
  conversationHistory: ChatMessage[];
  currentUser?: GitLabUser | null;
}

interface PromptContext {
  issueData?: IssueType;
  discussions?: any[];
  currentUser?: GitLabUser | null;
  actionType?: string;
  hasInitialResponse?: boolean;
}

// =============================================================================
// CHAT GUIDELINES
// =============================================================================

const CHAT_GUIDELINES = `
IMPORTANT GUIDELINES:
1. Be concise and helpful in your responses
2. Reference specific details from the issue and discussions when relevant
3. If the user asks for something outside the scope of the issue, politely redirect them
4. Format your responses in a readable way using markdown
5. If you're asked to generate content (like comments, updates, etc.), make it professional and ready to use
6. Remember the context from previous messages in the conversation
7. When the user refers to "me", "myself", "I", or "my", use the CURRENT USER information provided to personalize the response
8. Any person names, usernames, or entity names MUST be emphasized using *name* markdown tags`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build user context for personalization
 */
const buildUserContext = (currentUser?: GitLabUser | null): string => {
  if (!currentUser) return '';

  return `
CURRENT USER (the person asking questions):
============================================
Name: ${currentUser.name}
Username: @${currentUser.username}
Email: ${currentUser.email || 'Not available'}
GitLab Profile: ${currentUser.web_url || 'Not available'}

When the user refers to "me", "myself", "I", "my issues", "my work", etc., they are referring to this user (${currentUser.name} / @${currentUser.username}).
`;
};

/**
 * Build issue context for chat
 */
const buildIssueContext = (issueData: any, discussions: any, currentUser?: GitLabUser | null): string => {
  const userContext = buildUserContext(currentUser);

  // Build issue details with current user indicators
  const authorNote = issueData.author?.username === currentUser?.username ? ' (THIS IS THE CURRENT USER)' : '';
  const assigneeNote = issueData.assignee?.username === currentUser?.username ? ' (THIS IS THE CURRENT USER)' : '';

  return `
${userContext}
CURRENT ISSUE CONTEXT:
======================
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Author: ${issueData.author?.name || 'Unknown'}${authorNote}
Assignee: ${issueData.assignee?.name || 'Unassigned'}${assigneeNote}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Milestone: ${issueData.milestone?.title || 'No milestone'}
Created: ${issueData.created_at || 'Unknown'}
Updated: ${issueData.updated_at || 'Unknown'}

DISCUSSIONS SUMMARY:
${formatDiscussions(discussions)}
`;
};

/**
 * Get system message for chat
 */
const getChatSystemMessage = (occupation: string): string => {
  const context = getOccupationContext(occupation, "expert project analyst assistant");

  return `${context}

You are continuing a conversation about a GitLab issue. The user has already received an initial analysis and now has follow-up questions or requests.
${CHAT_GUIDELINES}`;
};

// =============================================================================
// EXPORTED API
// =============================================================================

/**
 * Get chat messages for a follow-up conversation
 *
 * @param userQuery - The user's question
 * @param context - Chat context including issue data and history
 * @param occupation - User's occupation for tailored responses
 * @param personalization - Additional personalization settings
 * @returns Array of messages for LLM API call
 */
export const getChatPrompt = (
  userQuery: string,
  context: IssueChatContext,
  occupation?: string,
  personalization?: UserPersonalization
): ChatMessage[] => {
  const userOccupation = occupation || personalization?.occupation || DEFAULT_OCCUPATION;
  const systemMessage = getChatSystemMessage(userOccupation);
  const issueContext = buildIssueContext(context.issueData, context.discussions, context.currentUser);
  const personalizationContext = buildPersonalizationContext(personalization);

  const userReminder = context.currentUser
    ? ` Remember that the person asking is ${context.currentUser.name} (@${context.currentUser.username}).`
    : '';

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${systemMessage}
${personalizationContext}
${issueContext}

PREVIOUS AI ANALYSIS:
${context.previousResponse}

Now continue the conversation based on the user's follow-up question. Be helpful and specific.${userReminder}`,
    },
  ];

  // Add conversation history (skip system messages)
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    context.conversationHistory.forEach((msg) => {
      if (msg.role !== "system") {
        messages.push(msg);
      }
    });
  }

  // Add current query
  messages.push({ role: "user", content: userQuery });

  return messages;
};

/**
 * Generate dynamic quick prompts based on issue context
 */
export const getSuggestedPrompts = (context: PromptContext): string[] => {
  const { issueData, discussions, currentUser, actionType, hasInitialResponse } = context;
  const prompts: string[] = [];

  // No issue data - return generic prompts
  if (!issueData) {
    return ["Summarize this issue", "What are the key points?", "Who is involved?"];
  }

  // Analyze issue state
  const isAuthor = currentUser && issueData.author?.username === currentUser.username;
  const isAssignee = currentUser && issueData.assignee?.username === currentUser.username;
  const isClosed = issueData.state === "closed";
  const hasLabels = issueData.labels && issueData.labels.length > 0;
  const hasDueDate = !!issueData.due_date;
  const hasBlockedLabel = issueData.labels?.some(l =>
    l.toLowerCase().includes('blocked') || l.toLowerCase().includes('blocker')
  );
  const discussionCount = discussions?.length || issueData.user_notes_count || 0;
  const daysSinceUpdate = issueData.updated_at
    ? Math.floor((Date.now() - new Date(issueData.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Follow-up prompts (after initial response)
  if (hasInitialResponse) {
    if (actionType === "analyze_blockers" || hasBlockedLabel) {
      prompts.push("How can we resolve this blocker?");
      prompts.push("Draft an escalation message");
    }

    if (actionType === "draft_update") {
      prompts.push("Make it more concise");
      prompts.push("Add technical details");
    }

    if (prompts.length < 3) {
      if (!isClosed && hasDueDate) prompts.push("Are we on track for the deadline?");
      if (isAssignee) prompts.push("What should I focus on next?");
      if (discussionCount > 5) prompts.push("Summarize key decisions made");
      prompts.push("Draft a status update");
    }

    return prompts.slice(0, 4);
  }

  // Initial prompts
  if (isClosed) {
    prompts.push("Why was this issue closed?");
    prompts.push("What was the resolution?");
  } else {
    prompts.push("Summarize this issue");
    if (hasBlockedLabel) prompts.push("What is blocking this issue?");
  }

  // Role-based prompts
  if (isAssignee && !isClosed) prompts.push("What are my next steps?");
  else if (isAuthor && !isClosed) prompts.push("Check progress on my issue");

  // Activity-based prompts
  if (daysSinceUpdate > 7 && !isClosed) prompts.push("Why hasn't this been updated recently?");
  if (discussionCount > 3) prompts.push("Summarize the discussion");

  // Due date prompts
  if (hasDueDate && !isClosed) {
    const dueDate = new Date(issueData.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 3 && daysUntilDue > 0) prompts.push("What's the deadline risk?");
    else if (daysUntilDue < 0) prompts.push("Why is this overdue?");
  }

  // Label-based prompts
  if (hasLabels) {
    const labels = issueData.labels;
    if (labels.some(l => l.toLowerCase().includes('bug'))) prompts.push("What's causing this bug?");
    if (labels.some(l => l.toLowerCase().includes('feature'))) prompts.push("What's the feature scope?");
    if (labels.some(l => l.toLowerCase().includes('urgent') || l.toLowerCase().includes('priority'))) {
      prompts.push("Why is this urgent?");
    }
  }

  // Ensure minimum prompts
  if (prompts.length < 2) {
    if (!prompts.includes("Summarize this issue")) prompts.push("Summarize this issue");
    prompts.push("Who should be involved?");
    prompts.push("What are the key decisions?");
  }

  return [...new Set(prompts)].slice(0, 4);
};

export default {
  getChatPrompt,
  getSuggestedPrompts,
};
