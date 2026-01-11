import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useFormContext } from "../../../../contexts/FormContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { AI_MODEL_OPTIONS } from "../../../../utils/constants";
import FormField from "../FormField";

const AIProviderTab = () => {
  const { formData, handleChange } = useFormContext();
  const { t } = useLanguage();
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
        <h2 className="section-title">{t("aiProvider.title")}</h2>
        <p className="section-description">
          {t("aiProvider.description")}
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🤖</span>
          {t("aiProvider.providerSelection")}
        </div>
        <div className="group-content">
          <FormField label={t("aiProvider.provider")}>
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
            {t("aiProvider.openaiConfig")}
          </div>
          <div className="group-content">
            <FormField label={t("aiProvider.apiKey")}>
              {renderPasswordInput("GASOpenAIKey", t("aiProvider.enterOpenAIKey"), formData.GASOpenAIKey)}
            </FormField>
            <FormField label={t("aiProvider.model")}>
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
            {t("aiProvider.claudeConfig")}
          </div>
          <div className="group-content">
            <FormField label={t("aiProvider.apiKey")}>
              {renderPasswordInput("GASClaudeKey", t("aiProvider.enterClaudeKey"), formData.GASClaudeKey)}
            </FormField>
            <FormField label={t("aiProvider.model")}>
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
            {t("aiProvider.deepseekConfig")}
          </div>
          <div className="group-content">
            <FormField label={t("aiProvider.apiKey")}>
              {renderPasswordInput("GASDeepSeekAIKey", t("aiProvider.enterDeepSeekKey"), formData.GASDeepSeekAIKey)}
            </FormField>
            <FormField label={t("aiProvider.model")}>
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
            {t("aiProvider.openrouterConfig")}
          </div>
          <div className="group-content">
            <FormField label={t("aiProvider.apiKey")}>
              {renderPasswordInput("GASOpenRouterKey", t("aiProvider.enterOpenRouterKey"), formData.GASOpenRouterKey)}
            </FormField>
            <FormField label={t("aiProvider.model")}>
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
            {t("aiProvider.ollamaConfig")}
          </div>
          <div className="group-content">
            <FormField label={t("aiProvider.serverUrl")}>
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
            <FormField label={t("aiProvider.model")}>
              {renderSelect("GASOllamaModel", formData.GASOllamaModel, AI_MODEL_OPTIONS.ollama)}
            </FormField>
          </div>
        </div>
      )}

      <div className="info-card">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <strong>Tip:</strong> {t("aiProvider.securityTip")}
        </div>
      </div>
    </div>
  );
};

export default AIProviderTab;
