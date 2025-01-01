/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="chrome"/>
/* eslint-disable jsx-a11y/anchor-is-valid */

import { useEffect, useState } from "react";

import { useFormContext } from "../../contexts/FormContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { setStorage } from "../../utils";
import { THEMECOLORS } from "../../utils/constants";
import { AiBOT } from "../../utils/common";
import logoBrand from "../../assets/icons/logo-brand.png";

function Settings() {
  const { formData, handleChange } = useFormContext();
  const [pickedThemeColor, setPickedThemeColor] = useState(THEMECOLORS[0]);
  const [showOpenAIPassword, setShowOpenAIPassword] = useState(true);

  useEffect(() => {
    setPickedThemeColor(formData.GASThemeColor)
  }, [])

  useEffect(() => {
    setStorage({ GASThemeColor: pickedThemeColor }, () => {
      formData.GASThemeColor = pickedThemeColor;
    });
  }, [pickedThemeColor])

  const eyeDropper = async (event: any): Promise<void> => {
    setTimeout(async () => {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const { sRGBHex }: { sRGBHex: string } = await eyeDropper.open();
        navigator.clipboard.writeText(sRGBHex);

        if (event.target && event.target.style) {
          event.target.style.backgroundColor = sRGBHex;
          const inputBox = event.target
            .closest(".ai-theme-color")
            .querySelector("input");
          inputBox.value = sRGBHex;
        }
      } catch (error) {
        console.log("Error! Color code is not picked");
      }
    }, 10);
  };

  const switchOpenAIEyeIcon = (show: boolean) => {
    setShowOpenAIPassword(show)
  }

  return (
    <>
      <div className="hero-body" style={{ alignItems: 'center', paddingTop: '0px' }}>
        <div className="container" style={{ borderRadius: '0' }}>
          <div className="has-text-left">
            <a href={AiBOT.homepageURL} target="_blank" rel="noopener noreferrer">
              <img src={logoBrand} alt={AiBOT.name} style={{ borderRadius: "50%", height: '80px' }} />
            </a>
          </div>

          <div className="has-text-centered box" style={{ paddingTop: '80px', paddingBottom: '80px', backgroundColor: "#ffffff" }}>
            <div className="is-size-2" style={{ color: '#00CBC0', fontWeight: 'bold', marginBottom: '40px'}}> Settings </div>
            <div className="field is-horizontal">
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}>
                <label className="label has-text-black"> GitLab </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <p className="control">
                      <a className="button is-static" style={{ background: "transparent" }}>
                        <FontAwesomeIcon icon={faGitlab} fontSize="24" />
                      </a>
                    </p>
                    <p className="control">
                      <a className="button is-static" style={{ background: "transparent" }}>
                        Web URL
                      </a>
                    </p>
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
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}></div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <p className="control">
                      <a className="button is-static" style={{ background: "transparent" }}>
                        <FontAwesomeIcon icon={faGitlab} fontSize="24" />
                      </a>
                    </p>
                    <p className="control">
                      <a className="button is-static" style={{ background: "transparent" }}>
                        API Version
                      </a>
                    </p>
                    <p className="control is-expanded">
                      <input
                        className="input has-background-grey-lighter has-text-black"
                        type="text"
                        autoComplete="off"
                        name="GASGitLabApiVersion"
                        placeholder="api/v4"
                        style={{ background: "transparent", color: "black" }}
                        readOnly
                        onChange={handleChange} value={formData.GASGitLabApiVersion}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="field is-horizontal">
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}>
                <label className="label has-text-black"> AI Provider </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <div className="select is-expanded">
                      <select
                        name="GASAiProvider"
                        onChange={handleChange}
                        style={{ minWidth: '290px', background: "transparent", color: "black" }}
                        value={formData.GASAiProvider}
                      >
                        <option value={'openai'}>OpenAI</option>
                        {/* <option value={'ollama'}>Ollama</option> */}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formData.GASAiProvider === 'openai' && <div className="field is-horizontal">
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}>
                <label className="label has-text-black"> OpenAI Key (Paid) </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <p className="control">
                      <a className="button is-static" style={{ background: "transparent" }}>
                        OpenAI Key
                      </a>
                    </p>
                    <p className="control is-expanded has-text-left">
                      <input
                        className="input"
                        type={ showOpenAIPassword ? "password" : 'input' }
                        autoComplete="off"
                        name="GASOpenAIKey"
                        placeholder="OpenAI Access Token"
                        onChange={handleChange}
                        value={formData.GASOpenAIKey}
                        style={{ width: "63%", background: "transparent", color: "black" }}
                      />
                      {showOpenAIPassword ?
                      <FontAwesomeIcon
                        icon={faEyeSlash}
                        fontSize="24"
                        color="white"
                        style={{
                          marginTop: '10px',
                          marginLeft: '10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => switchOpenAIEyeIcon(false)}
                      />
                      : <FontAwesomeIcon
                        icon={faEye}
                        fontSize="24"
                        color="white"
                        style={{
                          marginTop: '10px',
                          marginLeft: '10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => switchOpenAIEyeIcon(true)}
                      />}
                    </p>
                  </div>
                </div>
              </div>
            </div>}

            {formData.GASAiProvider === 'openai' && <div className="field is-horizontal">
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}>
                <label className="label has-text-black"> AI Model </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <div className="select is-expanded">
                      <select
                        name="GASOpenaiModel"
                        onChange={handleChange}
                        style={{ minWidth: '290px', background: "transparent", color: "black" }}
                        value={formData.GASOpenaiModel}
                      >
                        <option value={'gpt-4o'}>GPT-4o</option>
                        <option value={'gpt-4o-mini'}>GPT-4o-mini</option>
                        <option value={'o1-preview'}>O1 Preview</option>
                        <option value={'o1-mini'}>O1-mini</option>
                        <option value={'gpt-4'}>GPT-4</option>
                        <option value={'gpt-4-turbo'}>GPT-4-turbo</option>
                        <option value={'gpt-3.5-turbo'}>GPT-3.5-turbo</option>
                        <option value={'dall-e-3'}>DALL·E 3</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {formData.GASAiProvider === 'ollama' && <div className="field is-horizontal">
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}>
                <label className="label has-text-black"> Ollama URL </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <p className="control">
                      <a className="button is-static" style={{ background: "transparent" }}>
                        Ollama URL
                      </a>
                    </p>
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
            </div>}

            {formData.GASAiProvider === 'ollama' && <div className="field is-horizontal">
              <div className="field-label" style={{justifyContent: "right", alignItems: "center", display: "flex"}}>
                <label className="label has-text-black"> AI Model </label>
              </div>
              <div className="field-body">
                <div className="field is-expanded">
                  <div className="field has-addons">
                    <div className="select is-expanded">
                      <select
                        name="GASOllamaModel"
                        onChange={handleChange}
                        style={{ minWidth: "290px", background: "transparent", color: "black" }}
                        value={formData.GASOllamaModel}
                      >
                        <option value={'llama3.1'}>Llama 3.1</option>
                        <option value={'llama3'}>Llama 3</option>
                        <option value={'gemma2'}>Gemma 2</option>
                        <option value={'qwen2'}>Qwen 2</option>
                        <option value={'phi3'}>Phi-3</option>
                        <option value={'mistral'}>Mistral</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          </div>
        </div>
      </div>

      <article className="message has-text-centered has-text-white" style={{ marginBottom: '0px' }}>
        <div className="message-body" style={{ background: '#333333'}}>
          <p>
            <strong>{AiBOT.name}</strong> is made by <a href={AiBOT.homepageURL} style={{color: '#00CBC0'}} target="_blank" rel="noopener noreferrer">{AiBOT.authorName}</a>.

            If you have any ideas? Please contact via (<a href={`mailto:${AiBOT.authorEmail}`} style={{color: '#00CBC0', textDecorationLine: "none"}}>{AiBOT.authorEmail}</a>).
          </p>
        </div>
      </article>
    </>
  );
}

export default Settings;
