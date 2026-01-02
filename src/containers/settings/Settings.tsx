/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="chrome"/>
/* eslint-disable jsx-a11y/anchor-is-valid */

import { useEffect, useState } from "react";

import { useFormContext } from "../../contexts/FormContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { setStorage } from "../../utils";
import { AI_MODEL_OPTIONS, THEMECOLORS } from "../../utils/constants";
import { AiBOT } from "../../utils/common";
import logoBrand from "../../assets/icons/logo-brand.png";

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

  const toggleOpenAIEyeIcon = (show: boolean): void => setShowAIKey(show);

  return (
    <>
      <div
        className="hero-body"
        style={{ alignItems: "center", paddingTop: "0px" }}
      >
        <div className="container" style={{ borderRadius: "0" }}>
          <div className="has-text-left">
            <a
              href={AiBOT.homepageURL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={logoBrand}
                alt={AiBOT.name}
                style={{
                  height: "64px",
                  marginTop: "24px",
                  marginBottom: "12px",
                }}
              />
            </a>
          </div>

          <div
            className="has-text-centered box"
            style={{
              padding: "64px",
              paddingRight: "88px",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              className="is-size-2"
              style={{
                color: "#00CBC0",
                fontWeight: "bold",
                marginBottom: "40px",
              }}
            >
              Settings
            </div>
            <div className="field is-horizontal">
              <div
                className="field-label"
                style={{
                  justifyContent: "right",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <label className="label has-text-black"> GitLab Web URL </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <p className="control is-expanded">
                      <input
                        className="input"
                        type="text"
                        name="GASGitLab"
                        placeholder="Your gitLab Web URL"
                        onChange={handleChange}
                        value={formData.GASGitLab}
                        style={{ background: "transparent", color: "black" }}
                        readOnly
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div
                className="field-label"
                style={{
                  justifyContent: "right",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <label className="label has-text-black"> API Version </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <p className="control is-expanded">
                      <input
                        className="input has-background-grey-lighter has-text-black"
                        type="text"
                        autoComplete="off"
                        name="GASGitLabApiVersion"
                        placeholder="api/v4"
                        style={{ background: "transparent", color: "black" }}
                        readOnly
                        onChange={handleChange}
                        value={formData.GASGitLabApiVersion}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div
                className="field-label"
                style={{
                  justifyContent: "right",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <label className="label has-text-black"> AI Provider </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <div className="select is-expanded">
                      <select
                        name="GASAiProvider"
                        onChange={handleChange}
                        style={{
                          minWidth: "290px",
                          background: "transparent",
                          color: "black",
                        }}
                        value={formData.GASAiProvider}
                      >
                        <option value={"openai"}>OpenAI</option>
                        <option value={"deepseek"}>DeepSeek</option>
                        <option value={"claude"}>Claude</option>
                        {/* <option value={'ollama'}>Ollama</option> */}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formData.GASAiProvider === "openai" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black">
                    OpenAI Key (Paid)
                  </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <p className="control is-expanded has-text-left">
                        <input
                          className="input"
                          type={showAIKey ? "password" : "input"}
                          autoComplete="off"
                          name="GASOpenAIKey"
                          placeholder="OpenAI Access Token"
                          onChange={handleChange}
                          value={formData.GASOpenAIKey}
                          style={{
                            width: "63%",
                            background: "transparent",
                            color: "black",
                          }}
                        />
                        <FontAwesomeIcon
                          icon={showAIKey ? faEyeSlash : faEye}
                          fontSize="1rem"
                          color="gray"
                          style={{
                            marginTop: "10px",
                            marginLeft: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleOpenAIEyeIcon(!showAIKey)}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "openai" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black"> AI Model </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <div className="select is-expanded">
                        <select
                          name="GASOpenaiModel"
                          onChange={handleChange}
                          style={{
                            minWidth: "290px",
                            background: "transparent",
                            color: "black",
                          }}
                          value={formData.GASOpenaiModel}
                        >
                          {AI_MODEL_OPTIONS.openai.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "claude" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black">
                    Claude API Key (Paid)
                  </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <p className="control is-expanded has-text-left">
                        <input
                          className="input"
                          type={showAIKey ? "password" : "input"}
                          autoComplete="off"
                          name="GASClaudeKey"
                          placeholder="Claude API Key"
                          onChange={handleChange}
                          value={formData.GASClaudeKey}
                          style={{
                            width: "63%",
                            background: "transparent",
                            color: "black",
                          }}
                        />
                        <FontAwesomeIcon
                          icon={showAIKey ? faEyeSlash : faEye}
                          fontSize="1rem"
                          color="gray"
                          style={{
                            marginTop: "10px",
                            marginLeft: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleOpenAIEyeIcon(!showAIKey)}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "claude" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black"> AI Model </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <div className="select is-expanded">
                        <select
                          name="GASClaudeModel"
                          onChange={handleChange}
                          style={{
                            minWidth: "290px",
                            background: "transparent",
                            color: "black",
                          }}
                          value={formData.GASClaudeModel}
                        >
                          {AI_MODEL_OPTIONS.claude.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "deepseek" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black">
                    DeepSeek API Key (Paid)
                  </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <p className="control is-expanded has-text-left">
                        <input
                          className="input"
                          type={showAIKey ? "password" : "input"}
                          autoComplete="off"
                          name="GASDeepSeekAIKey"
                          placeholder="DeepSeek Access Token"
                          onChange={handleChange}
                          value={formData.GASDeepSeekAIKey}
                          style={{
                            width: "63%",
                            background: "transparent",
                            color: "black",
                          }}
                        />
                        <FontAwesomeIcon
                          icon={showAIKey ? faEyeSlash : faEye}
                          fontSize="1rem"
                          color="gray"
                          style={{
                            marginTop: "10px",
                            marginLeft: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleOpenAIEyeIcon(!showAIKey)}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "deepseek" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black"> AI Model </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <div className="select is-expanded">
                        <select
                          name="GASDeepSeekModel"
                          onChange={handleChange}
                          style={{
                            minWidth: "290px",
                            background: "transparent",
                            color: "black",
                          }}
                          value={formData.GASDeepSeekModel}
                        >
                          {AI_MODEL_OPTIONS.deepseek.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "ollama" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black"> Ollama URL </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <p className="control is-expanded">
                        <input
                          className="input"
                          type="text"
                          autoComplete="off"
                          name="GASOllamaURL"
                          placeholder="URL of the Ollama server (e.g. http://localhost:11434)"
                          onChange={handleChange}
                          style={{ background: "transparent", color: "black" }}
                          value={formData.GASOllamaURL}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.GASAiProvider === "ollama" && (
              <div className="field is-horizontal">
                <div
                  className="field-label"
                  style={{
                    justifyContent: "right",
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <label className="label has-text-black"> AI Model </label>
                </div>
                <div className="field-body">
                  <div className="field is-expanded">
                    <div className="field has-addons">
                      <div className="select is-expanded">
                        <select
                          name="GASOllamaModel"
                          onChange={handleChange}
                          style={{
                            minWidth: "290px",
                            background: "transparent",
                            color: "black",
                          }}
                          value={formData.GASOllamaModel}
                        >
                          {AI_MODEL_OPTIONS.ollama.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <article
        className="message has-text-centered has-text-white"
        style={{ marginBottom: "0px" }}
      >
        <div className="message-body" style={{ background: "#333333" }}>
          <p>
            <strong>{AiBOT.name}</strong> is made by{" "}
            <a
              href={AiBOT.homepageURL}
              style={{ color: "#00CBC0", textDecorationLine: "none" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {AiBOT.authorName}
            </a>
            . If you have any ideas? Please contact via (
            <a
              href={`mailto:${AiBOT.authorEmail}`}
              style={{ color: "#00CBC0", textDecorationLine: "none" }}
            >
              {AiBOT.authorEmail}
            </a>
            ).
          </p>
        </div>
      </article>
    </>
  );
}

export default Settings;
