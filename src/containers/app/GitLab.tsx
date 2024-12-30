/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import {
  calculateTicketAge,
  getAiProvider,
  getCurrentTabURL,
  getOpenAIApiKey,
  getThemeColor,
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

const openAIApiKey = await getOpenAIApiKey();
const themeColor = await getThemeColor();
const currentTabURL = await getCurrentTabURL();

const GitLab = (props: { setIsCopy: any; iisRef: any }) => {
  const { setIsCopy, iisRef } = props;

  const [hasOpenaiKey, setHasOpenaiKey] = useState<boolean>(true);
  const [startGitLabAPI, setStartGitLabAPI] = useState<boolean>(false);
  const [enabledLLM, setEnabledLLM] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");

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
      if (openAIApiKey === undefined) {
        setProgress(MESSAGES.missing_openaikey);
        setHasOpenaiKey(false);
      } else {
        setStartGitLabAPI(true);
      }
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
          setProgress(MESSAGES.not_task_url);
        } else if (projectPath === undefined) {
          setProgress(`Project '${projectPath}' was not found.`);
        } else if (mergeRequestId !== undefined) {
          const gitlabProjectID = await getProjectIdFromPath(currentTabURL);

          if (gitlabProjectID === undefined) {
            setProgress(`Project '${projectPath}' was not found.`);
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
            setProgress(`Project '${projectPath}' was not found.`);
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
        // setIsCopy(true);
        setProgress("");
      }

      if (hasOpenaiKey && enabledLLM && projectId && mergeRequestId) {
        setProgress("");

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
      {
        <h2 className="title is-2">
          {/* {progress} */}
          title here
        </h2>
      }

      {Object.keys(issueData).length > 0 && (
        <>
          <div className="gitlab-infos">
            {issueData.author && (
              <div className="is-flex mt-2 is-align-items-center">
                <span
                  style={{
                    color: "#333333",
                    fontSize: "20px",
                    opacity: "0.7",
                    width: "120px",
                  }}
                >
                  Author:
                </span>
                <a
                  href={issueData.author?.web_url}
                  target="_blank"
                  style={{
                    textDecoration: "underline",
                    textTransform: "capitalize",
                    fontSize: "16px",
                  }}
                >
                  {issueData.author?.name}
                </a>
              </div>
            )}

            {issueData.assignee && (
              <div className="is-flex mt-2 is-align-items-center">
                <span
                  style={{
                    color: "#333333",
                    fontSize: "20px",
                    opacity: "0.7",
                    width: "120px",
                  }}
                >
                  Assignee:
                </span>
                <a
                  href={issueData.assignee?.web_url}
                  target="_blank"
                  style={{
                    textDecoration: "underline",
                    textTransform: "capitalize",
                    fontSize: "16px",
                  }}
                >
                  {issueData.assignee?.name}
                </a>
              </div>
            )}
            {
              <div className="is-flex mt-2 is-align-items-center">
                <span
                  style={{
                    color: "#333333",
                    fontSize: "20px",
                    opacity: "0.7",
                    width: "120px",
                  }}
                >
                  Comments:
                </span>
                <span style={{ fontSize: "20px" }}>
                  {issueData.user_notes_count}
                </span>
              </div>
            }
            {issueData.created_at && (
              <div className="is-flex mt-2 is-align-items-center">
                <span
                  style={{
                    color: "#333333",
                    fontSize: "20px",
                    opacity: "0.7",
                    width: "120px",
                  }}
                >
                  Age:
                </span>
                <span style={{ fontSize: "20px" }}>
                  {calculateTicketAge(issueData.created_at)} days.{" "}
                  <span style={{ fontSize: "16px", opacity: "0.7" }}>
                    {new Date(issueData.created_at).toLocaleDateString()}
                  </span>
                </span>
              </div>
            )}
            {issueData.updated_at && (
              <div className="is-flex mt-2 is-align-items-center">
                <span
                  style={{
                    color: "#333333",
                    fontSize: "20px",
                    opacity: "0.7",
                    width: "120px",
                  }}
                >
                  Last Updated:
                </span>
                <span style={{ fontSize: "20px" }}>
                  {calculateTicketAge(issueData.updated_at)} days ago.{" "}
                  <span style={{ fontSize: "16px", opacity: "0.7" }}>
                    {new Date(issueData.updated_at).toLocaleDateString()}
                  </span>
                </span>
              </div>
            )}
            <div className="is-flex mt-2 is-align-items-center">
              <span
                style={{
                  color: "#333333",
                  fontSize: "20px",
                  opacity: "0.7",
                  width: "120px",
                }}
              >
                State:
              </span>
              <span style={{ fontSize: "20px" }}>{issueData.state}</span>
            </div>
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

      {hasOpenaiKey &&
        !enabledLLM &&
        projectId &&
        (issueId || mergeRequestId) && (
          <>
            {
              <div className="control has-text-centered">
                <button
                  className="button is-large link-color mt-6"
                  style={{
                    backgroundColor: "transparent",
                    borderRadius: "0",
                    borderWidth: "2px",
                  }}
                  onClick={() => setEnabledLLM(true)}
                >
                  {MESSAGES.start_ai_summarizing}
                </button>
              </div>
            }
          </>
        )}

      {hasOpenaiKey &&
        enabledLLM &&
        projectId &&
        (issueId || mergeRequestId) && (
          <>
            <div ref={iisRef} />
          </>
        )}

      {!hasOpenaiKey && (
        <div className="field" style={{ marginTop: "4rem" }}>
          <div className="control has-text-centered">
            <div>
              <FontAwesomeIcon icon={faTriangleExclamation} fontSize={"5rem"} />
            </div>

            <button
              className="button has-text-white btn-bg-color"
              style={{ marginTop: "4rem" }}
              onClick={() => openChromeSettingPage()}
            >
              {MESSAGES.setup_openaikey}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitLab;
