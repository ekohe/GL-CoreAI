import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useFormContext } from "../../../../contexts/FormContext";
import { AI_MODEL_OPTIONS } from "../../../../utils/constants";
import FormField from "../FormField";

const AIProviderTab = () => {
  const { formData, handleChange } = useFormContext();
  const [showAIKey, setShowAIKey] = useState(true);

  const toggleShowKey = () => setShowAIKey(!showAIKey);

  const renderPasswordInput = (name: string, placeholder: string, value: string) => (
    <div className="control has-icons-right is-expanded">
      <input
        className="input"
        type={showAIKey ? "password" : "text"}
        autoComplete="off"
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
      />
      <span className="icon is-right is-clickable" onClick={toggleShowKey}>
        <FontAwesomeIcon
          icon={showAIKey ? faEyeSlash : faEye}
          color="#999"
        />
      </span>
    </div>
  );

  const renderSelect = (name: string, value: string, options: readonly { readonly value: string; readonly label: string }[]) => (
    <div className="control">
      <div className="select is-fullwidth">
        <select name={name} onChange={handleChange} value={value}>
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">AI Provider Settings</h2>
        <p className="section-description">
          Configure your preferred AI provider and model for code analysis
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🤖</span>
          Provider Selection
        </div>
        <div className="group-content">
          <FormField label="Provider">
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  name="GASAiProvider"
                  onChange={handleChange}
                  value={formData.GASAiProvider}
                >
                  <option value="openai">OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="claude">Claude</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama (Local)</option>
                </select>
              </div>
            </div>
          </FormField>
        </div>
      </div>

      {/* OpenAI Settings */}
      {formData.GASAiProvider === "openai" && (
        <div className="settings-group provider-settings">
          <div className="group-title">
            <span className="group-icon">🔑</span>
            OpenAI Configuration
          </div>
          <div className="group-content">
            <FormField label="API Key">
              {renderPasswordInput("GASOpenAIKey", "Enter your OpenAI API key (sk-...)", formData.GASOpenAIKey)}
            </FormField>
            <FormField label="Model">
              {renderSelect("GASOpenaiModel", formData.GASOpenaiModel, AI_MODEL_OPTIONS.openai)}
            </FormField>
          </div>
        </div>
      )}

      {/* Claude Settings */}
      {formData.GASAiProvider === "claude" && (
        <div className="settings-group provider-settings">
          <div className="group-title">
            <span className="group-icon">🔑</span>
            Claude Configuration
          </div>
          <div className="group-content">
            <FormField label="API Key">
              {renderPasswordInput("GASClaudeKey", "Enter your Claude API key (sk-ant-...)", formData.GASClaudeKey)}
            </FormField>
            <FormField label="Model">
              {renderSelect("GASClaudeModel", formData.GASClaudeModel, AI_MODEL_OPTIONS.claude)}
            </FormField>
          </div>
        </div>
      )}

      {/* DeepSeek Settings */}
      {formData.GASAiProvider === "deepseek" && (
        <div className="settings-group provider-settings">
          <div className="group-title">
            <span className="group-icon">🔑</span>
            DeepSeek Configuration
          </div>
          <div className="group-content">
            <FormField label="API Key">
              {renderPasswordInput("GASDeepSeekAIKey", "Enter your DeepSeek API key", formData.GASDeepSeekAIKey)}
            </FormField>
            <FormField label="Model">
              {renderSelect("GASDeepSeekModel", formData.GASDeepSeekModel, AI_MODEL_OPTIONS.deepseek)}
            </FormField>
          </div>
        </div>
      )}

      {/* OpenRouter Settings */}
      {formData.GASAiProvider === "openrouter" && (
        <div className="settings-group provider-settings">
          <div className="group-title">
            <span className="group-icon">🌐</span>
            OpenRouter Configuration
          </div>
          <div className="group-content">
            <FormField label="API Key">
              {renderPasswordInput("GASOpenRouterKey", "Enter your OpenRouter API key (sk-or-...)", formData.GASOpenRouterKey)}
            </FormField>
            <FormField label="Model">
              {renderSelect("GASOpenRouterModel", formData.GASOpenRouterModel, AI_MODEL_OPTIONS.openrouter)}
            </FormField>
          </div>
        </div>
      )}

      {/* Ollama Settings */}
      {formData.GASAiProvider === "ollama" && (
        <div className="settings-group provider-settings">
          <div className="group-title">
            <span className="group-icon">🖥️</span>
            Ollama Configuration (Local)
          </div>
          <div className="group-content">
            <FormField label="Server URL">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  autoComplete="off"
                  name="GASOllamaURL"
                  placeholder="http://localhost:11434"
                  onChange={handleChange}
                  value={formData.GASOllamaURL}
                />
              </div>
            </FormField>
            <FormField label="Model">
              {renderSelect("GASOllamaModel", formData.GASOllamaModel, AI_MODEL_OPTIONS.ollama)}
            </FormField>
          </div>
        </div>
      )}

      <div className="info-card">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <strong>Tip:</strong> API keys are stored securely in your browser and never shared.
        </div>
      </div>
    </div>
  );
};

export default AIProviderTab;
