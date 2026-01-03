import { MRActionType } from "../constants";

// Summarize PR prompt - focuses on understanding what changed and why
const summarizePRPrompt = (diffsData: any) => `
You are an expert code analyst. Analyze the merge request changes and provide a comprehensive summary.

DIFF FORMAT UNDERSTANDING:
1. Lines starting with "+" are additions (new code)
2. Lines starting with "-" are deletions (removed code)
3. Lines without prefix are context
4. "@@ -oldStart,oldCount +newStart,newCount @@" shows line number ranges

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "title": "Brief one-line summary of the changes",
  "overview": "2-3 sentence overview of what this PR accomplishes",
  "key_changes": [
    {
      "file": "exact_file_path",
      "type": "added|modified|deleted|refactored",
      "summary": "What changed in this file and why it matters"
    }
  ],
  "impact_areas": [
    {
      "area": "Area affected (e.g., Authentication, API, UI, Database)",
      "impact": "Description of how this area is impacted",
      "risk_level": "low|medium|high"
    }
  ],
  "dependencies": "Any new dependencies or breaking changes to note",
  "testing_notes": "Suggestions for what should be tested"
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- risk_level must be exactly one of: "low", "medium", "high"
- type must be exactly one of: "added", "modified", "deleted", "refactored"

FOCUS YOUR ANALYSIS ON:
- Understanding the purpose and scope of changes
- Identifying which systems/features are affected
- Summarizing the overall intent of the PR
- Highlighting potential impacts on other parts of the codebase

${Array.isArray(diffsData) ?
  diffsData.map((file: any, index: number) =>
    `FILE ${index + 1}: ${file.fileName || 'unknown'}
CHANGES:
${file.changes || 'No changes'}`
  ).join('\n\n') :
  `FILE: ${diffsData.fileName || 'unknown'}
CHANGES:
${diffsData.changes || 'No changes'}`}
`;

// Spot Issues prompt - focuses on finding bugs and improvements
const spotIssuesPrompt = (diffsData: any) => `
You are an expert code reviewer with deep knowledge of software engineering best practices.
Analyze file changes and identify potential bugs, regressions, and areas for improvement.

DIFF FORMAT UNDERSTANDING:
1. Lines starting with "+" are additions (new code)
2. Lines starting with "-" are deletions (removed code)
3. Lines without prefix are context
4. "@@ -oldStart,oldCount +newStart,newCount @@" shows line number ranges

RESPONSE FORMAT - RETURN ONLY VALID JSON:
[
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
]

IMPORTANT FILE PATH RULES:
- Use the exact file path provided in the "FILE:" sections below
- Do not modify, truncate, or change the file path in any way

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON array - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- severity must be exactly one of: "Critical", "High", "Medium", "Low"
- category must be one of: "Bug", "Security", "Performance", "Maintainability", "Best Practice", "Logic Error"
- "current" and "suggested" fields should contain actual code
- "issue" and "why" fields should contain descriptive text

FOCUS YOUR ANALYSIS ON:
- Security vulnerabilities (SQL injection, XSS, authentication issues)
- Potential bugs and edge cases not handled
- Performance bottlenecks (N+1 queries, memory leaks, inefficient algorithms)
- Race conditions and concurrency issues
- Error handling gaps
- Logic errors that could cause unexpected behavior
- Code that may break existing functionality (regressions)
- ONLY analyze lines that start with + or - (changed code)

${Array.isArray(diffsData) ?
  diffsData.map((file: any, index: number) =>
    `FILE ${index + 1}: ${file.fileName || 'unknown'}
CHANGES:
${file.changes || 'No changes'}`
  ).join('\n\n') :
  `FILE: ${diffsData.fileName || 'unknown'}
CHANGES:
${diffsData.changes || 'No changes'}`}
`;

// Draft Notes prompt - focuses on creating release notes
const draftNotesPrompt = (diffsData: any) => `
You are a technical writer creating release notes for a software update.
Analyze the changes and write user-friendly release notes.

DIFF FORMAT UNDERSTANDING:
1. Lines starting with "+" are additions (new code)
2. Lines starting with "-" are deletions (removed code)
3. Lines without prefix are context

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "version_bump": "patch|minor|major",
  "summary": "One sentence describing the release",
  "sections": {
    "features": [
      "User-facing description of new features"
    ],
    "improvements": [
      "User-facing description of improvements"
    ],
    "bug_fixes": [
      "User-facing description of bugs fixed"
    ],
    "breaking_changes": [
      "Description of any breaking changes users need to know"
    ],
    "technical_notes": [
      "Technical details for developers (refactoring, dependencies, etc.)"
    ]
  },
  "migration_notes": "Instructions if users need to take any action",
  "contributors": "Credit for the changes (if apparent from the diff)"
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- version_bump must be exactly one of: "patch", "minor", "major"
- Empty arrays [] are acceptable for sections with no items
- migration_notes can be null if no migration is needed

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

${Array.isArray(diffsData) ?
  diffsData.map((file: any, index: number) =>
    `FILE ${index + 1}: ${file.fileName || 'unknown'}
CHANGES:
${file.changes || 'No changes'}`
  ).join('\n\n') :
  `FILE: ${diffsData.fileName || 'unknown'}
CHANGES:
${diffsData.changes || 'No changes'}`}
`;

// Get prompt based on action type
export const getPrompt = (diffsData: any, actionType: MRActionType): any => {
  const systemMessages: Record<MRActionType, string> = {
    summarize: `You are an expert code analyst who provides clear, comprehensive summaries of code changes.

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Parse Git diff format correctly to understand what changed
- Focus on explaining the purpose and impact of changes
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,

    spot_issues: `You are an expert code reviewer with deep knowledge of software engineering best practices.

CRITICAL REQUIREMENTS:
- You MUST return ONLY a valid JSON array - no markdown, no explanations, no additional text
- Parse Git diff format correctly to extract accurate file paths and line numbers
- Focus on finding bugs, security issues, and areas for improvement
- Ensure all JSON is perfectly formatted and parseable
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,

    draft_notes: `You are a technical writer who creates clear, user-friendly release notes.

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Translate technical changes into user-understandable language
- Categorize changes appropriately (features, fixes, improvements)
- Ensure all JSON is perfectly formatted and parseable
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,
  };

  const prompts: Record<MRActionType, string> = {
    summarize: summarizePRPrompt(diffsData),
    spot_issues: spotIssuesPrompt(diffsData),
    draft_notes: draftNotesPrompt(diffsData),
  };

  return [
    {
      role: "system",
      content: systemMessages[actionType],
    },
    {
      role: "user",
      content: prompts[actionType],
    },
  ];
};

