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
