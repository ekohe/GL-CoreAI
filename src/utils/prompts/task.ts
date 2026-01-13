/**
 * Task Prompts (Legacy)
 *
 * Legacy prompts for issue summarization with HTML output format.
 * This uses a different output format (HTML) compared to newer JSON-based prompts.
 *
 * DEPENDENCIES: Uses policies from ../policies
 * IMPACT: Changes here affect the legacy task summarization feature
 *
 * @deprecated Consider using issueActions.ts for new implementations
 */

import { taskPolicies } from "../policies/index";
import { NAME_FORMATTING_INSTRUCTION } from "./shared";

// =============================================================================
// TASK DEFINITION
// =============================================================================

/**
 * Task definition for HTML-formatted issue summaries
 * Note: This outputs HTML, not JSON like other prompts
 */
const taskDefinition = `
Please respond in English.

You are an AI assistant helping professionals in an AI/ML services company to analyze and summarize issue statuses.
Your role is to provide clear, concise, and actionable information based on the given issue data and discussions.
Remember to maintain consistency in tense usage throughout your response based on the issue status.
First, determine the issue status:
- If issue.state === "closed", consider it a closed issue and use past tense in your response.
- Otherwise, consider it an open issue and use present tense.

${NAME_FORMATTING_INSTRUCTION}

Based on the most current information in the issue and discussions,
provide the following information in an easy to read HTML format:

<div class="summary">Summarize the issue in a detailed paragraph.
Focus on the key points, including the problem, its impact, and any major developments, and maximum 3-5 that are most important to the user.
Any highlighted keywords should be displayed using the format <strong style="color: black;">keyword</strong>. Be concise, and do not leave out any details.
</div>

<h4>Progress</h4>
<p>Describe who is actively working on what aspects of the issue.
Include specific names if available, and detail their contributions.
</p>

<h4>Actions</h4>
<ul class="prompts-list">
  <li>List 3-5 of the most impactful next actions. Consider:
  - Who will take over the next steps and what to do
  - Suggest most effective and efficient ways to resolve the issue
  - Mitigating risk with risk management strategies
  - Increasing revenue through value adds
  - Ensuring transparency for all project stakeholders
  If the issue is closed, check the issue and discussions for any unresolved items that still require action.</li>
</ul>

Remember to maintain consistency in tense usage throughout your response based on the issue status.
`;

// =============================================================================
// EXPORTED API
// =============================================================================

/**
 * Get prompt for legacy task summarization
 *
 * @param issueData - GitLab issue data object
 * @param discussions - Issue discussions/comments
 * @returns Array of messages for LLM API call
 *
 * @deprecated Use issueActions.getPrompt for new implementations
 */
export const getPrompt = (issueData: any, discussions: any): any => {
  const { preTaskPolicy, postTaskPolicy } = taskPolicies.getAIPolicyAndValues();

  const combinedSystemContent = `
${preTaskPolicy}

${taskDefinition}

${postTaskPolicy}
  `.trim();

  return [
    {
      role: "system",
      content: combinedSystemContent,
    },
    {
      role: "user",
      content: `
        Issue Details: ${JSON.stringify(issueData)}\n
        Discussions: ${JSON.stringify(discussions)}
      `,
    },
  ];
};
