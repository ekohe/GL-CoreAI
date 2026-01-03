/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { useFormContext } from "../../../contexts/FormContext";
import { setStorage } from "../../../utils";
import { AI_MODEL_OPTIONS, THEMECOLORS, USER_ROLE_OPTIONS } from "../../../utils/constants";
import { THEME_COLORS, THEME_GRADIENTS } from "../../../utils/theme";

import SettingsHeader from "./SettingsHeader";
import SettingsFooter from "./SettingsFooter";
import FormField from "./FormField";

const inputStyle = { background: "transparent", color: "black" };
const selectStyle = { minWidth: "290px", background: "transparent", color: "black" };

function Settings() {
  const { formData, handleChange } = useFormContext();
  const [pickedThemeColor, setPickedThemeColor] = useState(THEMECOLORS[0]);
  const [showAIKey, setShowAIKey] = useState(true);

  useEffect(() => {
    setPickedThemeColor(formData.GASThemeColor);
  }, []);

  useEffect(() => {
    setStorage({ GASThemeColor: pickedThemeColor }, () => {
      formData.GASThemeColor = pickedThemeColor;
    });
  }, [pickedThemeColor]);

  const toggleShowKey = () => setShowAIKey(!showAIKey);

  const renderPasswordInput = (name: string, placeholder: string, value: string) => (
    <p className="control is-expanded has-text-left">
      <input
        className="input"
        type={showAIKey ? "password" : "text"}
        autoComplete="off"
        name={name}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
        style={{ ...inputStyle, width: "63%" }}
      />
      <FontAwesomeIcon
        icon={showAIKey ? faEyeSlash : faEye}
        fontSize="1rem"
        color="gray"
        style={{ marginTop: "10px", marginLeft: "10px", cursor: "pointer" }}
        onClick={toggleShowKey}
      />
    </p>
  );

  const renderSelect = (name: string, value: string, options: readonly { readonly value: string; readonly label: string }[]) => (
    <div className="select is-expanded">
      <select name={name} onChange={handleChange} style={selectStyle} value={value}>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <div className="hero-body" style={{ alignItems: "center", paddingTop: "0px" }}>
        <div className="container" style={{ borderRadius: "0" }}>
          <SettingsHeader />

          <div
            className="has-text-centered box"
            style={{ padding: "64px", paddingRight: "88px", backgroundColor: "#ffffff" }}
          >
            {/* Title with gradient */}
            <div
              className="is-size-2"
              style={{
                background: THEME_GRADIENTS.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontWeight: "bold",
                marginBottom: "40px",
              }}
            >
              Settings
            </div>

            {/* GitLab Web URL */}
            <FormField label="GitLab Web URL">
              <p className="control is-expanded">
                <input
                  className="input"
                  type="text"
                  name="GASGitLab"
                  placeholder="Your GitLab Web URL"
                  onChange={handleChange}
                  value={formData.GASGitLab}
                  style={inputStyle}
                  readOnly
                />
              </p>
            </FormField>

            {/* API Version */}
            <FormField label="API Version">
              <p className="control is-expanded">
                <input
                  className="input has-background-grey-lighter has-text-black"
                  type="text"
                  autoComplete="off"
                  name="GASGitLabApiVersion"
                  placeholder="api/v4"
                  style={inputStyle}
                  readOnly
                  onChange={handleChange}
                  value={formData.GASGitLabApiVersion}
                />
              </p>
            </FormField>

            {/* AI Provider */}
            <FormField label="AI Provider">
              <div className="select is-expanded">
                <select
                  name="GASAiProvider"
                  onChange={handleChange}
                  style={selectStyle}
                  value={formData.GASAiProvider}
                >
                  <option value="openai">OpenAI</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="claude">Claude</option>
                </select>
              </div>
            </FormField>

            {/* OpenAI Settings */}
            {formData.GASAiProvider === "openai" && (
              <>
                <FormField label="OpenAI Key (Paid)">
                  {renderPasswordInput("GASOpenAIKey", "OpenAI Access Token", formData.GASOpenAIKey)}
                </FormField>
                <FormField label="AI Model">
                  {renderSelect("GASOpenaiModel", formData.GASOpenaiModel, AI_MODEL_OPTIONS.openai)}
                </FormField>
              </>
            )}

            {/* Claude Settings */}
            {formData.GASAiProvider === "claude" && (
              <>
                <FormField label="Claude API Key (Paid)">
                  {renderPasswordInput("GASClaudeKey", "Claude API Key", formData.GASClaudeKey)}
                </FormField>
                <FormField label="AI Model">
                  {renderSelect("GASClaudeModel", formData.GASClaudeModel, AI_MODEL_OPTIONS.claude)}
                </FormField>
              </>
            )}

            {/* DeepSeek Settings */}
            {formData.GASAiProvider === "deepseek" && (
              <>
                <FormField label="DeepSeek API Key (Paid)">
                  {renderPasswordInput("GASDeepSeekAIKey", "DeepSeek Access Token", formData.GASDeepSeekAIKey)}
                </FormField>
                <FormField label="AI Model">
                  {renderSelect("GASDeepSeekModel", formData.GASDeepSeekModel, AI_MODEL_OPTIONS.deepseek)}
                </FormField>
              </>
            )}

            {/* Ollama Settings */}
            {formData.GASAiProvider === "ollama" && (
              <>
                <FormField label="Ollama URL">
                  <p className="control is-expanded">
                    <input
                      className="input"
                      type="text"
                      autoComplete="off"
                      name="GASOllamaURL"
                      placeholder="URL of the Ollama server (e.g. http://localhost:11434)"
                      onChange={handleChange}
                      style={inputStyle}
                      value={formData.GASOllamaURL}
                    />
                  </p>
                </FormField>
                <FormField label="AI Model">
                  {renderSelect("GASOllamaModel", formData.GASOllamaModel, AI_MODEL_OPTIONS.ollama)}
                </FormField>
              </>
            )}

            {/* Divider */}
            <hr style={{ margin: "32px 0", backgroundColor: THEME_COLORS.border }} />

            {/* User Role Selection */}
            <FormField label="Your Role">
              <div className="select is-expanded">
                <select
                  name="GASUserRole"
                  onChange={handleChange}
                  style={selectStyle}
                  value={formData.GASUserRole}
                >
                  {USER_ROLE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="help" style={{ marginTop: "8px", color: "#666", paddingLeft: "1rem" }}>
                <span style={{ fontWeight: "bold" }}>Select your role</span> to get customized issue summaries tailored to your perspective.
              </p>
            </FormField>
          </div>
        </div>
      </div>

      <SettingsFooter />
    </>
  );
}

export default Settings;

