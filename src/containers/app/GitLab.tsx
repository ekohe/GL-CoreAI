/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import {
  calculateTicketAge,
  getAiProvider,
  getCurrentTabURL,
  getOpenAIApiKey,
  openChromeSettingPage,
} from "../../utils";
import {
  extractProjectPathAndIssueIdOrMergeRequestId,
  fetchIssueDetails,
  fetchIssueDiscussions,
  fetchMergeRequestChanges,
  getProjectIdFromPath,
} from "../../utils/gitlab";
import { fetchLLMTaskSummarizer, invokingCodeAnalysis } from "../../utils/llm";
import { MESSAGES } from "../../utils/constants";

import { enhanceStringPrototype } from './../../utils/enhanceStringPrototype';

enhanceStringPrototype(); // Add titlize method to String.prototype

const openAIApiKey = await getOpenAIApiKey();
const currentTabURL = await getCurrentTabURL();

const renderInfoRow = (label: string, value: JSX.Element | string) => (
    <div className="is-flex mt-1 is-align-items-center">
      <span
        style={{
          color: "#333333",
          fontSize: "18px",
          opacity: "0.7",
          width: "150px",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "18px", color: "#000000" }}>
        {value}
      </span>
    </div>
  );


const renderButton = (onClickHandler: () => void, message: string) => (
  <div className="control has-text-centered">
    <button
      className="button is-medium link-color m-6"
      style={{
        backgroundColor: "transparent",
        borderRadius: "0",
        borderWidth: "2px",
      }}
      onClick={onClickHandler}
    >
      {message}
    </button>
  </div>
);

const GitLab = (props: { setIsCopy: any; iisRef: any }) => {
  const { iisRef } = props;

  const [hasOpenaiKey, setHasOpenaiKey] = useState<boolean>(true);
  const [startGitLabAPI, setStartGitLabAPI] = useState<boolean>(false);
  const [enabledLLM, setEnabledLLM] = useState<boolean>(false);

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
    const loadingExtensionSettings = async () => {
      setStartGitLabAPI(true);
      setHasOpenaiKey((openAIApiKey !== undefined && openAIApiKey !== ''));
    };

    loadingExtensionSettings();
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
  }, [startGitLabAPI]);

  useEffect(() => {
    const loadingOpenAILLM = async () => {
      if (hasOpenaiKey && enabledLLM && projectId && issueId) {
        // Fetch the issue discussions
        const discussions = await fetchIssueDiscussions(projectId, issueId);

        // Call the LLM with the fetched GitLab data
        await fetchLLMTaskSummarizer(iisRef, issueData, discussions);
      }

      if (hasOpenaiKey && enabledLLM && projectId && mergeRequestId) {
        const aiProvider = await getAiProvider();

        let urlSection = document.createElement("p");
        urlSection.innerHTML = `
          <em>Invoking ${aiProvider} code analysis...</em>
        `;
        urlSection.style.paddingBottom = "0px";
        urlSection.style.marginBottom = "5px";
        iisRef.current.appendChild(urlSection);

        for (const change of mergeRequestChangesData) {
          await invokingCodeAnalysis(iisRef, change);
        }
      }
    };

    loadingOpenAILLM();
  }, [enabledLLM]);

  return (
    <div className="container" id="gitlabAISummarizerDetails">
      {issueData.title && (
        <h3
          style={{
            lineHeight: "40px",
            overflow: "hidden",
            fontSize: "25px",
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
                      fontSize: "16px",
                      display: "contents",
                    }}
                  >
                    <div className="tags has-addons">
                      <span className="tag" style={{fontSize: "18px", paddingRight: "5px", backgroundColor: "#f9f7f9"}}>
                        <img src={issueData[role]?.avatar_url} style={{borderRadius: '50%', height: '25px'}} />
                      </span>
                      <span
                        className="tag"
                        style={{
                          fontSize: "18px",
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
                  <span style={{ fontSize: "16px", opacity: "0.7" }}>
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

      {hasOpenaiKey && !enabledLLM && projectId && issueId && (renderButton(() => setEnabledLLM(true), MESSAGES.start_ai_summarizing))}
      {!hasOpenaiKey && (renderButton(() => openChromeSettingPage(), MESSAGES.setup_openaikey))}
      {!enabledLLM && projectId && mergeRequestId && (renderButton(() => {}, MESSAGES.code_review_coming_soon))}

      {hasOpenaiKey && enabledLLM && projectId && (issueId || mergeRequestId) && (<div ref={iisRef} />)}
    </div>
  );
};

export default GitLab;
