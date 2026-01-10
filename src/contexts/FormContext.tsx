/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  ChangeEvent,
  useCallback,
} from "react";
import { getStorage, setStorage } from "../utils";
import debounce from "lodash/debounce";
import { toastMessage } from "../utils/tools";
import {
  DEFAULT_AI_MODELS,
  DEFAULT_AI_PROVIDER,
  DEFAULT_OLLAMA_URL,
  DEFAULT_APPEARANCE,
  DEFAULT_LANGUAGE,
} from "../utils/constants";

interface FormData {
  // GitLab settings
  GASGitLab: string;
  GASGitLabAccessToken: string;
  GASGitLabApiVersion: string;
  // AI Provider settings
  GASAiProvider: string;
  GASOpenAIKey: string;
  GASDeepSeekAIKey: string;
  GASClaudeKey: string;
  GASOpenRouterKey: string;
  GASOpenaiModel: string;
  GASDeepSeekModel: string;
  GASClaudeModel: string;
  GASOllamaURL: string;
  GASOllamaModel: string;
  GASOpenRouterModel: string;
  // General settings
  GASThemeType: string;
  GASThemeColor: string;
  GASAppearance: string;
  GASLanguage: string;
  // Personalization settings
  GASNickname: string;
  GASOccupation: string;
  GASAboutYou: string;
  GASCustomInstructions: string;
}

interface FormContextType {
  formData: FormData;
  handleChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({
    // GitLab settings
    GASGitLab: "",
    GASGitLabAccessToken: "",
    GASGitLabApiVersion: "api/v4",
    // AI Provider settings
    GASAiProvider: DEFAULT_AI_PROVIDER,
    GASOpenAIKey: "",
    GASDeepSeekAIKey: "",
    GASClaudeKey: "",
    GASOpenRouterKey: "",
    GASOpenaiModel: DEFAULT_AI_MODELS.openai,
    GASDeepSeekModel: DEFAULT_AI_MODELS.deepseek,
    GASClaudeModel: DEFAULT_AI_MODELS.claude,
    GASOllamaURL: DEFAULT_OLLAMA_URL,
    GASOllamaModel: DEFAULT_AI_MODELS.ollama,
    GASOpenRouterModel: DEFAULT_AI_MODELS.openrouter,
    // General settings
    GASThemeType: "theme-green",
    GASThemeColor: "#f9f7f9",
    GASAppearance: DEFAULT_APPEARANCE,
    GASLanguage: DEFAULT_LANGUAGE,
    // Personalization settings
    GASNickname: "",
    GASOccupation: "",
    GASAboutYou: "",
    GASCustomInstructions: "",
  });

  useEffect(() => {
    getStorage(Object.keys(formData), (result) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ...result,
      }));
    });
  }, []);

  const debouncedSave = useCallback(
    debounce((name: string, value: any) => {
      setStorage({ [name]: value }, () => {
        toastMessage("Settings saved successfully", "is-link");
      });
    }, 1000),
    [1000]
  );

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = event.target;
    const updatedValue =
      type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: updatedValue,
    }));

    debouncedSave(name, updatedValue);
  };

  return (
    <FormContext.Provider value={{ formData, handleChange }}>
      {children}
    </FormContext.Provider>
  );
};

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};

export { FormProvider, useFormContext };
