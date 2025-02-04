/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect, useContext, ReactNode, ChangeEvent, useCallback } from 'react';
import { getStorage, setStorage } from '../utils';
import debounce from "lodash/debounce"
import { toastMessage } from '../utils/tools';

interface FormData {
  GASGitLab: string;
  GASGitLabAccessToken: string;
  GASGitLabApiVersion: string;
  GASAiProvider: string;
  GASOpenAIKey: string;
  GASDeepSeekAIKey: string;
  GASOpenaiModel: string;
  GASDeepSeekModel: string;
  GASOllamaURL: string;
  GASOllamaModel: string;
  GASThemeType: string;
  GASThemeColor: string;
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
    GASGitLab: '',
    GASGitLabAccessToken: '',
    GASGitLabApiVersion: 'api/v4',
    GASAiProvider: 'openai',
    GASOpenAIKey: '',
    GASDeepSeekAIKey: '',
    GASOpenaiModel: 'gpt-4o',
    GASDeepSeekModel: 'deepseek-chat',
    GASOllamaURL: 'http://localhost:11434',
    GASOllamaModel: 'llama3.2',
    GASThemeType: 'theme-green',
    GASThemeColor: '#f9f7f9'
  });

  useEffect(() => {
    getStorage(Object.keys(formData), result => {
      setFormData(prevFormData => ({
        ...prevFormData,
        ...result
      }));
    });
  }, []);

  const debouncedSave = useCallback(
    debounce((name: string, value: any) => {
      setStorage({ [name]: value }, () => {
        toastMessage('Settings saved successfully', 'is-link')
      });
    }, 1000),
    [1000]
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const updatedValue = type === 'checkbox' ? (event.target as HTMLInputElement).checked : value;

    setFormData(prevFormData => ({
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
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

export { FormProvider, useFormContext };
