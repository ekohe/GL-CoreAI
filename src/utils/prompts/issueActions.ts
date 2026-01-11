/**
 * Issue Actions Prompts
 *
 * Prompts for analyzing GitLab issues:
 * - summarize: Comprehensive issue summary
 * - analyze_blockers: Risk and blocker analysis
 * - draft_update: Status update for stakeholders
 *
 * DEPENDENCIES: Uses shared utilities from ./shared.ts
 * IMPACT: Changes here affect the GitLab Issue analysis features
 */

import { IssueActionType, DEFAULT_OCCUPATION } from "../constants";
import { buildPersonalizationContext, type UserPersonalization } from "../llms/base";
import {
  NAME_FORMATTING_INSTRUCTION,
  getJsonRequirements,
  formatIssueDetails,
  formatDiscussions,
  getOccupationFocusAreas,
  getOccupationContext,
  getJsonSystemMessage,
} from "./shared";

// =============================================================================
// RESPONSE SCHEMAS
// =============================================================================

const SUMMARIZE_RESPONSE_SCHEMA = (occupation: string) => `{
  "title": "Brief one-line summary of the issue",
  "overview": "2-3 sentence overview of what this issue is about",
  "perspective": {
    "occupation": "${occupation}",
    "key_insights": "Key insights specifically relevant to a ${occupation}",
    "action_items": ["Occupation-specific action items or considerations"]
  },
  "current_status": {
    "state": "open|in_progress|blocked|resolved",
    "progress_summary": "Brief description of current progress",
    "last_activity": "Description of the most recent activity"
  },
  "key_points": [
    {
      "type": "requirement|decision|question|concern|update",
      "summary": "Key point from the issue or discussions",
      "relevance": "Why this matters for your work"
    }
  ],
  "stakeholders": {
    "author": "Author name and their role/context if apparent",
    "assignee": "Assignee name and their responsibilities",
    "participants": ["List of other participants in discussions"]
  },
  "next_steps": [
    "Suggested or mentioned next steps"
  ],
  "open_questions": [
    "Any unresolved questions from discussions"
  ]
}`;

const BLOCKERS_RESPONSE_SCHEMA = (occupation: string) => `{
  "risk_level": "low|medium|high|critical",
  "summary": "One sentence summary of the overall risk situation",
  "perspective": {
    "occupation": "${occupation}",
    "primary_concerns": "Main concerns from a ${occupation} perspective",
    "recommended_focus": "What to prioritize based on this perspective"
  },
  "blockers": [
    {
      "type": "technical|dependency|resource|decision|external",
      "severity": "Critical|High|Medium|Low",
      "description": "Description of the blocker",
      "mentioned_by": "Who mentioned this blocker",
      "suggested_resolution": "How this might be resolved",
      "impact": "How this affects your work specifically"
    }
  ],
  "dependencies": [
    {
      "type": "internal|external|upstream|downstream",
      "description": "Description of the dependency",
      "status": "resolved|pending|unknown",
      "impact": "How this affects progress"
    }
  ],
  "risks": [
    {
      "category": "timeline|scope|technical|resource|communication",
      "probability": "low|medium|high",
      "impact": "low|medium|high",
      "description": "Description of the risk",
      "mitigation": "Suggested mitigation strategy"
    }
  ],
  "recommendations": [
    {
      "priority": "immediate|short_term|long_term",
      "action": "Recommended action to take",
      "owner": "Who should take this action"
    }
  ]
}`;

const UPDATE_RESPONSE_SCHEMA = (occupation: string) => `{
  "update_type": "progress|blocker|completion|escalation",
  "headline": "One-line headline for the update",
  "status_indicator": "on_track|at_risk|blocked|completed",
  "summary": "2-3 sentence executive summary",
  "perspective": {
    "occupation": "${occupation}",
    "audience_focus": "What matters most to stakeholders from this perspective",
    "key_message": "The main takeaway for this audience"
  },
  "progress": {
    "completed": ["List of completed items or milestones"],
    "in_progress": ["List of items currently being worked on"],
    "pending": ["List of items waiting to be started"]
  },
  "highlights": ["Key achievements or important updates"],
  "concerns": ["Issues or risks that stakeholders should be aware of"],
  "next_milestone": {
    "description": "Description of the next milestone or goal",
    "target_date": "Target date if mentioned, or 'TBD'"
  },
  "action_items": [
    {
      "owner": "Who is responsible",
      "action": "What needs to be done",
      "due": "When it's due or priority level"
    }
  ],
  "stakeholder_message": "A professional paragraph suitable for sharing with stakeholders, written from a ${occupation} perspective"
}`;

// =============================================================================
// JSON REQUIREMENTS BY ACTION TYPE
// =============================================================================

const JSON_RULES: Record<IssueActionType, string[]> = {
  summarize: [
    'state must be exactly one of: "open", "in_progress", "blocked", "resolved"',
    'type must be exactly one of: "requirement", "decision", "question", "concern", "update"',
  ],
  analyze_blockers: [
    'risk_level must be exactly one of: "low", "medium", "high", "critical"',
    'severity must be exactly one of: "Critical", "High", "Medium", "Low"',
  ],
  draft_update: [
    'update_type must be exactly one of: "progress", "blocker", "completion", "escalation"',
    'status_indicator must be exactly one of: "on_track", "at_risk", "blocked", "completed"',
  ],
};

// =============================================================================
// SYSTEM MESSAGES
// =============================================================================

const getSystemMessage = (occupation: string, actionType: IssueActionType): string => {
  const context = getOccupationContext(occupation, "expert project analyst");

  const actionDescriptions: Record<IssueActionType, string> = {
    summarize: "Tailor your summary to highlight aspects most relevant to their perspective",
    analyze_blockers: "Focus on finding blockers, dependencies, and potential risks relevant to their work",
    draft_update: "Write professionally and concisely, focusing on progress, challenges, and next steps",
  };

  return getJsonSystemMessage(context, actionDescriptions[actionType]);
};

// =============================================================================
// PROMPT BUILDERS
// =============================================================================

const buildSummarizePrompt = (issueData: any, discussions: any, occupation: string): string => {
  const issueDetails = formatIssueDetails(issueData, {
    includeAuthor: true,
    includeAssignee: true,
  });

  return `You are an expert project analyst. Analyze the GitLab issue and its discussions to provide a comprehensive summary tailored for a ${occupation}.

ISSUE DETAILS:
${issueDetails}

DISCUSSIONS:
${formatDiscussions(discussions)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${SUMMARIZE_RESPONSE_SCHEMA(occupation)}

${getJsonRequirements(JSON_RULES.summarize)}
${NAME_FORMATTING_INSTRUCTION}

${getOccupationFocusAreas(occupation)}
`;
};

const buildBlockersPrompt = (issueData: any, discussions: any, occupation: string): string => {
  const issueDetails = formatIssueDetails(issueData, {
    includeAuthor: false,
    includeAssignee: false,
    includeMilestone: true,
    includeDueDate: true,
  });

  return `You are an expert project risk analyst. Analyze the GitLab issue and its discussions to identify potential blockers, risks, and dependencies from a ${occupation} perspective.

ISSUE DETAILS:
${issueDetails}

DISCUSSIONS:
${formatDiscussions(discussions)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${BLOCKERS_RESPONSE_SCHEMA(occupation)}

${getJsonRequirements(JSON_RULES.analyze_blockers)}
${NAME_FORMATTING_INSTRUCTION}

${getOccupationFocusAreas(occupation)}
`;
};

const buildUpdatePrompt = (issueData: any, discussions: any, occupation: string): string => {
  const issueDetails = formatIssueDetails(issueData, {
    includeAuthor: true,
    includeAssignee: true,
    includeMilestone: true,
  });

  return `You are a technical writer creating a status update for stakeholders from a ${occupation} perspective. Analyze the GitLab issue and create a professional progress update.

ISSUE DETAILS:
${issueDetails}

DISCUSSIONS:
${formatDiscussions(discussions)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${UPDATE_RESPONSE_SCHEMA(occupation)}

${getJsonRequirements(JSON_RULES.draft_update)}
${NAME_FORMATTING_INSTRUCTION}

WRITING GUIDELINES:
- Write professionally and concisely
- Focus on facts from the issue and discussions
- Be objective about progress and challenges
- Make the stakeholder message suitable for email or Slack sharing
- Tailor the language and focus for the ${occupation} audience

${getOccupationFocusAreas(occupation)}
`;
};

// =============================================================================
// PROMPT MAPPING
// =============================================================================

const PROMPT_BUILDERS: Record<IssueActionType, (issueData: any, discussions: any, occupation: string) => string> = {
  summarize: buildSummarizePrompt,
  analyze_blockers: buildBlockersPrompt,
  draft_update: buildUpdatePrompt,
};

// =============================================================================
// EXPORTED API
// =============================================================================

/**
 * Get prompt messages for issue analysis
 *
 * @param issueData - GitLab issue data object
 * @param discussions - Issue discussions/comments
 * @param actionType - Type of analysis to perform
 * @param occupation - User's occupation for tailored analysis
 * @param personalization - Additional personalization settings
 * @returns Array of messages for LLM API call
 */
export const getPrompt = (
  issueData: any,
  discussions: any,
  actionType: IssueActionType,
  occupation?: string,
  personalization?: UserPersonalization
): any => {
  const userOccupation = occupation || personalization?.occupation || DEFAULT_OCCUPATION;

  const systemMessage = getSystemMessage(userOccupation, actionType);
  const personalizationContext = buildPersonalizationContext(personalization);
  const userPrompt = PROMPT_BUILDERS[actionType](issueData, discussions, userOccupation);

  const fullSystemMessage = personalizationContext
    ? `${systemMessage}\n\n${personalizationContext}`
    : systemMessage;

  return [
    { role: "system", content: fullSystemMessage },
    { role: "user", content: userPrompt },
  ];
};

/**
 * @deprecated Use getPrompt instead. This is kept for backwards compatibility.
 */
export const getPromptLegacy = (issueData: any, discussions: any, actionType: IssueActionType): any => {
  return getPrompt(issueData, discussions, actionType, DEFAULT_OCCUPATION);
};
