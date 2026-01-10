/**
 * Slack Integration Utility
 * Provides functions for posting messages to Slack via webhooks
 * Uses Slack Block Kit for rich message formatting
 */

import { AiBOT } from "./common";
import { getStorage } from "./index";

export interface SlackMessageOptions {
  text: string;
  username?: string;
  icon_emoji?: string;
  channel?: string;
  attachments?: SlackAttachment[];
  blocks?: SlackBlock[];
}

export interface SlackAttachment {
  color?: string;
  fallback?: string;
  pretext?: string;
  author_name?: string;
  author_link?: string;
  author_icon?: string;
  title?: string;
  title_link?: string;
  text?: string;
  fields?: SlackField[];
  image_url?: string;
  thumb_url?: string;
  footer?: string;
  footer_icon?: string;
  ts?: number;
  mrkdwn_in?: string[];
}

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

export interface SlackBlock {
  type: string;
  block_id?: string;
  text?: SlackTextObject;
  fields?: SlackTextObject[];
  elements?: any[];
  accessory?: any;
  image_url?: string;
  alt_text?: string;
}

export interface SlackTextObject {
  type: "plain_text" | "mrkdwn";
  text: string;
  emoji?: boolean;
  verbatim?: boolean;
}

export interface SlackPostResult {
  success: boolean;
  error?: string;
}

// Type emojis
const TYPE_EMOJIS = {
  issue: "📋",
  merge_request: "🔀",
  todo: "✅",
  general: "🤖",
  code_review: "🔍",
};

// Type labels
const TYPE_LABELS = {
  issue: "Issue Summary",
  merge_request: "Merge Request",
  todo: "Todo Summary",
  general: "AI Summary",
  code_review: "Code Review",
};

/**
 * Get Slack settings from storage
 */
export const getSlackSettings = (): Promise<{
  enabled: boolean;
  webhookUrl: string;
  botName: string;
  defaultChannel: string;
  iconEmoji: string;
}> => {
  return new Promise((resolve) => {
    getStorage(
      [
        "GASSlackEnabled",
        "GASSlackWebhookUrl",
        "GASSlackBotName",
        "GASSlackDefaultChannel",
        "GASSlackIconEmoji",
      ],
      (result) => {
        resolve({
          enabled: result.GASSlackEnabled || false,
          webhookUrl: result.GASSlackWebhookUrl || "",
          botName: result.GASSlackBotName || AiBOT.name,
          defaultChannel: result.GASSlackDefaultChannel || "",
          iconEmoji: result.GASSlackIconEmoji || ":robot_face:",
        });
      }
    );
  });
};

/**
 * Check if Slack integration is enabled and configured
 */
export const isSlackConfigured = async (): Promise<boolean> => {
  const settings = await getSlackSettings();
  return settings.enabled && !!settings.webhookUrl;
};

/**
 * Post a message to Slack via webhook
 */
export const postToSlack = async (
  webhookUrl: string,
  message: SlackMessageOptions
): Promise<SlackPostResult> => {
  try {
    if (!webhookUrl) {
      return { success: false, error: "Webhook URL is required" };
    }

    // Validate webhook URL format
    if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
      return { success: false, error: "Invalid Slack webhook URL format" };
    }

    const payload: any = {
      text: message.text,
    };

    // Add optional fields
    if (message.username) payload.username = message.username;
    if (message.icon_emoji) payload.icon_emoji = message.icon_emoji;
    if (message.channel) payload.channel = message.channel;
    if (message.attachments) payload.attachments = message.attachments;
    if (message.blocks) payload.blocks = message.blocks;

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const text = await response.text();
      if (text === "ok") {
        return { success: true };
      }
      return { success: false, error: text || "Unknown error from Slack" };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        error: `Slack API error (${response.status}): ${errorText}`,
      };
    }
  } catch (err: any) {
    console.error("Error posting to Slack:", err);
    return {
      success: false,
      error: err.message || "Network error while posting to Slack",
    };
  }
};

/**
 * Convert markdown content to Slack mrkdwn format
 */
const convertToSlackMarkdown = (content: string): string => {
  let slackContent = content;

  // Convert headers: ## Header -> *Header*
  slackContent = slackContent.replace(/^###\s+(.+)$/gm, "*$1*");
  slackContent = slackContent.replace(/^##\s+(.+)$/gm, "*$1*");
  slackContent = slackContent.replace(/^#\s+(.+)$/gm, "*$1*");

  // Convert bold: **text** -> *text*
  slackContent = slackContent.replace(/\*\*(.+?)\*\*/g, "*$1*");

  // Convert inline code: `code` stays the same in Slack

  // Convert code blocks: ```code``` -> ```code```
  // Slack uses the same syntax, so no change needed

  // Convert links: [text](url) -> <url|text>
  slackContent = slackContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<$2|$1>");

  // Convert bullet points: - item -> • item
  slackContent = slackContent.replace(/^-\s+/gm, "• ");

  return slackContent;
};

/**
 * Split content into chunks for Slack's 3000 char limit per section
 */
const splitContentIntoChunks = (content: string, maxLength: number = 2800): string[] => {
  if (content.length <= maxLength) {
    return [content];
  }

  const chunks: string[] = [];
  const paragraphs = content.split("\n\n");
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if ((currentChunk + "\n\n" + paragraph).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = paragraph;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + paragraph : paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Build Block Kit blocks for a rich AI summary message
 */
const buildSummaryBlocks = (
  content: string,
  context?: {
    title?: string;
    url?: string;
    type?: "issue" | "merge_request" | "todo" | "general" | "code_review";
    project?: string;
    author?: string;
  }
): SlackBlock[] => {
  const blocks: SlackBlock[] = [];
  const type = context?.type || "general";
  const emoji = TYPE_EMOJIS[type];
  const label = TYPE_LABELS[type];

  // Header block with title
  const headerText = context?.title || `${AiBOT.name} Summary`;
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${emoji} ${headerText}`,
      emoji: true,
    },
  });

  // Context bar with type badge and timestamp
  const contextElements: any[] = [
    {
      type: "mrkdwn",
      text: `*${label}*`,
    },
  ];

  if (context?.project) {
    contextElements.push({
      type: "mrkdwn",
      text: `📁 ${context.project}`,
    });
  }

  contextElements.push({
    type: "mrkdwn",
    text: `🕐 ${new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`,
  });

  blocks.push({
    type: "context",
    elements: contextElements,
  });

  // Divider
  blocks.push({ type: "divider" });

  // Convert content to Slack markdown
  const slackContent = convertToSlackMarkdown(content);

  // Split content into chunks if too long
  const contentChunks = splitContentIntoChunks(slackContent);

  // Add content sections
  for (const chunk of contentChunks) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: chunk,
      },
    });
  }

  // Add action link if URL is provided
  if (context?.url) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `👉 <${context.url}|*View in GitLab*>`,
      },
    });
  }

  // Footer context
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Powered by *${AiBOT.name}* • v${AiBOT.version}`,
      },
    ],
  });

  return blocks;
};

/**
 * Share an AI summary to Slack with rich Block Kit formatting
 */
export const shareToSlack = async (
  content: string,
  context?: {
    title?: string;
    url?: string;
    type?: "issue" | "merge_request" | "todo" | "general";
    project?: string;
  }
): Promise<SlackPostResult> => {
  const settings = await getSlackSettings();

  if (!settings.enabled) {
    return { success: false, error: "Slack integration is not enabled" };
  }

  if (!settings.webhookUrl) {
    return { success: false, error: "Slack webhook URL is not configured" };
  }

  const type = context?.type || "general";
  const emoji = TYPE_EMOJIS[type];

  // Build Block Kit blocks
  const blocks = buildSummaryBlocks(content, context);

  // Fallback text for notifications
  const fallbackText = context?.title
    ? `${emoji} ${context.title}: ${content.substring(0, 100)}...`
    : `${emoji} ${AiBOT.name} Summary: ${content.substring(0, 100)}...`;

  const message: SlackMessageOptions = {
    text: fallbackText,
    username: settings.botName,
    icon_emoji: settings.iconEmoji,
    blocks,
  };

  if (settings.defaultChannel) {
    message.channel = settings.defaultChannel;
  }

  return postToSlack(settings.webhookUrl, message);
};

/**
 * Send a simple text message to Slack with basic formatting
 */
export const sendSlackMessage = async (text: string): Promise<SlackPostResult> => {
  const settings = await getSlackSettings();

  if (!settings.enabled) {
    return { success: false, error: "Slack integration is not enabled" };
  }

  if (!settings.webhookUrl) {
    return { success: false, error: "Slack webhook URL is not configured" };
  }

  // Convert markdown to Slack format
  const slackText = convertToSlackMarkdown(text);

  // Build simple blocks
  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: slackText.length > 3000 ? slackText.substring(0, 2997) + "..." : slackText,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `🤖 Sent via *${AiBOT.name}* • ${new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}`,
        },
      ],
    },
  ];

  const message: SlackMessageOptions = {
    text: text.substring(0, 100) + "...",
    username: settings.botName,
    icon_emoji: settings.iconEmoji,
    blocks,
  };

  if (settings.defaultChannel) {
    message.channel = settings.defaultChannel;
  }

  return postToSlack(settings.webhookUrl, message);
};

/**
 * Format a code review for Slack with Block Kit
 */
export const formatCodeReviewForSlack = (
  summary: string,
  mrTitle: string,
  mrUrl: string,
  projectName: string,
  author?: string
): SlackMessageOptions => {
  const blocks = buildSummaryBlocks(summary, {
    title: mrTitle,
    url: mrUrl,
    type: "code_review",
    project: projectName,
    author,
  });

  return {
    text: `🔍 Code Review: ${mrTitle}`,
    blocks,
  };
};

/**
 * Format an issue summary for Slack with Block Kit
 */
export const formatIssueSummaryForSlack = (
  summary: string,
  issueTitle: string,
  issueUrl: string,
  projectName: string,
  author?: string
): SlackMessageOptions => {
  const blocks = buildSummaryBlocks(summary, {
    title: issueTitle,
    url: issueUrl,
    type: "issue",
    project: projectName,
    author,
  });

  return {
    text: `📋 Issue Summary: ${issueTitle}`,
    blocks,
  };
};

/**
 * Format a todo/inbox summary for Slack with Block Kit
 */
export const formatTodoSummaryForSlack = (
  summary: string,
  title: string,
  url?: string,
  projectName?: string
): SlackMessageOptions => {
  const blocks = buildSummaryBlocks(summary, {
    title,
    url,
    type: "todo",
    project: projectName,
  });

  return {
    text: `✅ Todo Summary: ${title}`,
    blocks,
  };
};

/**
 * Create a formatted Slack message with key-value fields
 */
export const formatFieldsMessage = (
  title: string,
  fields: Array<{ label: string; value: string }>,
  context?: {
    url?: string;
    type?: "issue" | "merge_request" | "todo" | "general";
    project?: string;
  }
): SlackMessageOptions => {
  const type = context?.type || "general";
  const emoji = TYPE_EMOJIS[type];

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} ${title}`,
        emoji: true,
      },
    },
    { type: "divider" },
    {
      type: "section",
      fields: fields.slice(0, 10).map((field) => ({
        type: "mrkdwn" as const,
        text: `*${field.label}*\n${field.value}`,
      })),
    },
  ];

  if (context?.url) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `👉 <${context.url}|*View in GitLab*>`,
      },
    });
  }

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `${context?.project ? `📁 ${context.project} • ` : ""}Powered by *${AiBOT.name}* • v${AiBOT.version}`,
      },
    ],
  });

  return {
    text: `${emoji} ${title}`,
    blocks,
  };
};
