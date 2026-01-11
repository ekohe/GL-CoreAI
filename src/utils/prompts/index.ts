/**
 * Prompts Index
 *
 * Central export for all prompt modules.
 *
 * STRUCTURE:
 * - shared: Common utilities used by all prompts (modify with care!)
 * - issueActions: Issue analysis prompts (summarize, blockers, updates)
 * - mergeRequestActions: MR analysis prompts (summarize, spot issues, release notes)
 * - codeReview: Code review prompts
 * - aiInbox: Todo processing prompts
 * - issueChat: Issue conversation prompts
 * - task: Legacy HTML-based issue prompts (deprecated)
 */

import * as sharedPrompts from "./shared";
import * as taskPrompts from "./task";
import * as codeReviewPrompts from "./codeReview";
import * as mergeRequestActionsPrompts from "./mergeRequestActions";
import * as issueActionsPrompts from "./issueActions";
import * as issueChatPrompts from "./issueChat";
import * as aiInboxPrompts from "./aiInbox";

export {
  sharedPrompts,
  taskPrompts,
  codeReviewPrompts,
  mergeRequestActionsPrompts,
  issueActionsPrompts,
  issueChatPrompts,
  aiInboxPrompts,
};

// Re-export commonly used shared utilities for convenience
export {
  NAME_FORMATTING_INSTRUCTION,
  DIFF_FORMAT_INSTRUCTION,
  getJsonRequirements,
  formatDiffData,
  formatIssueDetails,
  formatDiscussions,
  getOccupationFocusAreas,
  getOccupationContext,
  getJsonSystemMessage,
} from "./shared";
