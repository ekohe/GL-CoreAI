export const AI_EXT_STATUS = {
  signin: {
    text: "Sign In",
    code: "signin",
  },
  signout: {
    text: "Sign Out",
    code: "signout",
  },
  signup: {
    text: "Sign Up",
    code: "signup",
  },
  summarizer: {
    text: "Summarizer",
    code: "summarizer",
  },
  forget_password: {
    text: "Forget Password?",
    code: "forget_password",
  },
  reset_password: {
    text: "Reset Password",
    code: "reset_password",
  },
};

export const THEMECOLORS = [
  "#f9f7f9",
  "#d99530",
  "#1f75cb",
  "#ff362c",
  "#647e0e",
  "#155635",
  "#0e4328",
  "#0e4d8d",
  "#0b2640",
  "#41419f",
  "#222261",
  "#28272d",
  "#a02e1c",
];

export const DEFAULT_AI_PROVIDER = "openai";

export const DEFAULT_AI_MODELS = {
  openai: "gpt-4o",
  deepseek: "deepseek-chat",
  claude: "claude-3-opus-20240229",
  ollama: "llama3.2",
} as const;

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

export const AI_MODEL_OPTIONS = {
  openai: [
    { value: "gpt-5.2", label: "GPT-5.2" },
    { value: "gpt-5.0-mini", label: "GPT-5.0 Mini" },
    { value: "gpt-4.5-orion", label: "GPT-4.5 (Orion)" },
    { value: "o3-mini-high", label: "o3 Mini High - Reasoning" },
    { value: DEFAULT_AI_MODELS.openai, label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "o1-preview", label: "o1 Preview" },
    { value: "o1-mini", label: "o1 Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  claude: [
    {
      value: "claude-3-5-sonnet-20250220",
      label: "Claude 3.5 Sonnet (Latest)",
    },
    { value: "claude-3-5-haiku-20250220", label: "Claude 3.5 Haiku (Fast)" },
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet (Legacy)",
    },
    { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
    { value: DEFAULT_AI_MODELS.claude, label: "Claude 3 Opus" },
  ],
  deepseek: [
    { value: "deepseek-reasoner", label: "DeepSeek R1 (Latest - Reasoning)" },
    { value: DEFAULT_AI_MODELS.deepseek, label: "DeepSeek Chat (V2.5)" },
  ],
  ollama: [
    { value: "llama3.3", label: "Llama 3.3 (Latest)" },
    { value: DEFAULT_AI_MODELS.ollama, label: "Llama 3.2" },
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "qwen2.5", label: "Qwen 2.5" },
    { value: "qwen2", label: "Qwen 2" },
    { value: "gemma2", label: "Gemma 2" },
    { value: "deepseek-r1", label: "DeepSeek R1" },
    { value: "phi3.5", label: "Phi-3.5" },
    { value: "phi3", label: "Phi-3" },
    { value: "mistral-nemo", label: "Mistral Nemo" },
    { value: "mistral", label: "Mistral 7B" },
    { value: "codellama", label: "Code Llama" },
  ],
} as const;

export const MESSAGES = {
  missing_email: "Please provide your email address.",
  invalid_email: "The email address entered is invalid.",
  missing_password: "Please enter your password.",
  invalid_password: "Password must be at least 8 characters.",
  missing_confirm_password: "Please confirm your password.",
  password_not_match: "The passwords do not match.",
  reset_password: "Check your email for instructions to reset your password.",
  setup_llm_apikey: "Setup an LLM API key",
  missing_gitlab_access_token: "GitLab access token was not found.",
  setup_gitlab_access_token: "Setup an GitLab Access Token",
  start_ai_summarizing: "Summarize this issue",
  start_code_review: "Start Code Review",
  not_gitlab_url: "This is not a GitLab URL.",
  not_task_url: "This is not a GitLab issue/task URL.",
};

// MR Action Types for different code review actions
export const MR_ACTION_TYPES = {
  summarize: {
    code: "summarize",
    title: "Summarize PR",
    description: "Summarize the changes in this pull request and potential impacts.",
    icon: "summarize",
  },
  spot_issues: {
    code: "spot_issues",
    title: "Spot issues",
    description: "Point out potential bugs or regressions and suggest improvements.",
    icon: "issues",
  },
  draft_notes: {
    code: "draft_notes",
    title: "Draft notes",
    description: "Write a concise release-note summary for this PR.",
    icon: "notes",
  },
} as const;

export type MRActionType = keyof typeof MR_ACTION_TYPES;

// Issue Action Types for different issue analysis actions
export const ISSUE_ACTION_TYPES = {
  summarize: {
    code: "summarize",
    title: "Summarize Issue",
    description: "Summarize the issue details, discussions, and current status.",
    icon: "summarize",
  },
  analyze_blockers: {
    code: "analyze_blockers",
    title: "Analyze blockers",
    description: "Identify potential blockers, risks, and dependencies.",
    icon: "blockers",
  },
  draft_update: {
    code: "draft_update",
    title: "Draft update",
    description: "Write a status update or progress summary for stakeholders.",
    icon: "update",
  },
} as const;

export type IssueActionType = keyof typeof ISSUE_ACTION_TYPES;

// User Role Types for role-based issue summarization
export const USER_ROLES = {
  pm: {
    code: "pm",
    label: "Product Manager",
    description: "Focus on product requirements, timelines, and stakeholder communication",
  },
  engineer: {
    code: "engineer",
    label: "Engineer",
    description: "Focus on technical details, implementation, and code-related aspects",
  },
  data: {
    code: "data",
    label: "Data Analyst",
    description: "Focus on metrics, data requirements, and analytical insights",
  },
  sales: {
    code: "sales",
    label: "Sales",
    description: "Focus on customer impact, business value, and commercial aspects",
  },
} as const;

export type UserRoleType = keyof typeof USER_ROLES;

export const DEFAULT_USER_ROLE: UserRoleType = "engineer";

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLES).map(([value, role]) => ({
  value,
  label: role.label,
}));
