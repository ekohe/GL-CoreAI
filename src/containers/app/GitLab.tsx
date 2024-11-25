/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";

import { calculateTicketAge, getCurrentTabURL, getOpenAIApiKey, getThemeColor, openChromeSettingPage } from "../../utils";
import {
  extractProjectPathAndIssueId,
  fetchIssueDetails,
  fetchIssueDiscussions,
  getProjectIdFromPath
} from "../../utils/gitlab";
import { fetchLLMResponse } from "../../utils/llm";
import { MESSAGES } from "../../utils/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

const openAIApiKey = await getOpenAIApiKey();
const themeColor = await getThemeColor();
const currentTabURL = await getCurrentTabURL();

const GitLab = (props: {setIsCopy: any, iisRef: any}) => {
  const { setIsCopy, iisRef } = props;

  const [hasOpenaiKey, setHasOpenaiKey] = useState<boolean>(true);
  const [startGitLabAPI, setStartGitLabAPI] = useState<boolean>(false);
  const [enabledLLM, setEnabledLLM] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>('');

  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [issueId, setIssueId] = useState<number | undefined>(undefined);
  const [issueData, setIssueData] = useState<any>({});

  useEffect(() => {
    const loadingExtensionSettings = async () => {
      if (openAIApiKey === undefined) {
        setProgress(MESSAGES.missing_openaikey)
        setHasOpenaiKey(false);
      } else {
        setStartGitLabAPI(true);
      }
    };

    loadingExtensionSettings()
  }, []);

  useEffect(() => {
    const loadingExtensionSettings = async () => {
      if (startGitLabAPI && currentTabURL && currentTabURL.startsWith('http')) {
        const { projectPath, issueId } = extractProjectPathAndIssueId(currentTabURL);
        if (projectPath === undefined && issueId === undefined) {
          setProgress(MESSAGES.not_task_url);
        } else if (projectPath === undefined) {
          setProgress(`Project '${projectPath}' was not found.`);
        } else if (issueId === undefined) {
          setProgress(MESSAGES.not_task_url);
        } else {
          const gitlabProjectID = await getProjectIdFromPath(currentTabURL)

          if (gitlabProjectID === undefined) {
            setProgress(`Project '${projectPath}' was not found.`);
          } else {
            setProjectId(gitlabProjectID);
            setIssueId(issueId);

            const projectIssueData = await fetchIssueDetails(gitlabProjectID, issueId);
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
        const discussions = await fetchIssueDiscussions(projectId, issueId)

        // Call the LLM with the fetched GitLab data
        await fetchLLMResponse(iisRef, issueData, discussions);
        // setIsCopy(true);
        setProgress('');
      }
    }

    loadingOpenAILLM();
  }, [enabledLLM]);

  return (
    <div
      className="container"
      id="gitlabAISummarizerDetails"
    >
      {<h2
        className="m-5 has-text-centered"
        style={{ color: themeColor, fontSize: '1.2rem' }}
      >
        {progress}
      </h2>}

      {Object.keys(issueData).length > 0 && <>
        <div className="gitlab-infos">
          {issueData.author && <p>
            <b>Author:</b>
            <a href={issueData.author?.web_url} target="_blank" className="ml-2" style={{ textDecoration: 'underline', textTransform: 'capitalize' }}>
              {issueData.author?.name}
            </a>
          </p>}
          {issueData.assignee && <p>
            <b>Assignee:</b>
            <a href={issueData.assignee?.web_url} target="_blank" className="ml-2" style={{ textDecoration: 'underline', textTransform: 'capitalize' }}>
              {issueData.assignee?.name}
            </a>
          </p>}
          {<p>
            <b>Comments:</b> {issueData.user_notes_count}
          </p>}
          {issueData.created_at && <p>
            <b>Age:</b> {calculateTicketAge(issueData.created_at)} days. <strong>{new Date(issueData.created_at).toLocaleDateString()}</strong>
          </p>}
          {issueData.updated_at && <p>
            <b>Last Updated:</b> {calculateTicketAge(issueData.updated_at)} days ago. <strong>{new Date(issueData.updated_at).toLocaleDateString()}</strong>
          </p>}
          <p>
            <b>State:</b> {issueData.state}
          </p>
        </div>

        <hr style={{marginBlockStart: '1em', marginBlockEnd: '1em'}}/>

        {!enabledLLM && <div className="control has-text-centered">
          <button
            className="button is-fullwidth link-color mt-6"
            style={{ backgroundColor: 'transparent' }}
            onClick={() => setEnabledLLM(true) }
          >
            {MESSAGES.start_ai_summarizing}
          </button>
        </div>}

        {enabledLLM && <div ref={iisRef} />}
      </>}

      {!hasOpenaiKey && <div className="field" style={{marginTop: '4rem'}}>
        <div className="control has-text-centered">
          <p>
            <FontAwesomeIcon icon={faTriangleExclamation} fontSize={'5rem'}/>
          </p>

          <button
            className="button is-fullwidth has-text-white btn-bg-color"
            style={{marginTop: '4rem'}}
            onClick={() => openChromeSettingPage() }
          >
            {MESSAGES.setup_openaikey}
          </button>
        </div>
      </div>}
    </div>
  );
}

export default GitLab;
