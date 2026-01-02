/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

import {
  calculateTicketAge,
  getAiProvider,
  getClaudeApiKey,
  getClaudeModel,
  getCurrentTabURL,
  getDeepSeekApiKey,
  getDeepSeekModel,
  getOllamaModel,
  getOpenAIApiKey,
  getOpenAIModel,
  openChromeSettingPage,
} from "../../utils";
import {
  extractProjectPathAndIssueIdOrMergeRequestId,
  fetchIssueDetails,
  fetchIssueDiscussions,
  fetchMergeRequestChanges,
  getProjectIdFromPath,
} from "../../utils/gitlab";
import { gitLabIssueSummarize, invokingCodeAnalysis } from "../../utils/llms";
import { GitLabAPI } from "../../utils/gitlabApi";
import { DEFAULT_AI_MODELS, MESSAGES } from "../../utils/constants";

import { enhanceStringPrototype } from './../../utils/enhanceStringPrototype';

enhanceStringPrototype(); // Add titlize method to String.prototype

const renderInfoRow = (label: string, value: JSX.Element | string) => (
  <div className="is-flex mt-1 is-align-items-center">
    <span
      style={{
        color: "#333333",
        fontSize: "0.7rem",
        opacity: "0.7",
        width: "150px",
      }}
    >
      {label}
    </span>
    <span style={{ fontSize: "0.7rem", color: "#000000" }}>
      {value}
    </span>
  </div>
);

const renderButton = (onClickHandler: () => void, message: string) => (
  <div className="control has-text-centered" style={{ margin: "24px 0" }}>
    <button
      className="button is-medium"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: "8px",
        border: "none",
        padding: "12px 28px",
        fontWeight: "600",
        fontSize: "0.9rem",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={onClickHandler}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
      }}
    >
      {message}
    </button>
  </div>
);

const GitLab = (props: { setIsCopy: any; iisRef: any }) => {
  const { iisRef } = props;
  const summarizerDetails = useRef(null);

  const [hasLLMAPIKey, setHasLLMAPIKey] = useState<boolean>(false);
  const [startGitLabAPI, setStartGitLabAPI] = useState<boolean>(false);
  const [enabledLLM, setEnabledLLM] = useState<boolean>(false);
  const [currentTabURL, setCurrentTabURL] = useState<string | undefined>(
    undefined
  );


  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [issueId, setIssueId] = useState<number | undefined>(undefined);
  const [issueData, setIssueData] = useState<any>({});
  const [mergeRequestId, setMergeRequestId] = useState<number | undefined>(
    undefined
  );
  const [mergeRequestChangesData, setMergeRequestChangesData] = useState<any>(
    {}
  );

  useEffect(() => {
    const currentElement = summarizerDetails.current as HTMLElement | null;
    if (!currentElement) return;

    // Initialize GitLab API for code suggestions
    GitLabAPI.setupGlobalFunction();

    const observer = new MutationObserver(() => {
      if (currentElement && currentElement.parentElement) {
        (currentElement.parentElement as HTMLElement).scrollTo({
          top: currentElement.scrollHeight,
          behavior: "smooth"
        });
      }
    });

    observer.observe(currentElement, { childList: true, subtree: true });

    return () => observer.disconnect(); // Cleanup observer on component unmount
  }, [summarizerDetails]);

  useEffect(() => {
    let cancelled = false;

    const computeHasKey = (provider: string | undefined, keys: {
      openAIKey?: string;
      deepSeekKey?: string;
      claudeKey?: string;
    }) => {
      // Ollama doesn't require an API key
      if (provider === "ollama") return true;
      if (provider === "openai") return Boolean(keys.openAIKey?.trim());
      if (provider === "deepseek") return Boolean(keys.deepSeekKey?.trim());
      if (provider === "claude") return Boolean(keys.claudeKey?.trim());

      // Fallback: if provider is missing/unknown, consider any key valid
      return (
        Boolean(keys.openAIKey?.trim()) ||
        Boolean(keys.deepSeekKey?.trim()) ||
        Boolean(keys.claudeKey?.trim())
      );
    };

    const loadLLMSettings = async () => {
      const [
        provider,
        claudeKey,
        openAIKey,
        deepSeekKey,
      ] = await Promise.all([
        getAiProvider(),
        getClaudeApiKey(),
        getOpenAIApiKey(),
        getDeepSeekApiKey(),
      ]);

      if (cancelled) return;

      const hasKey = computeHasKey(provider, { openAIKey, deepSeekKey, claudeKey });

      setHasLLMAPIKey(hasKey);
    };

    const loadTabUrl = async () => {
      const tabURL = await getCurrentTabURL();
      if (cancelled) return;

      // If the tab URL changed, reset per-page state so we don't show stale data.
      setCurrentTabURL(tabURL);
      setProjectId(undefined);
      setIssueId(undefined);
      setIssueData({});
      setMergeRequestId(undefined);
      setMergeRequestChangesData({});
      setEnabledLLM(false);

      setStartGitLabAPI(true);
    };

    const onStorageChange: Parameters<
      typeof chrome.storage.onChanged.addListener
    >[0] = (changes, areaName) => {
      if (areaName !== "sync") return;

      // LLM settings updates
      if (changes.GASAiProvider ||
          changes.GASOpenAIKey ||
          changes.GASDeepSeekAIKey ||
          changes.GASClaudeKey ||
          changes.GASOpenaiModel ||
          changes.GASDeepSeekModel ||
          changes.GASClaudeModel ||
          changes.GASOllamaModel ||
          changes.GASOllamaURL
        ) {
        loadLLMSettings();
        return;
      }

      // Current tab URL updates (when switching GitLab pages)
      if (changes.GASCurrentTabUrl) {
        loadTabUrl();
      }
    };

    loadLLMSettings();
    loadTabUrl();
    chrome.storage.onChanged.addListener(onStorageChange);

    return () => {
      cancelled = true;
      chrome.storage.onChanged.removeListener(onStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadingExtensionSettings = async () => {
      if (startGitLabAPI && currentTabURL && currentTabURL.startsWith("http")) {
        const { projectPath, issueId, mergeRequestId } =
          extractProjectPathAndIssueIdOrMergeRequestId(currentTabURL);

        if (
          projectPath === undefined &&
          issueId === undefined &&
          mergeRequestId === undefined
        ) {
        } else if (projectPath === undefined) {
        } else if (mergeRequestId !== undefined) {
          const gitlabProjectID = await getProjectIdFromPath(currentTabURL);

          if (gitlabProjectID === undefined) {
          } else {
            setProjectId(gitlabProjectID);
            setMergeRequestId(mergeRequestId);

            const changesData = await fetchMergeRequestChanges(
              gitlabProjectID,
              mergeRequestId
            );
            setMergeRequestChangesData(changesData);
          }

          setStartGitLabAPI(false);
        } else if (issueId !== undefined) {
          const gitlabProjectID = await getProjectIdFromPath(currentTabURL);

          if (gitlabProjectID === undefined) {
          } else {
            setProjectId(gitlabProjectID);
            setIssueId(issueId);

            const projectIssueData = await fetchIssueDetails(
              gitlabProjectID,
              issueId
            );
            setIssueData(projectIssueData);
          }

          setStartGitLabAPI(false);
        }
      }
    };

    loadingExtensionSettings();
  }, [startGitLabAPI, currentTabURL]);

  useEffect(() => {
    const loadingLLMAPIs = async () => {
      if (hasLLMAPIKey && enabledLLM && projectId && issueId) {
        // Fetch the issue discussions
        const discussions = await fetchIssueDiscussions(projectId, issueId);

        // Call the LLM with the fetched GitLab data
        await gitLabIssueSummarize(iisRef, issueData, discussions);
      }

      if (hasLLMAPIKey && enabledLLM && projectId && mergeRequestId) {
        const aiProvider = await getAiProvider();

        let model = "";
        if (aiProvider === "claude") {
          model = (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
        } else if (aiProvider === "openai") {
          model = (await getOpenAIModel()) || DEFAULT_AI_MODELS.openai;
        } else if (aiProvider === "deepseek") {
          model = (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;
        } else if (aiProvider === "ollama") {
          model = (await getOllamaModel()) || DEFAULT_AI_MODELS.ollama;
        }

        // Add model info at the top with improved styling
        const modelInfo = document.createElement("div");
        modelInfo.style.cssText = `
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          margin-bottom: 20px;
          color: white;
          font-size: 0.85rem;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        `;
        modelInfo.innerHTML = `
          <span style="display: inline-flex;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span>Code Review with <strong>${(aiProvider || 'AI').charAt(0).toUpperCase() + (aiProvider || 'AI').slice(1)}</strong> (${model})</span>
        `;
        if (iisRef?.current) {
          iisRef.current.appendChild(modelInfo);
        }

        for (const change of mergeRequestChangesData) {
          await invokingCodeAnalysis(iisRef, change);
        }
      }
    };

    loadingLLMAPIs();
  }, [enabledLLM]);

  return (
    <div className="container" id="gitlabAISummarizerDetails" ref={summarizerDetails}>
      {issueData.title && (
        <h3
          style={{
            lineHeight: "40px",
            overflow: "hidden",
            fontSize: "1.1rem",
            fontWeight: "bold",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#000000",
            marginBottom: "16px",
          }}
          title={issueData.title}
        >
          {issueData.title}
        </h3>
      )}

      {Object.keys(issueData).length > 0 && (
        <>
          <div className="gitlab-infos">
            {['author', 'assignee'].map((role: string) => (
              issueData[role] && renderInfoRow(
                role.titlize(),
                <>
                  <a
                    href={issueData[role]?.web_url}
                    target="_blank"
                    style={{
                      textDecoration: "underline",
                      textTransform: "capitalize",
                      fontSize: "0.8rem",
                      display: "contents",
                    }}
                  >
                    <div className="tags has-addons">
                      <span className="tag" style={{fontSize: "0.8rem", paddingRight: "5px", backgroundColor: "#f9f7f9"}}>
                        <img src={issueData[role]?.avatar_url} style={{borderRadius: '50%', height: '25px'}} />
                      </span>
                      <span
                        className="tag"
                        style={{
                          fontSize: "0.8rem",
                          paddingLeft: "10px",
                          backgroundColor: "#f9f7f9",
                          color: "#000000"
                        }}
                      >
                        {issueData[role]?.name}
                      </span>
                    </div>
                  </a>
                </>
              )
            ))}

            {renderInfoRow("Comments", issueData.user_notes_count)}

            {['created_at', 'updated_at'].map((dateType) => (
              issueData[dateType] && renderInfoRow(
                dateType === 'created_at' ? 'Age' : 'Last Updated',
                <>
                  <span style={{ color: "#000000" }}>
                    {calculateTicketAge(issueData[dateType])} days{dateType === 'updated_at' ? ' ago' : ''}
                  </span>{" "}
                  <span style={{ fontSize: "0.8rem", opacity: "0.7" }}>
                    ({new Date(issueData[dateType]).toLocaleDateString()})
                  </span>
                </>
              )
            ))}

            {renderInfoRow("State", issueData.state === "opened" ? "Open" : issueData.state.titlize())}
          </div>

          <hr
            style={{
              marginBlockStart: "1em",
              marginBlockEnd: "1em",
              color: "#151515",
              opacity: "0.1",
            }}
          />
        </>
      )}

      {hasLLMAPIKey && !enabledLLM && projectId && issueId && (renderButton(() => setEnabledLLM(true), MESSAGES.start_ai_summarizing))}
      {!hasLLMAPIKey && (renderButton(() => openChromeSettingPage(), MESSAGES.setup_llm_apikey))}
      {!enabledLLM && projectId && mergeRequestId && (renderButton(() => setEnabledLLM(true), MESSAGES.start_code_review))}

      {hasLLMAPIKey && enabledLLM && projectId && (issueId || mergeRequestId) && (<div ref={iisRef} />)}
    </div>
  );
};

export default GitLab;
