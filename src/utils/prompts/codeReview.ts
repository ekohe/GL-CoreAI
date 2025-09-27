const codeReviewPrompt = (diffsData: any) => `
You are an expert code reviewer. You will analyze file changes and provide specific improvement suggestions in JSON format.

IMPORTANT: The data structure you receive includes:
- File path: Already provided to you
- Diff content: Git diff showing changes with +/- lines
- You must calculate line numbers from the diff format

DIFF FORMAT UNDERSTANDING:
1. Lines starting with "+" are additions (new code)
2. Lines starting with "-" are deletions (removed code)
3. Lines without prefix are context
4. "@@ -oldStart,oldCount +newStart,newCount @@" shows line number ranges
   - Use "+newStart" as the base line number for new code
   - Count through the diff to get exact line numbers

RESPONSE FORMAT - RETURN ONLY VALID JSON:
[
  {
    "file": "USE_THE_PROVIDED_FILE_PATH_EXACTLY",
    "line": "actual_line_number_as_string",
    "severity": "Critical|High|Medium|Low",
    "issue": "Clear description of the problem",
    "current": "actual code from the diff",
    "suggested": "improved version of the code",
    "why": "Explanation of why this improvement helps"
  }
]

IMPORTANT FILE PATH RULES:
- Use the exact file path provided in the "FILE:" sections below
- Do not modify, truncate, or change the file path in any way
- Copy the file path exactly as shown after "FILE:" or "FILE N:"

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON array - no markdown, no explanations, no extra text
- All strings must use double quotes and be properly escaped
- No trailing commas allowed
- severity must be exactly one of: "Critical", "High", "Medium", "Low"
- "current" and "suggested" fields should contain actual code
- "issue" and "why" fields should contain descriptive text

LINE NUMBER CALCULATION EXAMPLE:
If you see: "@@ -45,7 +45,9 @@ class MyClass"
And then: "+  new_method_call()"
The line number would be: 45 + (count of lines to reach the + line)

FOCUS YOUR ANALYSIS ON:
- Security vulnerabilities in new/changed code
- Performance bottlenecks
- Code maintainability issues
- Best practice violations
- Logic errors or bugs
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

export const getPrompt = (diffsData: any): any => {
  return [
    {
      role: "system",
      content: `You are an expert code reviewer with deep knowledge of software engineering best practices.

CRITICAL REQUIREMENTS:
- You MUST return ONLY a valid JSON array - no markdown, no explanations, no additional text
- Parse Git diff format correctly to extract accurate file paths and line numbers
- Focus on actionable improvements for code that was actually changed
- Ensure all JSON is perfectly formatted and parseable

Your response will be directly parsed as JSON, so any non-JSON content will cause errors.`,
    },
    {
      role: "user",
      content: codeReviewPrompt(diffsData),
    },
  ];
};
