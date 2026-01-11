/**
 * Merge Request Actions Prompts
 *
 * Prompts for analyzing GitLab merge requests:
 * - summarize: PR summary with title, overview, and impact areas
 * - spot_issues: Find bugs, security issues, and improvements
 * - draft_notes: Generate release notes
 *
 * DEPENDENCIES: Uses shared utilities from ./shared.ts
 * IMPACT: Changes here affect the GitLab MR analysis features
 */

import { MRActionType } from "../constants";
import {
  NAME_FORMATTING_INSTRUCTION,
  DIFF_FORMAT_INSTRUCTION,
  getJsonRequirements,
  formatDiffData,
  getJsonSystemMessage,
} from "./shared";

// =============================================================================
// RESPONSE SCHEMAS
// =============================================================================

const SUMMARIZE_RESPONSE_SCHEMA = `{
  "title": "Brief one-line summary of the changes",
  "overview": "2-3 sentence overview of what this PR accomplishes",
  "impact_areas": [
    {
      "area": "Area affected (e.g., Authentication, API, UI, Database, etc.)",
      "impact": "Description of how this area is impacted"
    }
  ]
}`;

const SPOT_ISSUES_RESPONSE_SCHEMA = `[
  {
    "file": "USE_THE_PROVIDED_FILE_PATH_EXACTLY",
    "line": "actual_line_number_as_string",
    "severity": "Critical|High|Medium|Low",
    "category": "Bug|Security|Performance|Maintainability|Best Practice|Logic Error",
    "issue": "Clear description of the problem",
    "current": "actual code from the diff",
    "suggested": "improved version of the code",
    "why": "Explanation of why this improvement helps"
  }
]`;

const DRAFT_NOTES_RESPONSE_SCHEMA = `{
  "version_bump": "patch|minor|major",
  "summary": "One sentence describing the release",
  "sections": {
    "features": ["User-facing description of new features"],
    "improvements": ["User-facing description of improvements"],
    "bug_fixes": ["User-facing description of bugs fixed"],
    "breaking_changes": ["Description of any breaking changes users need to know"],
    "technical_notes": ["Technical details for developers (refactoring, dependencies, etc.)"]
  },
  "migration_notes": "Instructions if users need to take any action",
  "contributors": "Credit for the changes (if apparent from the diff)"
}`;

// =============================================================================
// JSON REQUIREMENTS BY ACTION TYPE
// =============================================================================

const JSON_RULES: Record<MRActionType, string[]> = {
  summarize: [],
  spot_issues: [
    'severity must be exactly one of: "Critical", "High", "Medium", "Low"',
    'category must be one of: "Bug", "Security", "Performance", "Maintainability", "Best Practice", "Logic Error"',
    '"current" and "suggested" fields should contain actual code',
    '"issue" and "why" fields should contain descriptive text',
  ],
  draft_notes: [
    'version_bump must be exactly one of: "patch", "minor", "major"',
    'Empty arrays [] are acceptable for sections with no items',
    'migration_notes can be null if no migration is needed',
  ],
};

// =============================================================================
// FOCUS AREAS BY ACTION TYPE
// =============================================================================

const FOCUS_AREAS: Record<MRActionType, string[]> = {
  summarize: [
    "Understanding the purpose and scope of changes",
    "Identifying which systems/features are affected",
    "Summarizing the overall intent of the PR",
    "Highlighting potential impacts on other parts of the codebase",
  ],
  spot_issues: [
    "Security vulnerabilities (SQL injection, XSS, authentication issues)",
    "Potential bugs and edge cases not handled",
    "Performance bottlenecks (N+1 queries, memory leaks, inefficient algorithms)",
    "Race conditions and concurrency issues",
    "Error handling gaps",
    "Logic errors that could cause unexpected behavior",
    "Code that may break existing functionality (regressions)",
    "ONLY analyze lines that start with + or - (changed code)",
  ],
  draft_notes: [],
};

// =============================================================================
// SYSTEM MESSAGES
// =============================================================================

const SYSTEM_MESSAGES: Record<MRActionType, string> = {
  summarize: getJsonSystemMessage(
    "You are an expert code analyst who provides clear, comprehensive summaries of code changes.",
    "Parse Git diff format correctly to understand what changed"
  ),
  spot_issues: getJsonSystemMessage(
    "You are an expert code reviewer with deep knowledge of software engineering best practices.",
    "Parse Git diff format correctly to extract accurate file paths and line numbers"
  ),
  draft_notes: getJsonSystemMessage(
    "You are a technical writer who creates clear, user-friendly release notes.",
    "Translate technical changes into user-understandable language"
  ),
};

// =============================================================================
// PROMPT BUILDERS
// =============================================================================

const buildSummarizePrompt = (diffsData: any): string => {
  const focusAreas = FOCUS_AREAS.summarize.map(f => `- ${f}`).join('\n');

  return `You are an expert code analyst. Analyze the merge request changes and provide a comprehensive summary.
${DIFF_FORMAT_INSTRUCTION}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${SUMMARIZE_RESPONSE_SCHEMA}

${getJsonRequirements(JSON_RULES.summarize)}
${NAME_FORMATTING_INSTRUCTION}

FOCUS YOUR ANALYSIS ON:
${focusAreas}

${formatDiffData(diffsData)}
`;
};

const buildSpotIssuesPrompt = (diffsData: any): string => {
  const focusAreas = FOCUS_AREAS.spot_issues.map(f => `- ${f}`).join('\n');

  return `You are an expert code reviewer with deep knowledge of software engineering best practices.
Analyze file changes and identify potential bugs, regressions, and areas for improvement.
${DIFF_FORMAT_INSTRUCTION}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${SPOT_ISSUES_RESPONSE_SCHEMA}

IMPORTANT FILE PATH RULES:
- Use the exact file path provided in the "FILE:" sections below
- Do not modify, truncate, or change the file path in any way

${getJsonRequirements(JSON_RULES.spot_issues)}
${NAME_FORMATTING_INSTRUCTION}

FOCUS YOUR ANALYSIS ON:
${focusAreas}

${formatDiffData(diffsData)}
`;
};

const buildDraftNotesPrompt = (diffsData: any): string => {
  return `You are a technical writer creating release notes for a software update.
Analyze the changes and write user-friendly release notes.
${DIFF_FORMAT_INSTRUCTION}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${DRAFT_NOTES_RESPONSE_SCHEMA}

${getJsonRequirements(JSON_RULES.draft_notes)}
${NAME_FORMATTING_INSTRUCTION}

WRITING GUIDELINES:
- Write from the user's perspective (what they will experience)
- Use action verbs: "Added", "Fixed", "Improved", "Updated"
- Be concise but informative
- Group related changes together
- Highlight breaking changes prominently
- version_bump guidance:
  - patch: Bug fixes, documentation, internal refactoring
  - minor: New features, non-breaking improvements
  - major: Breaking changes, major new features

${formatDiffData(diffsData)}
`;
};

// =============================================================================
// PROMPT MAPPING
// =============================================================================

const PROMPT_BUILDERS: Record<MRActionType, (diffsData: any) => string> = {
  summarize: buildSummarizePrompt,
  spot_issues: buildSpotIssuesPrompt,
  draft_notes: buildDraftNotesPrompt,
};

// =============================================================================
// EXPORTED API
// =============================================================================

/**
 * Get prompt messages for MR analysis
 *
 * @param diffsData - Diff data from the merge request
 * @param actionType - Type of analysis to perform
 * @returns Array of messages for LLM API call
 */
export const getPrompt = (diffsData: any, actionType: MRActionType): any => {
  return [
    { role: "system", content: SYSTEM_MESSAGES[actionType] },
    { role: "user", content: PROMPT_BUILDERS[actionType](diffsData) },
  ];
};
