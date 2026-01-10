import { IssueActionType, DEFAULT_OCCUPATION } from "../constants";
import { buildPersonalizationContext, type UserPersonalization } from "../llms/base";

// Summarize Issue prompt - focuses on understanding the issue and its context
const summarizeIssuePrompt = (issueData: any, discussions: any) => `
You are an expert project analyst. Analyze the GitLab issue and its discussions to provide a comprehensive summary.

ISSUE DETAILS:
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Author: ${issueData.author?.name || 'Unknown'}
Assignee: ${issueData.assignee?.name || 'Unassigned'}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Created: ${issueData.created_at || 'Unknown'}
Updated: ${issueData.updated_at || 'Unknown'}

DISCUSSIONS:
${JSON.stringify(discussions, null, 2)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "title": "Brief one-line summary of the issue",
  "overview": "2-3 sentence overview of what this issue is about",
  "current_status": {
    "state": "open|in_progress|blocked|resolved",
    "progress_summary": "Brief description of current progress",
    "last_activity": "Description of the most recent activity"
  },
  "key_points": [
    {
      "type": "requirement|decision|question|concern|update",
      "summary": "Key point from the issue or discussions"
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
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- state must be exactly one of: "open", "in_progress", "blocked", "resolved"
- type must be exactly one of: "requirement", "decision", "question", "concern", "update"

FOCUS YOUR ANALYSIS ON:
- Understanding the core problem or request
- Tracking the discussion flow and key decisions
- Identifying current status and blockers
- Highlighting unanswered questions
`;

// Analyze Blockers prompt - focuses on identifying risks and blockers
const analyzeBlockersPrompt = (issueData: any, discussions: any) => `
You are an expert project risk analyst. Analyze the GitLab issue and its discussions to identify potential blockers, risks, and dependencies.

ISSUE DETAILS:
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Milestone: ${issueData.milestone?.title || 'No milestone'}
Due Date: ${issueData.due_date || 'No due date'}

DISCUSSIONS:
${JSON.stringify(discussions, null, 2)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "risk_level": "low|medium|high|critical",
  "summary": "One sentence summary of the overall risk situation",
  "blockers": [
    {
      "type": "technical|dependency|resource|decision|external",
      "severity": "Critical|High|Medium|Low",
      "description": "Description of the blocker",
      "mentioned_by": "Who mentioned this blocker",
      "suggested_resolution": "How this might be resolved"
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
      "action": "Recommended action to take"
    }
  ]
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- risk_level must be exactly one of: "low", "medium", "high", "critical"
- severity must be exactly one of: "Critical", "High", "Medium", "Low"

FOCUS YOUR ANALYSIS ON:
- Explicit blockers mentioned in discussions
- Implicit dependencies or waiting states
- Timeline risks based on discussion activity
- Resource or knowledge gaps
- Communication issues or unclear requirements
`;

// Draft Update prompt - focuses on creating a status update
const draftUpdatePrompt = (issueData: any, discussions: any) => `
You are a technical writer creating a status update for stakeholders. Analyze the GitLab issue and create a professional progress update.

ISSUE DETAILS:
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Author: ${issueData.author?.name || 'Unknown'}
Assignee: ${issueData.assignee?.name || 'Unassigned'}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Milestone: ${issueData.milestone?.title || 'No milestone'}
Created: ${issueData.created_at || 'Unknown'}
Updated: ${issueData.updated_at || 'Unknown'}

DISCUSSIONS:
${JSON.stringify(discussions, null, 2)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "update_type": "progress|blocker|completion|escalation",
  "headline": "One-line headline for the update",
  "status_indicator": "on_track|at_risk|blocked|completed",
  "summary": "2-3 sentence executive summary",
  "progress": {
    "completed": [
      "List of completed items or milestones"
    ],
    "in_progress": [
      "List of items currently being worked on"
    ],
    "pending": [
      "List of items waiting to be started"
    ]
  },
  "highlights": [
    "Key achievements or important updates"
  ],
  "concerns": [
    "Issues or risks that stakeholders should be aware of"
  ],
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
  "stakeholder_message": "A professional paragraph suitable for sharing with stakeholders"
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- update_type must be exactly one of: "progress", "blocker", "completion", "escalation"
- status_indicator must be exactly one of: "on_track", "at_risk", "blocked", "completed"

WRITING GUIDELINES:
- Write professionally and concisely
- Focus on facts from the issue and discussions
- Be objective about progress and challenges
- Make the stakeholder message suitable for email or Slack sharing
`;

// Occupation-specific focus areas for summarization
const getOccupationFocusAreas = (occupation: string): string => {
  const lowerOccupation = occupation.toLowerCase();

  // Match common occupation keywords
  if (lowerOccupation.includes('project') || lowerOccupation.includes('manager')) {
    return `FOCUS YOUR ANALYSIS ON:
- Project timeline and milestone tracking
- Resource allocation and team coordination
- Risk management and mitigation strategies
- Stakeholder communication and reporting
- Cross-team dependencies and blockers
- Delivery readiness and planning`;
  }

  if (lowerOccupation.includes('product') || lowerOccupation.includes('owner')) {
    return `FOCUS YOUR ANALYSIS ON:
- Product requirements and acceptance criteria
- User stories and feature prioritization
- User experience and customer value
- Product roadmap alignment
- Feature completeness and scope
- Stakeholder expectations and feedback`;
  }

  if (lowerOccupation.includes('engineer') || lowerOccupation.includes('developer') || lowerOccupation.includes('programmer')) {
    return `FOCUS YOUR ANALYSIS ON:
- Technical implementation details and architecture decisions
- Code-related discussions and technical debt
- Performance implications and scalability concerns
- Testing requirements and quality considerations
- Technical dependencies and integration points
- Development effort estimation`;
  }

  if (lowerOccupation.includes('data') || lowerOccupation.includes('scientist') || lowerOccupation.includes('analyst')) {
    return `FOCUS YOUR ANALYSIS ON:
- Data requirements and schema changes
- Metrics and KPIs mentioned or impacted
- Analytics implications and tracking needs
- Data quality and validation requirements
- Data pipeline and processing impacts
- Statistical methodology considerations`;
  }

  if (lowerOccupation.includes('business') || lowerOccupation.includes('sales')) {
    return `FOCUS YOUR ANALYSIS ON:
- Customer impact and value proposition
- Commercial implications and opportunities
- Partnership and collaboration aspects
- Market positioning considerations
- Client relationship management
- Go-to-market strategy`;
  }

  if (lowerOccupation.includes('marketing')) {
    return `FOCUS YOUR ANALYSIS ON:
- Customer messaging and communication
- Brand alignment and positioning
- Campaign and launch planning
- Market research insights
- Content creation needs
- Customer engagement strategies`;
  }

  if (lowerOccupation.includes('design') || lowerOccupation.includes('ux') || lowerOccupation.includes('ui')) {
    return `FOCUS YOUR ANALYSIS ON:
- User experience requirements
- Design specifications and guidelines
- Usability considerations
- Accessibility requirements
- Visual design elements
- User research insights`;
  }

  if (lowerOccupation.includes('qa') || lowerOccupation.includes('test') || lowerOccupation.includes('quality')) {
    return `FOCUS YOUR ANALYSIS ON:
- Testing requirements and coverage
- Quality assurance considerations
- Bug reports and regression risks
- Test automation opportunities
- Acceptance criteria validation
- Release readiness assessment`;
  }

  // Default focus areas
  return `FOCUS YOUR ANALYSIS ON:
- Understanding the core problem or request
- Tracking the discussion flow and key decisions
- Identifying current status and blockers
- Highlighting unanswered questions
- Next steps and action items`;
};

// Get system message based on occupation
const getOccupationSystemMessage = (occupation: string, actionType: IssueActionType): string => {
  const occupationContext = occupation
    ? `You are an expert project analyst helping a ${occupation} understand and analyze this GitLab issue.`
    : "You are an expert project analyst helping a team member understand and analyze this GitLab issue.";

  const baseMessages: Record<IssueActionType, string> = {
    summarize: `${occupationContext}

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Tailor your summary to highlight aspects most relevant to their perspective
- Focus on extracting key information from the issue and discussions
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,

    analyze_blockers: `${occupationContext} You also excel at identifying blockers, dependencies, and risks.

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Focus on finding blockers, dependencies, and potential risks relevant to their work
- Provide actionable recommendations from their perspective
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,

    draft_update: `${occupationContext} You create professional status updates tailored for stakeholders.

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Write professionally and concisely
- Focus on progress, challenges, and next steps relevant to their audience
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,
  };

  return baseMessages[actionType];
};

// Occupation-aware summarize issue prompt
const summarizeIssuePromptWithOccupation = (issueData: any, discussions: any, occupation: string) => `
You are an expert project analyst. Analyze the GitLab issue and its discussions to provide a comprehensive summary tailored for a ${occupation || DEFAULT_OCCUPATION}.

ISSUE DETAILS:
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Author: ${issueData.author?.name || 'Unknown'}
Assignee: ${issueData.assignee?.name || 'Unassigned'}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Created: ${issueData.created_at || 'Unknown'}
Updated: ${issueData.updated_at || 'Unknown'}

DISCUSSIONS:
${JSON.stringify(discussions, null, 2)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "title": "Brief one-line summary of the issue",
  "overview": "2-3 sentence overview of what this issue is about",
  "perspective": {
    "occupation": "${occupation || DEFAULT_OCCUPATION}",
    "key_insights": "Key insights specifically relevant to a ${occupation || DEFAULT_OCCUPATION}",
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
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- state must be exactly one of: "open", "in_progress", "blocked", "resolved"
- type must be exactly one of: "requirement", "decision", "question", "concern", "update"

${getOccupationFocusAreas(occupation)}
`;

// Occupation-aware analyze blockers prompt
const analyzeBlockersPromptWithOccupation = (issueData: any, discussions: any, occupation: string) => `
You are an expert project risk analyst. Analyze the GitLab issue and its discussions to identify potential blockers, risks, and dependencies from a ${occupation || DEFAULT_OCCUPATION} perspective.

ISSUE DETAILS:
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Milestone: ${issueData.milestone?.title || 'No milestone'}
Due Date: ${issueData.due_date || 'No due date'}

DISCUSSIONS:
${JSON.stringify(discussions, null, 2)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "risk_level": "low|medium|high|critical",
  "summary": "One sentence summary of the overall risk situation",
  "perspective": {
    "occupation": "${occupation || DEFAULT_OCCUPATION}",
    "primary_concerns": "Main concerns from a ${occupation || DEFAULT_OCCUPATION} perspective",
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
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- risk_level must be exactly one of: "low", "medium", "high", "critical"
- severity must be exactly one of: "Critical", "High", "Medium", "Low"

${getOccupationFocusAreas(occupation)}
`;

// Occupation-aware draft update prompt
const draftUpdatePromptWithOccupation = (issueData: any, discussions: any, occupation: string) => `
You are a technical writer creating a status update for stakeholders from a ${occupation || DEFAULT_OCCUPATION} perspective. Analyze the GitLab issue and create a professional progress update.

ISSUE DETAILS:
Title: ${issueData.title || 'No title'}
Description: ${issueData.description || 'No description'}
State: ${issueData.state || 'unknown'}
Author: ${issueData.author?.name || 'Unknown'}
Assignee: ${issueData.assignee?.name || 'Unassigned'}
Labels: ${issueData.labels?.join(', ') || 'No labels'}
Milestone: ${issueData.milestone?.title || 'No milestone'}
Created: ${issueData.created_at || 'Unknown'}
Updated: ${issueData.updated_at || 'Unknown'}

DISCUSSIONS:
${JSON.stringify(discussions, null, 2)}

RESPONSE FORMAT - RETURN ONLY VALID JSON:
{
  "update_type": "progress|blocker|completion|escalation",
  "headline": "One-line headline for the update",
  "status_indicator": "on_track|at_risk|blocked|completed",
  "summary": "2-3 sentence executive summary",
  "perspective": {
    "occupation": "${occupation || DEFAULT_OCCUPATION}",
    "audience_focus": "What matters most to stakeholders from this perspective",
    "key_message": "The main takeaway for this audience"
  },
  "progress": {
    "completed": [
      "List of completed items or milestones"
    ],
    "in_progress": [
      "List of items currently being worked on"
    ],
    "pending": [
      "List of items waiting to be started"
    ]
  },
  "highlights": [
    "Key achievements or important updates"
  ],
  "concerns": [
    "Issues or risks that stakeholders should be aware of"
  ],
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
  "stakeholder_message": "A professional paragraph suitable for sharing with stakeholders, written from a ${occupation || DEFAULT_OCCUPATION} perspective"
}

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- update_type must be exactly one of: "progress", "blocker", "completion", "escalation"
- status_indicator must be exactly one of: "on_track", "at_risk", "blocked", "completed"

WRITING GUIDELINES:
- Write professionally and concisely
- Focus on facts from the issue and discussions
- Be objective about progress and challenges
- Make the stakeholder message suitable for email or Slack sharing
- Tailor the language and focus for the ${occupation || DEFAULT_OCCUPATION} audience

${getOccupationFocusAreas(occupation)}
`;

// Get prompt based on action type and user personalization
export const getPrompt = (
  issueData: any,
  discussions: any,
  actionType: IssueActionType,
  occupation?: string,
  personalization?: UserPersonalization
): any => {
  const userOccupation = occupation || personalization?.occupation || DEFAULT_OCCUPATION;

  const systemMessage = getOccupationSystemMessage(userOccupation, actionType);
  const personalizationContext = buildPersonalizationContext(personalization);

  const prompts: Record<IssueActionType, string> = {
    summarize: summarizeIssuePromptWithOccupation(issueData, discussions, userOccupation),
    analyze_blockers: analyzeBlockersPromptWithOccupation(issueData, discussions, userOccupation),
    draft_update: draftUpdatePromptWithOccupation(issueData, discussions, userOccupation),
  };

  // Combine system message with personalization context
  const fullSystemMessage = personalizationContext
    ? `${systemMessage}\n\n${personalizationContext}`
    : systemMessage;

  return [
    {
      role: "system",
      content: fullSystemMessage,
    },
    {
      role: "user",
      content: prompts[actionType],
    },
  ];
};

// Legacy function for backwards compatibility (uses default occupation)
export const getPromptLegacy = (issueData: any, discussions: any, actionType: IssueActionType): any => {
  return getPrompt(issueData, discussions, actionType, DEFAULT_OCCUPATION);
};
