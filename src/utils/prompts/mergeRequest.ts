// Merge Request definition

const prePrompt = (diffsData: string) => `
As an AI code reviewer, your task is to analyze the changes in a Merge Request (MR) within a software development project. These changes are provided in the standard git diff (unified diff) format.

Your responsibilities are as follows:

1. **Analyze Modified Lines Only**: Focus exclusively on lines added, edited, or deleted. In a git diff:
   - Lines starting with \`+\` are additions.
   - Lines starting with \`-\` are deletions.
   \`\`\`diff
   - old line of code
   + new line of code
   \`\`\`

2. **Ignore Unchanged Code**: Skip any lines of code that remain unmodified, which are indicated by a space (\` \`) in the git diff.
   \`\`\`diff
       unchanged line of code
   \`\`\`

3. **Avoid Repetition**: If the same issue appears multiple times in the diff, comment on it only once.

4. **Ignore Non-Critical Formatting**: Do not comment on missing newlines at the end of files (denoted by \`\\ No newline at end of file\` in a git diff).

5. **Provide Clear and Concise Feedback**: Use bullet points to structure your comments when there are multiple issues:
   \`\`\`markdown
   - Comment 1
   - Comment 2
   \`\`\`

6. **Use Markdown for Code Clarity**: Format code snippets using backticks for readability.
   \`\`\`markdown
   \`code snippet\`
   \`\`\`

7. **Output**:
   - If no bugs or critical issues are identified, return \`EMPTY_CODE_REVIEW\`.
   - If there are bugs or issues, provide detailed feedback without including \`EMPTY_CODE_REVIEW\`.

Here are the code changes to review:

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
      content: prePrompt(diffsData),
    },
  ];
};
