/**
 * Shared Prompt Utilities
 *
 * This file contains common prompt components used across all AI prompts.
 * Centralizing these ensures consistency and makes updates easy.
 *
 * IMPACT: Changes here affect ALL prompts in the application:
 * - issueActions.ts (Issue summarize, analyze blockers, draft update)
 * - mergeRequestActions.ts (MR summarize, spot issues, draft notes)
 * - codeReview.ts (Code review)
 * - aiInbox.ts (Todo processing)
 * - issueChat.ts (Issue chat)
 * - task.ts (Legacy task prompts)
 */

// =============================================================================
// COMMON FORMATTING INSTRUCTIONS
// =============================================================================

/**
 * Name formatting instruction - ensures all person/entity names are clearly identified
 * Used in ALL prompts that may mention people
 */
export const NAME_FORMATTING_INSTRUCTION = `
NAME FORMATTING:
- When mentioning people, always include their full name or username clearly
- Attribute actions, comments, and decisions to specific individuals by name
- Example: "John Smith raised a concern about..." or "User @jsmith suggested..."`;

/**
 * Base JSON requirements for all JSON-returning prompts
 */
export const JSON_REQUIREMENTS_BASE = `
CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object/array - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed`;

/**
 * Get JSON requirements with additional field-specific rules
 */
export const getJsonRequirements = (additionalRules: string[] = []): string => {
  const baseRules = [
    "Return ONLY the JSON object/array - no markdown code fences, no explanations, no extra text",
    'ALL string values MUST be wrapped in double quotes (e.g., "summary": "text here" NOT "summary": text here)',
    "Escape special characters in strings: \\\" for quotes, \\n for newlines, \\\\ for backslashes",
    "No trailing commas allowed",
  ];

  const allRules = [...baseRules, ...additionalRules];
  return `CRITICAL JSON REQUIREMENTS:\n${allRules.map(r => `- ${r}`).join('\n')}`;
};

// =============================================================================
// DIFF FORMAT INSTRUCTIONS (for MR and Code Review)
// =============================================================================

/**
 * Diff format understanding - used for all code diff analysis
 */
export const DIFF_FORMAT_INSTRUCTION = `
DIFF FORMAT UNDERSTANDING:
1. Lines starting with "+" are additions (new code)
2. Lines starting with "-" are deletions (removed code)
3. Lines without prefix are context
4. "@@ -oldStart,oldCount +newStart,newCount @@" shows line number ranges`;

/**
 * Format diff data for prompt inclusion
 */
export const formatDiffData = (diffsData: any): string => {
  if (Array.isArray(diffsData)) {
    return diffsData.map((file: any, index: number) =>
      `FILE ${index + 1}: ${file.fileName || 'unknown'}
CHANGES:
${file.changes || 'No changes'}`
    ).join('\n\n');
  }

  return `FILE: ${diffsData.fileName || 'unknown'}
CHANGES:
${diffsData.changes || 'No changes'}`;
};

// =============================================================================
// ISSUE DATA FORMATTING
// =============================================================================

/**
 * Format issue details for prompts - standard fields
 */
export const formatIssueDetails = (issueData: any, options: {
  includeAuthor?: boolean;
  includeAssignee?: boolean;
  includeMilestone?: boolean;
  includeDueDate?: boolean;
} = {}): string => {
  const {
    includeAuthor = true,
    includeAssignee = true,
    includeMilestone = false,
    includeDueDate = false,
  } = options;

  const lines = [
    `Title: ${issueData.title || 'No title'}`,
    `Description: ${issueData.description || 'No description'}`,
    `State: ${issueData.state || 'unknown'}`,
  ];

  if (includeAuthor) {
    lines.push(`Author: ${issueData.author?.name || 'Unknown'}`);
  }
  if (includeAssignee) {
    lines.push(`Assignee: ${issueData.assignee?.name || 'Unassigned'}`);
  }

  lines.push(`Labels: ${issueData.labels?.join(', ') || 'No labels'}`);

  if (includeMilestone) {
    lines.push(`Milestone: ${issueData.milestone?.title || 'No milestone'}`);
  }
  if (includeDueDate) {
    lines.push(`Due Date: ${issueData.due_date || 'No due date'}`);
  }

  lines.push(`Created: ${issueData.created_at || 'Unknown'}`);
  lines.push(`Updated: ${issueData.updated_at || 'Unknown'}`);

  return lines.join('\n');
};

/**
 * Format discussions for prompt inclusion
 */
export const formatDiscussions = (discussions: any): string => {
  return JSON.stringify(discussions, null, 2);
};

// =============================================================================
// SEVERITY AND STATUS ENUMS
// =============================================================================

export const SEVERITY_VALUES = ["Critical", "High", "Medium", "Low"] as const;
export const RISK_LEVEL_VALUES = ["low", "medium", "high", "critical"] as const;
export const ISSUE_STATE_VALUES = ["open", "in_progress", "blocked", "resolved"] as const;
export const KEY_POINT_TYPES = ["requirement", "decision", "question", "concern", "update"] as const;
export const UPDATE_TYPES = ["progress", "blocker", "completion", "escalation"] as const;
export const STATUS_INDICATORS = ["on_track", "at_risk", "blocked", "completed"] as const;

// =============================================================================
// SYSTEM MESSAGE TEMPLATES
// =============================================================================

/**
 * Base system message for JSON-returning prompts
 */
export const getJsonSystemMessage = (role: string, additionalContext: string = ''): string => {
  return `${role}

CRITICAL JSON REQUIREMENTS:
- You MUST return ONLY valid, parseable JSON - no markdown code fences, no explanations, no additional text
- ALL string values MUST be wrapped in double quotes (e.g., "key": "value" NOT "key": value)
- Properly escape special characters in strings: use \\" for quotes, \\n for newlines
- Do NOT use trailing commas
- Do NOT include comments in the JSON
${additionalContext ? `- ${additionalContext}\n` : ''}- Your response will be directly parsed by JSON.parse(), so any syntax errors will cause failures.`;
};

// =============================================================================
// OCCUPATION-SPECIFIC UTILITIES
// =============================================================================

/**
 * Occupation-specific focus areas for analysis
 */
export const getOccupationFocusAreas = (occupation: string): string => {
  const lowerOccupation = occupation.toLowerCase();

  const focusAreas: Record<string, string[]> = {
    'project|manager': [
      "Project timeline and milestone tracking",
      "Resource allocation and team coordination",
      "Risk management and mitigation strategies",
      "Stakeholder communication and reporting",
      "Cross-team dependencies and blockers",
      "Delivery readiness and planning",
    ],
    'product|owner': [
      "Product requirements and acceptance criteria",
      "User stories and feature prioritization",
      "User experience and customer value",
      "Product roadmap alignment",
      "Feature completeness and scope",
      "Stakeholder expectations and feedback",
    ],
    'engineer|developer|programmer': [
      "Technical implementation details and architecture decisions",
      "Code-related discussions and technical debt",
      "Performance implications and scalability concerns",
      "Testing requirements and quality considerations",
      "Technical dependencies and integration points",
      "Development effort estimation",
    ],
    'data|scientist|analyst': [
      "Data requirements and schema changes",
      "Metrics and KPIs mentioned or impacted",
      "Analytics implications and tracking needs",
      "Data quality and validation requirements",
      "Data pipeline and processing impacts",
      "Statistical methodology considerations",
    ],
    'business|sales': [
      "Customer impact and value proposition",
      "Commercial implications and opportunities",
      "Partnership and collaboration aspects",
      "Market positioning considerations",
      "Client relationship management",
      "Go-to-market strategy",
    ],
    'marketing': [
      "Customer messaging and communication",
      "Brand alignment and positioning",
      "Campaign and launch planning",
      "Market research insights",
      "Content creation needs",
      "Customer engagement strategies",
    ],
    'design|ux|ui': [
      "User experience requirements",
      "Design specifications and guidelines",
      "Usability considerations",
      "Accessibility requirements",
      "Visual design elements",
      "User research insights",
    ],
    'qa|test|quality': [
      "Testing requirements and coverage",
      "Quality assurance considerations",
      "Bug reports and regression risks",
      "Test automation opportunities",
      "Acceptance criteria validation",
      "Release readiness assessment",
    ],
  };

  // Find matching occupation
  for (const [pattern, areas] of Object.entries(focusAreas)) {
    const keywords = pattern.split('|');
    if (keywords.some(keyword => lowerOccupation.includes(keyword))) {
      return `FOCUS YOUR ANALYSIS ON:\n${areas.map(a => `- ${a}`).join('\n')}`;
    }
  }

  // Default focus areas
  return `FOCUS YOUR ANALYSIS ON:
- Understanding the core problem or request
- Tracking the discussion flow and key decisions
- Identifying current status and blockers
- Highlighting unanswered questions
- Next steps and action items`;
};

/**
 * Get occupation context string for system messages
 */
export const getOccupationContext = (occupation: string, role: string = "expert project analyst"): string => {
  return occupation
    ? `You are an ${role} helping a ${occupation} understand and analyze this content.`
    : `You are an ${role} helping a team member understand and analyze this content.`;
};

// =============================================================================
// RESPONSE SCHEMAS (for documentation and validation)
// =============================================================================

/**
 * Common response field schemas - use for reference in prompts
 */
export const RESPONSE_SCHEMAS = {
  stakeholders: `"stakeholders": {
    "author": "Author name and their role/context if apparent",
    "assignee": "Assignee name and their responsibilities",
    "participants": ["List of other participants in discussions"]
  }`,

  actionItem: `{
    "owner": "Who is responsible",
    "action": "What needs to be done",
    "due": "When it's due or priority level"
  }`,

  blocker: `{
    "type": "technical|dependency|resource|decision|external",
    "severity": "Critical|High|Medium|Low",
    "description": "Description of the blocker",
    "mentioned_by": "Who mentioned this blocker",
    "suggested_resolution": "How this might be resolved"
  }`,

  codeIssue: `{
    "file": "exact file path",
    "line": "line number as string",
    "severity": "Critical|High|Medium|Low",
    "issue": "Clear description of the problem",
    "current": "actual code from the diff",
    "suggested": "improved version of the code",
    "why": "Explanation of why this improvement helps"
  }`,
};
