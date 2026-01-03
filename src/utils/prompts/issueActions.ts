import { IssueActionType, UserRoleType, USER_ROLES, DEFAULT_USER_ROLE } from "../constants";

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

// Role-specific focus areas for summarization
const getRoleFocusAreas = (role: UserRoleType): string => {
  const focusAreas: Record<UserRoleType, string> = {
    pm: `FOCUS YOUR ANALYSIS AS A PRODUCT MANAGER ON:
- Product requirements and acceptance criteria
- Timeline implications and milestone impacts
- Stakeholder communication points
- User impact and business value
- Priority and scope considerations
- Cross-team dependencies and coordination needs
- Feature completeness and delivery readiness`,

    engineer: `FOCUS YOUR ANALYSIS AS AN ENGINEER ON:
- Technical implementation details and architecture decisions
- Code-related discussions and technical debt
- Performance implications and scalability concerns
- Testing requirements and quality considerations
- Technical dependencies and integration points
- Development effort estimation
- Potential technical blockers and solutions`,

    data: `FOCUS YOUR ANALYSIS AS A DATA ANALYST ON:
- Data requirements and schema changes
- Metrics and KPIs mentioned or impacted
- Analytics implications and tracking needs
- Data quality and validation requirements
- Reporting and dashboard considerations
- Data pipeline and ETL impacts
- Statistical or analytical methodology`,

    sales: `FOCUS YOUR ANALYSIS AS A SALES TEAM MEMBER ON:
- Customer impact and value proposition
- Commercial implications and revenue opportunities
- Client communication points
- Competitive positioning aspects
- Timeline for customer-facing features
- Support and enablement requirements
- Market and customer feedback references`,
  };

  return focusAreas[role] || focusAreas.engineer;
};

// Role-specific system messages
const getRoleSystemMessage = (role: UserRoleType, actionType: IssueActionType): string => {
  const roleContext: Record<UserRoleType, string> = {
    pm: "You are an expert project analyst specializing in product management perspectives. You understand product requirements, timelines, stakeholder needs, and business value.",
    engineer: "You are an expert project analyst specializing in technical perspectives. You understand code implementation, architecture, technical debt, and engineering best practices.",
    data: "You are an expert project analyst specializing in data and analytics perspectives. You understand data requirements, metrics, analytics pipelines, and data-driven insights.",
    sales: "You are an expert project analyst specializing in commercial perspectives. You understand customer needs, business value, market positioning, and revenue implications.",
  };

  const baseMessages: Record<IssueActionType, string> = {
    summarize: `${roleContext[role] || roleContext.engineer}

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Tailor your summary to highlight aspects most relevant to your role perspective
- Focus on extracting key information from the issue and discussions
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,

    analyze_blockers: `${roleContext[role] || roleContext.engineer} You also excel at identifying blockers, dependencies, and risks.

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Focus on finding blockers, dependencies, and potential risks relevant to your role
- Provide actionable recommendations from your role's perspective
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,

    draft_update: `${roleContext[role] || roleContext.engineer} You create professional status updates tailored for stakeholders.

CRITICAL REQUIREMENTS:
- You MUST return ONLY valid JSON - no markdown, no explanations, no additional text
- Write professionally and concisely
- Focus on progress, challenges, and next steps relevant to your role's audience
- Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,
  };

  return baseMessages[actionType];
};

// Role-aware summarize issue prompt
const summarizeIssuePromptWithRole = (issueData: any, discussions: any, role: UserRoleType) => `
You are an expert project analyst. Analyze the GitLab issue and its discussions to provide a comprehensive summary tailored for a ${USER_ROLES[role]?.label || 'team member'}.

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
  "role_perspective": {
    "role": "${role}",
    "key_insights": "Key insights specifically relevant to a ${USER_ROLES[role]?.label || 'team member'}",
    "action_items": ["Role-specific action items or considerations"]
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
      "relevance": "Why this matters for your role"
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

${getRoleFocusAreas(role)}
`;

// Role-aware analyze blockers prompt
const analyzeBlockersPromptWithRole = (issueData: any, discussions: any, role: UserRoleType) => `
You are an expert project risk analyst. Analyze the GitLab issue and its discussions to identify potential blockers, risks, and dependencies from a ${USER_ROLES[role]?.label || 'team member'} perspective.

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
  "role_perspective": {
    "role": "${role}",
    "primary_concerns": "Main concerns from a ${USER_ROLES[role]?.label || 'team member'} perspective",
    "recommended_focus": "What this role should prioritize"
  },
  "blockers": [
    {
      "type": "technical|dependency|resource|decision|external",
      "severity": "Critical|High|Medium|Low",
      "description": "Description of the blocker",
      "mentioned_by": "Who mentioned this blocker",
      "suggested_resolution": "How this might be resolved",
      "role_impact": "How this affects your role specifically"
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

${getRoleFocusAreas(role)}
`;

// Role-aware draft update prompt
const draftUpdatePromptWithRole = (issueData: any, discussions: any, role: UserRoleType) => `
You are a technical writer creating a status update for stakeholders from a ${USER_ROLES[role]?.label || 'team member'} perspective. Analyze the GitLab issue and create a professional progress update.

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
  "role_perspective": {
    "role": "${role}",
    "audience_focus": "What matters most to stakeholders from this role's perspective",
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
  "stakeholder_message": "A professional paragraph suitable for sharing with stakeholders, written from a ${USER_ROLES[role]?.label || 'team member'} perspective"
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
- Tailor the language and focus for a ${USER_ROLES[role]?.label || 'team member'} audience

${getRoleFocusAreas(role)}
`;

// Get prompt based on action type and user role
export const getPrompt = (issueData: any, discussions: any, actionType: IssueActionType, userRole?: UserRoleType): any => {
  const role = userRole || DEFAULT_USER_ROLE;

  const systemMessage = getRoleSystemMessage(role, actionType);

  const prompts: Record<IssueActionType, string> = {
    summarize: summarizeIssuePromptWithRole(issueData, discussions, role),
    analyze_blockers: analyzeBlockersPromptWithRole(issueData, discussions, role),
    draft_update: draftUpdatePromptWithRole(issueData, discussions, role),
  };

  return [
    {
      role: "system",
      content: systemMessage,
    },
    {
      role: "user",
      content: prompts[actionType],
    },
  ];
};

// Legacy function for backwards compatibility (uses default engineer role)
export const getPromptLegacy = (issueData: any, discussions: any, actionType: IssueActionType): any => {
  return getPrompt(issueData, discussions, actionType, DEFAULT_USER_ROLE);
};

