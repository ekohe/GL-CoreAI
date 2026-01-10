import type { GitLabUser } from "../gitlab";

/**
 * Chat prompt for follow-up conversations about issues
 * This builds on the initial action response and allows users to ask follow-up questions
 */

const DEFAULT_OCCUPATION = "team member";

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

// Get occupation-specific system message for chat
const getOccupationChatSystemMessage = (occupation: string): string => {
  const occupationContext = occupation
    ? `You are an expert project analyst assistant helping a ${occupation} understand and manage this GitLab issue.`
    : `You are an expert project analyst assistant helping a team member understand and manage this GitLab issue.`;

  return `${occupationContext}

You are continuing a conversation about a GitLab issue. The user has already received an initial analysis and now has follow-up questions or requests.

IMPORTANT GUIDELINES:
1. Be concise and helpful in your responses
2. Reference specific details from the issue and discussions when relevant
3. If the user asks for something outside the scope of the issue, politely redirect them
4. Format your responses in a readable way using markdown
5. If you're asked to generate content (like comments, updates, etc.), make it professional and ready to use
6. Remember the context from previous messages in the conversation
7. When the user refers to "me", "myself", "I", or "my", use the CURRENT USER information provided to personalize the response`;
};

// Build the user context
const buildUserContext = (currentUser?: GitLabUser | null): string => {
  if (!currentUser) {
    return '';
  }

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

// Build the issue context for the chat
const buildIssueContext = (issueData: any, discussions: any, currentUser?: GitLabUser | null): string => {
  const userContext = buildUserContext(currentUser);

  return `
${userContext}
CURRENT ISSUE CONTEXT:
======================
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Author: ${issueData.author?.name || 'Unknown'}${issueData.author?.username === currentUser?.username ? ' (THIS IS THE CURRENT USER)' : ''}
Assignee: ${issueData.assignee?.name || 'Unassigned'}${issueData.assignee?.username === currentUser?.username ? ' (THIS IS THE CURRENT USER)' : ''}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Milestone: ${issueData.milestone?.title || 'No milestone'}
Created: ${issueData.created_at || 'Unknown'}
Updated: ${issueData.updated_at || 'Unknown'}

DISCUSSIONS SUMMARY:
${JSON.stringify(discussions, null, 2)}
`;
};

/**
 * Get chat messages for a follow-up conversation
 */
export const getChatPrompt = (
  userQuery: string,
  context: IssueChatContext,
  occupation?: string
): ChatMessage[] => {
  const userOccupation = occupation || DEFAULT_OCCUPATION;
  const systemMessage = getOccupationChatSystemMessage(userOccupation);
  const issueContext = buildIssueContext(context.issueData, context.discussions, context.currentUser);

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${systemMessage}

${issueContext}

PREVIOUS AI ANALYSIS:
${context.previousResponse}

Now continue the conversation based on the user's follow-up question. Be helpful and specific.${context.currentUser ? ` Remember that the person asking is ${context.currentUser.name} (@${context.currentUser.username}).` : ''}`,
    },
  ];

  // Add conversation history
  if (context.conversationHistory && context.conversationHistory.length > 0) {
    // Only add user/assistant messages from history (skip system messages)
    context.conversationHistory.forEach((msg) => {
      if (msg.role !== "system") {
        messages.push(msg);
      }
    });
  }

  // Add the current user query
  messages.push({
    role: "user",
    content: userQuery,
  });

  return messages;
};

/**
 * Context for generating dynamic prompts
 */
interface PromptContext {
  issueData?: IssueType;
  discussions?: any[];
  currentUser?: GitLabUser | null;
  actionType?: string;
  hasInitialResponse?: boolean;
}

/**
 * Generate dynamic quick prompts based on issue context
 */
export const getSuggestedPrompts = (context: PromptContext): string[] => {
  const { issueData, discussions, currentUser, actionType, hasInitialResponse } = context;
  const prompts: string[] = [];

  // If no issue data, return generic prompts
  if (!issueData) {
    return [
      "Summarize this issue",
      "What are the key points?",
      "Who is involved?",
    ];
  }

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

  // If we already have an initial response, suggest follow-up prompts
  if (hasInitialResponse) {
    // Context-aware follow-ups based on action type
    if (actionType === "analyze_blockers" || hasBlockedLabel) {
      prompts.push("How can we resolve this blocker?");
      prompts.push("Draft an escalation message");
    }

    if (actionType === "draft_update") {
      prompts.push("Make it more concise");
      prompts.push("Add technical details");
    }

    // Add general follow-ups based on context
    if (prompts.length < 3) {
      if (!isClosed && hasDueDate) {
        prompts.push("Are we on track for the deadline?");
      }
      if (isAssignee) {
        prompts.push("What should I focus on next?");
      }
      if (discussionCount > 5) {
        prompts.push("Summarize key decisions made");
      }
      prompts.push("Draft a status update");
    }

    return prompts.slice(0, 4);
  }

  // Initial prompts based on issue state and context

  // Status-based prompts
  if (isClosed) {
    prompts.push("Why was this issue closed?");
    prompts.push("What was the resolution?");
  } else {
    prompts.push("Summarize this issue");

    if (hasBlockedLabel) {
      prompts.push("What is blocking this issue?");
    }
  }

  // User role-based prompts
  if (isAssignee && !isClosed) {
    prompts.push("What are my next steps?");
  } else if (isAuthor && !isClosed) {
    prompts.push("Check progress on my issue");
  }

  // Activity-based prompts
  if (daysSinceUpdate > 7 && !isClosed) {
    prompts.push("Why hasn't this been updated recently?");
  }

  if (discussionCount > 3) {
    prompts.push("Summarize the discussion");
  }

  // Due date prompts
  if (hasDueDate && !isClosed) {
    const dueDate = new Date(issueData.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue <= 3 && daysUntilDue > 0) {
      prompts.push("What's the deadline risk?");
    } else if (daysUntilDue < 0) {
      prompts.push("Why is this overdue?");
    }
  }

  // Label-based prompts
  if (hasLabels) {
    const labels = issueData.labels;
    if (labels.some(l => l.toLowerCase().includes('bug'))) {
      prompts.push("What's causing this bug?");
    }
    if (labels.some(l => l.toLowerCase().includes('feature'))) {
      prompts.push("What's the feature scope?");
    }
    if (labels.some(l => l.toLowerCase().includes('urgent') || l.toLowerCase().includes('priority'))) {
      prompts.push("Why is this urgent?");
    }
  }

  // If we don't have enough prompts, add generic ones
  if (prompts.length < 2) {
    if (!prompts.includes("Summarize this issue")) {
      prompts.push("Summarize this issue");
    }
    prompts.push("Who should be involved?");
    prompts.push("What are the key decisions?");
  }

  // Return unique prompts, max 4
  return [...new Set(prompts)].slice(0, 4);
};

export default {
  getChatPrompt,
  getSuggestedPrompts,
};
