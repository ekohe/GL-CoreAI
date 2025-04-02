const codeReviewPrompt = (
  diffsData: string,
  teamContext: string = "",
  businessRequirements: string = ""
) => `
Act as a Senior Software Engineer with 15+ years of experience reviewing mission-critical systems. Analyze the following code rigorously and provide feedback in JSON format. Prioritize issues based on severity and impact in the following order:

1. **Critical Issues**:
   - Security vulnerabilities (e.g., SQLi, XSS, CSRF, hardcoded secrets).
   - Major functional errors or crashes.
   - Broken authentication or authorization flows.

2. **High Priority Issues**:
   - Performance bottlenecks (e.g., inefficient algorithms, blocking async code, memory leaks).
   - Database query inefficiencies or unoptimized network calls.
   - Missing input validation or error handling.

3. **Medium Priority Issues**:
   - Code smells or anti-patterns (e.g., redundant logic, tight coupling).
   - Violations of design principles (SOLID, DRY, YAGNI).
   - Maintainability concerns (e.g., poor naming, ambiguous comments, lack of documentation).

4. **Low Priority Issues**:
   - Styling inconsistencies (e.g., inconsistent naming, formatting, or CSS issues).
   - Missing accessibility attributes (a11y).

**Additional Context:**
${
  teamContext
    ? `Team Conventions: ${teamContext}`
    : "No specific team conventions provided."
}
${
  businessRequirements
    ? `Business Requirements: ${businessRequirements}`
    : "No specific business requirements provided."
}

**Guidelines:**
- Analyze the provided code thoroughly.
- Provide actionable feedback, including code snippets and concrete recommendations.
- Ensure your feedback is relevant to mission-critical systems and follows best practices.

**Output Format:**
Return JSON with categorized feedback, including severity (Critical/High/Medium/Low), specific descriptions, code snippets, and recommendations for fixes. Use the following structure:

\`\`\`json
{
  "feedback": [
    {
      "category": "<Category: Security/Performance/Code Quality/etc.>",
      "severity": "<Critical/High/Medium/Low>",
      "description": "<Description of the issue>",
      "line": <Line number or range where the issue occurs>,
      "code_snippet": "<Relevant code snippet>",
      "recommendation": "<Recommended fix>"
    },
    ...
  ]
}
\`\`\`

**Example Output:**
\`\`\`json
{
  "feedback": [
    {
      "category": "Security",
      "severity": "Critical",
      "description": "Hardcoded API key exposes credentials.",
      "line": 42,
      "code_snippet": "const API_KEY = 'live_12345';",
      "recommendation": "Use environment variables + secrets management (e.g., GitLab CI variables)."
    },
    {
      "category": "Performance",
      "severity": "High",
      "description": "Nested loops causing O(n^2) complexity.",
      "line": 87,
      "code_snippet": "for (const user of users) { for (const post of posts) { ... }}",
      "recommendation": "Optimize with hash maps (O(1) lookups) or pagination."
    }
  ]
}
\`\`\`

**Code to Review:**
${diffsData}
`;

export const getPrompt = (diffsData: any): any => {
  return [
    {
      role: "system",
      content: `As as AI assistant, your role is to provide a detailed code review. Analyze the provided code changes, identify potential issues, suggest improvements, and adhere to best coding practices. Your analysis should be through and consider all aspects of code, including syntax, logic, efficiency and style.`,
    },
    {
      role: "user",
      content: codeReviewPrompt(diffsData),
    },
  ];
};
