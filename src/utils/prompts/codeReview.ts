/**
 * Code Review Prompts
 *
 * Prompts for code review analysis of diffs.
 * Similar to spot_issues in MR actions but with more focus on line number calculation.
 *
 * DEPENDENCIES: Uses shared utilities from ./shared.ts
 * IMPACT: Changes here affect the code review feature
 */

import {
  NAME_FORMATTING_INSTRUCTION,
  DIFF_FORMAT_INSTRUCTION,
  getJsonRequirements,
  formatDiffData,
  getJsonSystemMessage,
} from "./shared";

// =============================================================================
// RESPONSE SCHEMA
// =============================================================================

const CODE_REVIEW_RESPONSE_SCHEMA = `[
  {
    "file": "USE_THE_PROVIDED_FILE_PATH_EXACTLY",
    "line": "actual_line_number_as_string",
    "severity": "Critical|High|Medium|Low",
    "issue": "Clear description of the problem",
    "current": "actual code from the diff",
    "suggested": "improved version of the code",
    "why": "Explanation of why this improvement helps"
  }
]`;

// =============================================================================
// JSON REQUIREMENTS
// =============================================================================

const JSON_RULES = [
  'severity must be exactly one of: "Critical", "High", "Medium", "Low"',
  '"current" and "suggested" fields should contain actual code',
  '"issue" and "why" fields should contain descriptive text',
];

// =============================================================================
// FOCUS AREAS
// =============================================================================

const FOCUS_AREAS = [
  "Security vulnerabilities in new/changed code",
  "Performance bottlenecks",
  "Code maintainability issues",
  "Best practice violations",
  "Logic errors or bugs",
  "ONLY analyze lines that start with + or - (changed code)",
];

// =============================================================================
// SYSTEM MESSAGE
// =============================================================================

const SYSTEM_MESSAGE = getJsonSystemMessage(
  "You are an expert code reviewer with deep knowledge of software engineering best practices.",
  "Parse Git diff format correctly to extract accurate file paths and line numbers"
);

// =============================================================================
// PROMPT BUILDER
// =============================================================================

const buildCodeReviewPrompt = (diffsData: any): string => {
  const focusAreas = FOCUS_AREAS.map(f => `- ${f}`).join('\n');

  return `You are an expert code reviewer. You will analyze file changes and provide specific improvement suggestions in JSON format.

IMPORTANT: The data structure you receive includes:
- File path: Already provided to you
- Diff content: Git diff showing changes with +/- lines
- You must calculate line numbers from the diff format
${DIFF_FORMAT_INSTRUCTION}
   - Use "+newStart" as the base line number for new code
   - Count through the diff to get exact line numbers

RESPONSE FORMAT - RETURN ONLY VALID JSON:
${CODE_REVIEW_RESPONSE_SCHEMA}

IMPORTANT FILE PATH RULES:
- Use the exact file path provided in the "FILE:" sections below
- Do not modify, truncate, or change the file path in any way
- Copy the file path exactly as shown after "FILE:" or "FILE N:"

${getJsonRequirements(JSON_RULES)}
${NAME_FORMATTING_INSTRUCTION}

LINE NUMBER CALCULATION EXAMPLE:
If you see: "@@ -45,7 +45,9 @@ class MyClass"
And then: "+  new_method_call()"
The line number would be: 45 + (count of lines to reach the + line)

FOCUS YOUR ANALYSIS ON:
${focusAreas}

${formatDiffData(diffsData)}
`;
};

// =============================================================================
// EXPORTED API
// =============================================================================

/**
 * Get prompt messages for code review
 *
 * @param diffsData - Diff data to review
 * @returns Array of messages for LLM API call
 */
export const getPrompt = (diffsData: any): any => {
  return [
    { role: "system", content: SYSTEM_MESSAGE },
    { role: "user", content: buildCodeReviewPrompt(diffsData) },
  ];
};
