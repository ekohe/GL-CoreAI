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
  ai_inbox: {
    text: "AI Inbox",
    code: "ai_inbox",
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

// Appearance options
export const APPEARANCE_OPTIONS = [
  { value: "system", label: "System Default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export const DEFAULT_APPEARANCE = "light";

// Language options
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "zh_CN", label: "简体中文" },
  { value: "fr", label: "Français" },
] as const;

export const DEFAULT_LANGUAGE = "en";

// Default occupation for personalization
export const DEFAULT_OCCUPATION = "team member";

export const DEFAULT_AI_MODELS = {
  openai: "gpt-5.2",
  deepseek: "deepseek-chat",
  claude: "claude-opus-4-5-20251101",
  ollama: "llama3.2",
  openrouter: "deepseek/deepseek-r1-0528:free",
} as const;

export const DEFAULT_OLLAMA_URL = "http://localhost:11434";

export const AI_MODEL_OPTIONS = {
  openai: [
    { value: DEFAULT_AI_MODELS.openai, label: "GPT-5.2" },
    { value: "gpt-5.2-pro", label: "GPT-5.2 Pro" },
    { value: "gpt-5.1", label: "GPT-5.1" },
    { value: "gpt-5.1-codex", label: "GPT-5.1 Codex" },
    { value: "gpt-5.1-codex-max", label: "GPT-5.1 Codex Max" },
    { value: "gpt-5", label: "GPT-5" },
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gpt-5-nano", label: "GPT-5 Nano" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "o3", label: "o3" },
    { value: "o3-mini", label: "o3 Mini" },
    { value: "o1", label: "o1" },
    { value: "o1-pro", label: "o1 Pro" },
    { value: "gpt-image-1.5", label: "GPT Image 1.5" },
    { value: "gpt-image-1", label: "GPT Image 1" },
    { value: "gpt-image-1-mini", label: "GPT Image 1 Mini" },
    { value: "gpt-realtime", label: "GPT Realtime" },
    { value: "gpt-realtime-mini", label: "GPT Realtime Mini" },
    { value: "gpt-audio", label: "GPT Audio" },
    { value: "gpt-audio-mini", label: "GPT Audio Mini" },
    { value: "gpt-oss-120b", label: "gpt-oss-120b (Open-weight)" },
    { value: "gpt-oss-20b", label: "gpt-oss-20b (Open-weight)" },
  ],
  claude: [
    // Latest Claude 4.5 Models
    {
      value: DEFAULT_AI_MODELS.claude,
      label: "Claude Opus 4.5 (Latest)",
    },
    {
      value: "claude-sonnet-4-5-20250929",
      label: "Claude Sonnet 4.5 (Latest)",
    },
    {
      value: "claude-haiku-4-5-20251001",
      label: "Claude Haiku 4.5 (Latest)",
    },

    // Claude 4 Models
    {
      value: "claude-opus-4-1-20250805",
      label: "Claude Opus 4.1",
    },
    {
      value: "claude-opus-4-20250514",
      label: "Claude Opus 4",
    },
    {
      value: "claude-sonnet-4-20250514",
      label: "Claude Sonnet 4",
    },

    // Claude 3.5 Models
    {
      value: "claude-3-5-sonnet-20250220",
      label: "Claude 3.5 Sonnet (Latest)",
    },
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet (Oct 2024)",
    },
    {
      value: "claude-3-5-sonnet-20240620",
      label: "Claude 3.5 Sonnet (Jun 2024)",
    },
    {
      value: "claude-3-5-haiku-20241022",
      label: "Claude 3.5 Haiku",
    },
  ],
  deepseek: [
    {
      value: "deepseek-reasoner",
      label: "DeepSeek R1 (Latest - Reasoning)",
    },
    {
      value: DEFAULT_AI_MODELS.deepseek,
      label: "DeepSeek Chat (V2.5)",
    },
    {
      value: "deepseek-coder",
      label: "DeepSeek Coder",
    },
    {
      value: "deepseek-math",
      label: "DeepSeek Math",
    },
    {
      value: "deepseek-llm",
      label: "DeepSeek LLM (67B)",
    },
    {
      value: "deepseek-v2",
      label: "DeepSeek V2 (MoE)",
    },
    {
      value: "deepseek-v2-lite",
      label: "DeepSeek V2 Lite",
    },
    {
      value: "deepseek-r1-distill-qwen-32b",
      label: "DeepSeek R1 Distill Qwen 32B",
    },
    {
      value: "deepseek-r1-distill-llama-70b",
      label: "DeepSeek R1 Distill Llama 70B",
    },
  ],
  ollama: [
    { value: "llama3.3", label: "Llama 3.3 (Latest)" },
    {
      value: DEFAULT_AI_MODELS.ollama,
      label: "Llama 3.2",
    },
    { value: "llama3.1", label: "Llama 3.1" },
    { value: "qwen2.5", label: "Qwen 2.5" },
    { value: "qwen2", label: "Qwen 2" },
    { value: "gemma2", label: "Gemma 2" },
    { value: "deepseek-r1", label: "DeepSeek R1" },
    { value: "phi3.5", label: "Phi-3.5" },
    { value: "phi3", label: "Phi-3" },
    { value: "mistral-nemo", label: "Mistral Nemo" },
    {
      value: "mistral",
      label: "Mistral 7B",
    },
    { value: "codellama", label: "Code Llama" },
  ],
  openrouter: [
    // ═══════════════════════════════════════════════════════════════════════
    // FREE MODELS (No cost per token)
    // ═══════════════════════════════════════════════════════════════════════
    { value: "xiaomi/mimo-v2-flash:free", label: "🆓 MiMo-V2-Flash (Xiaomi, 262K)" },
    { value: "mistralai/devstral-2512:free", label: "🆓 Devstral 2 (Mistral, Coding)" },
    { value: DEFAULT_AI_MODELS.openrouter, label: "🆓 DeepSeek R1 0528 (Default, 164K)" },
    { value: "qwen/qwen3-coder:free", label: "🆓 Qwen3 Coder 480B (262K)" },
    { value: "moonshotai/kimi-k2:free", label: "🆓 Kimi K2 (1T params, 128K)" },
    { value: "tngtech/deepseek-r1t2-chimera:free", label: "🆓 DeepSeek R1T2 Chimera (164K)" },
    { value: "tngtech/deepseek-r1t-chimera:free", label: "🆓 DeepSeek R1T Chimera (164K)" },
    { value: "z-ai/glm-4.5-air:free", label: "🆓 GLM 4.5 Air (131K)" },
    { value: "nvidia/nemotron-3-nano-30b-a3b:free", label: "🆓 Nemotron 3 Nano 30B (NVIDIA)" },
    { value: "google/gemma-3-12b-it:free", label: "🆓 Gemma 3 12B (Google)" },
    { value: "google/gemma-3-4b-it:free", label: "🆓 Gemma 3 4B (Google)" },
    { value: "google/gemma-3n-e4b-it:free", label: "🆓 Gemma 3n 4B (Google, Mobile)" },
    { value: "google/gemma-3n-e2b-it:free", label: "🆓 Gemma 3n 2B (Google, Mobile)" },
    { value: "qwen/qwen3-4b:free", label: "🆓 Qwen3 4B" },
    { value: "qwen/qwen-2.5-vl-7b-instruct:free", label: "🆓 Qwen2.5-VL 7B (Vision)" },
    { value: "allenai/molmo-2-8b:free", label: "🆓 Molmo2 8B (AllenAI, Vision)" },
    { value: "nvidia/nemotron-nano-12b-v2-vl:free", label: "🆓 Nemotron Nano 12B VL (Vision)" },

    // ═══════════════════════════════════════════════════════════════════════
    // PAID MODELS
    // ═══════════════════════════════════════════════════════════════════════
    // Anthropic Models
    { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
    { value: "anthropic/claude-opus-4", label: "Claude Opus 4" },
    { value: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
    { value: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku" },
    // OpenAI Models
    { value: "openai/gpt-4o", label: "GPT-4o" },
    { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "openai/o1", label: "o1" },
    { value: "openai/o1-mini", label: "o1 Mini" },
    { value: "openai/o3-mini", label: "o3 Mini" },
    // Google Models
    { value: "google/gemini-2.0-flash-exp", label: "Gemini 2.0 Flash" },
    { value: "google/gemini-pro-1.5", label: "Gemini Pro 1.5" },
    // Meta Models
    { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B" },
    { value: "meta-llama/llama-3.1-405b-instruct", label: "Llama 3.1 405B" },
    // Mistral Models
    { value: "mistralai/mistral-large", label: "Mistral Large" },
    { value: "mistralai/mixtral-8x22b-instruct", label: "Mixtral 8x22B" },
    // DeepSeek Models
    { value: "deepseek/deepseek-r1", label: "DeepSeek R1" },
    { value: "deepseek/deepseek-chat", label: "DeepSeek Chat" },
    // Other Popular Models
    { value: "qwen/qwen-2.5-72b-instruct", label: "Qwen 2.5 72B" },
    { value: "cohere/command-r-plus", label: "Command R+" },
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
  project_manager: {
    code: "project_manager",
    label: "Project Manager",
    description:
      "Focus on project requirements, timelines, and stakeholder communication",
  },
  product_owner: {
    code: "product_owner",
    label: "Product Owner",
    description:
      "Focus on product requirements, features, and user experience, and prioritize the product roadmap",
  },
  software_engineer: {
    code: "software_engineer",
    label: "Software Engineer",
    description:
      "Focus on technical details, implementation, and code-related aspects, and ensure the code is maintainable and scalable",
  },
  data_scientist: {
    code: "data_scientist",
    label: "Data Scientist",
    description: "Focus on metrics, data requirements, and analytical insights, and ensure the data is accurate and reliable",
  },
  business_development: {
    code: "business_development",
    label: "Business Development",
    description:
      "Focus on customer impact, business value, and commercial aspects, and ensure the business is profitable",
  },
  marketing_specialist: {
    code: "marketing_specialist",
    label: "Marketing Specialist",
    description: "Focus on marketing strategies, campaigns, and customer engagement, and ensure the marketing is effective",
  },
} as const;

export type UserRoleType = keyof typeof USER_ROLES;

export const DEFAULT_USER_ROLE: UserRoleType = "software_engineer";

export const USER_ROLE_OPTIONS = Object.entries(USER_ROLES).map(([value, role]) => ({
  value,
  label: role.label,
}));
