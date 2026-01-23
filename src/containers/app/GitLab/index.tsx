/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

import {
  getAiProvider,
  getClaudeApiKey,
  getClaudeModel,
  getCurrentTabURL,
  getDeepSeekApiKey,
  getDeepSeekModel,
  getOllamaModel,
  getOpenAIApiKey,
  getOpenAIModel,
  getOpenRouterApiKey,
  getOpenRouterModel,
} from "../../../utils";
import {
  extractProjectPathAndIssueIdOrMergeRequestId,
  fetchIssueDetails,
  fetchIssueDiscussions,
  fetchMergeRequestDetails,
  fetchMergeRequestChanges,
  getProjectIdFromPath,
  getCurrentUser,
  GitLabUser,
  MergeRequestData,
} from "../../../utils/gitlab";
import { gitLabIssueSummarize, invokingMRAction, invokingIssueAction, invokingIssueChat } from "../../../utils/llms";
import { GitLabAPI } from "../../../utils/gitlabApi";
import { DEFAULT_AI_MODELS, MR_ACTION_TYPES, MRActionType, ISSUE_ACTION_TYPES, IssueActionType } from "../../../utils/constants";
import { IssueChatRenderer } from "../../../utils/issueChatRenderer";
import { issueChatPrompts } from "../../../utils/prompts";

// Import sub-components
import NotOnGitLabPage from "./NotOnGitLabPage";
import LoadingState from "./LoadingState";
import { IssueTitleCard, IssueInfoCard, MRTitleCard, MRInfoCard } from "./IssueInfoCard";
import { MRActionCard, IssueActionCard, ActionSectionHeader } from "./ActionCards";
import { SetupLLMButton, TryAnotherActionButton } from "./ActionButtons";
import ChatInput from "../../../components/ChatInput";
import { routeQuery, formatResourceCards } from "../../../utils/queryRouter";
import { getCurrentProjectPath } from "../../../utils/multiIssueApi";

// Chat message type for conversation history
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GitLabProps {
  setIsCopy: any;
  iisRef: any;
}

const GitLab = (props: GitLabProps) => {
  const { iisRef } = props;
  const summarizerDetails = useRef(null);

  // LLM state
  const [hasLLMAPIKey, setHasLLMAPIKey] = useState<boolean>(false);
  const [startGitLabAPI, setStartGitLabAPI] = useState<boolean>(false);
  const [enabledLLM, setEnabledLLM] = useState<boolean>(false);
  const [currentTabURL, setCurrentTabURL] = useState<string | undefined>(undefined);

  // Action state
  const [selectedMRAction, setSelectedMRAction] = useState<MRActionType | null>(null);
  const [isProcessingMRAction, setIsProcessingMRAction] = useState<boolean>(false);
  const [selectedIssueAction, setSelectedIssueAction] = useState<IssueActionType | null>(null);
  const [isProcessingIssueAction, setIsProcessingIssueAction] = useState<boolean>(false);

  // Chat state for issue conversations
  const [issueDiscussions, setIssueDiscussions] = useState<any>(null);
  const [initialIssueResponse, setInitialIssueResponse] = useState<string>("");
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Current project path for QueryRouter
  const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(null);

  // Track if there's pending new page data (user navigated but we haven't refreshed)
  const [hasPendingPageData, setHasPendingPageData] = useState<boolean>(false);
  const [pendingTabURL, setPendingTabURL] = useState<string | undefined>(undefined);

  // Current GitLab user
  const [currentGitLabUser, setCurrentGitLabUser] = useState<GitLabUser | null>(null);

  // GitLab data state
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [issueId, setIssueId] = useState<number | undefined>(undefined);
  const [issueData, setIssueData] = useState<any>({});
  const [mergeRequestId, setMergeRequestId] = useState<number | undefined>(undefined);
  const [mergeRequestData, setMergeRequestData] = useState<MergeRequestData | null>(null);
  const [mergeRequestChangesData, setMergeRequestChangesData] = useState<any>({});

  // Auto-scroll effect
  useEffect(() => {
    const currentElement = summarizerDetails.current as HTMLElement | null;
    if (!currentElement) return;

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

    return () => observer.disconnect();
  }, [summarizerDetails]);

  // Fetch current GitLab user and project path
  useEffect(() => {
    const fetchUserAndProject = async () => {
      const [user, projectPath] = await Promise.all([
        getCurrentUser(),
        getCurrentProjectPath(),
      ]);
      if (user) {
        setCurrentGitLabUser(user);
      }
      setCurrentProjectPath(projectPath);
    };
    fetchUserAndProject();
  }, []);

  // Load LLM settings and tab URL
  useEffect(() => {
    let cancelled = false;

    const computeHasKey = (provider: string | undefined, keys: {
      openAIKey?: string;
      deepSeekKey?: string;
      claudeKey?: string;
      openRouterKey?: string;
    }) => {
      if (provider === "ollama") return true;
      if (provider === "openai") return Boolean(keys.openAIKey?.trim());
      if (provider === "deepseek") return Boolean(keys.deepSeekKey?.trim());
      if (provider === "claude") return Boolean(keys.claudeKey?.trim());
      if (provider === "openrouter") return Boolean(keys.openRouterKey?.trim());

      return (
        Boolean(keys.openAIKey?.trim()) ||
        Boolean(keys.deepSeekKey?.trim()) ||
        Boolean(keys.claudeKey?.trim()) ||
        Boolean(keys.openRouterKey?.trim())
      );
    };

    const loadLLMSettings = async () => {
      const [provider, claudeKey, openAIKey, deepSeekKey, openRouterKey] = await Promise.all([
        getAiProvider(),
        getClaudeApiKey(),
        getOpenAIApiKey(),
        getDeepSeekApiKey(),
        getOpenRouterApiKey(),
      ]);

      if (cancelled) return;

      const hasKey = computeHasKey(provider, { openAIKey, deepSeekKey, claudeKey, openRouterKey });
      setHasLLMAPIKey(hasKey);
    };

    const loadTabUrl = async () => {
      const tabURL = await getCurrentTabURL();
      if (cancelled) return;

      // Check if there's existing conversation - if so, don't auto-refresh
      const hasExistingConversation = conversationHistory.length > 0 || 
                                       initialIssueResponse.length > 0 ||
                                       (chatContainerRef?.current && chatContainerRef.current.innerHTML.trim().length > 0);

      if (hasExistingConversation && tabURL !== currentTabURL) {
        // Store pending URL but don't refresh - user needs to manually refresh
        setPendingTabURL(tabURL);
        setHasPendingPageData(true);
        return;
      }

      // No existing conversation - safe to auto-refresh
      setCurrentTabURL(tabURL);
      setProjectId(undefined);
      setIssueId(undefined);
      setIssueData({});
      setMergeRequestId(undefined);
      setMergeRequestData(null);
      setMergeRequestChangesData({});
      setEnabledLLM(false);
      setStartGitLabAPI(true);
      setHasPendingPageData(false);
      setPendingTabURL(undefined);

      // Reset chat state when URL changes
      setSelectedIssueAction(null);
      setSelectedMRAction(null);
      setIssueDiscussions(null);
      setInitialIssueResponse("");
      setConversationHistory([]);
      setIsChatProcessing(false);

      // Clear chat container
      if (chatContainerRef?.current) {
        chatContainerRef.current.innerHTML = '';
      }
      if (iisRef?.current) {
        iisRef.current.innerHTML = '';
      }
    };

    const onStorageChange: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, areaName) => {
      if (areaName !== "sync") return;

      if (changes.GASAiProvider ||
          changes.GASOpenAIKey ||
          changes.GASDeepSeekAIKey ||
          changes.GASClaudeKey ||
          changes.GASOpenRouterKey ||
          changes.GASOpenaiModel ||
          changes.GASDeepSeekModel ||
          changes.GASClaudeModel ||
          changes.GASOllamaModel ||
          changes.GASOllamaURL ||
          changes.GASOpenRouterModel
        ) {
        loadLLMSettings();
        return;
      }

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

  // Load GitLab data
  useEffect(() => {
    const loadingExtensionSettings = async () => {
      if (startGitLabAPI && currentTabURL && currentTabURL.startsWith("http")) {
        const { projectPath, issueId, mergeRequestId } =
          extractProjectPathAndIssueIdOrMergeRequestId(currentTabURL);

        if (projectPath === undefined && issueId === undefined && mergeRequestId === undefined) {
          setStartGitLabAPI(false);
        } else if (projectPath === undefined) {
          setStartGitLabAPI(false);
        } else if (mergeRequestId !== undefined) {
          const gitlabProjectID = await getProjectIdFromPath(currentTabURL);

          if (gitlabProjectID === undefined) {
            setStartGitLabAPI(false);
          } else {
            setProjectId(gitlabProjectID);
            setMergeRequestId(mergeRequestId);

            // Fetch MR details and changes in parallel
            const [mrDetails, changesData] = await Promise.all([
              fetchMergeRequestDetails(gitlabProjectID, mergeRequestId),
              fetchMergeRequestChanges(gitlabProjectID, mergeRequestId),
            ]);
            setMergeRequestData(mrDetails);
            setMergeRequestChangesData(changesData);
          }

          setStartGitLabAPI(false);
        } else if (issueId !== undefined) {
          const gitlabProjectID = await getProjectIdFromPath(currentTabURL);

          if (gitlabProjectID === undefined) {
            setStartGitLabAPI(false);
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
  }, [startGitLabAPI, currentTabURL]);

  // Legacy LLM summarize effect
  useEffect(() => {
    const loadingLLMAPIs = async () => {
      if (hasLLMAPIKey && enabledLLM && projectId && issueId) {
        const discussions = await fetchIssueDiscussions(projectId, issueId);
        await gitLabIssueSummarize(iisRef, issueData, discussions);
      }
    };

    loadingLLMAPIs();
  }, [enabledLLM]);

  // Get AI model based on provider
  const getModelForProvider = async (provider: string): Promise<string> => {
    if (provider === "claude") return (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
    if (provider === "openai") return (await getOpenAIModel()) || DEFAULT_AI_MODELS.openai;
    if (provider === "deepseek") return (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;
    if (provider === "ollama") return (await getOllamaModel()) || DEFAULT_AI_MODELS.ollama;
    if (provider === "openrouter") return (await getOpenRouterModel()) || DEFAULT_AI_MODELS.openrouter;
    return "";
  };

  // Create model info element
  const createModelInfoElement = (actionTitle: string, provider: string, model: string, gradient: string) => {
    const modelInfo = document.createElement("div");
    modelInfo.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: ${gradient};
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
      <span>${actionTitle} with <strong>${provider.charAt(0).toUpperCase() + provider.slice(1)}</strong> (${model})</span>
    `;
    return modelInfo;
  };

  // Handle MR action selection
  const handleMRActionSelect = async (actionType: MRActionType) => {
    if (!hasLLMAPIKey || !projectId || !mergeRequestId || isProcessingMRAction) return;

    setSelectedMRAction(actionType);
    setIsProcessingMRAction(true);

    if (iisRef?.current) {
      iisRef.current.innerHTML = '';
    }

    try {
      const aiProvider = await getAiProvider();
      const model = await getModelForProvider(aiProvider || "");

      const modelInfo = createModelInfoElement(
        MR_ACTION_TYPES[actionType].title,
        aiProvider || 'AI',
        model,
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      );

      if (iisRef?.current) {
        iisRef.current.appendChild(modelInfo);
      }

      await invokingMRAction(iisRef, mergeRequestChangesData, actionType);
    } catch (error) {
      console.error("Error processing MR action:", error);
    } finally {
      setIsProcessingMRAction(false);
    }
  };

  // Handle Issue action selection
  const handleIssueActionSelect = async (actionType: IssueActionType) => {
    if (!hasLLMAPIKey || !projectId || !issueId || isProcessingIssueAction) return;

    setSelectedIssueAction(actionType);
    setIsProcessingIssueAction(true);
    // Reset chat state for new action
    setConversationHistory([]);
    setInitialIssueResponse("");

    if (iisRef?.current) {
      iisRef.current.innerHTML = '';
    }

    try {
      const aiProvider = await getAiProvider();
      const model = await getModelForProvider(aiProvider || "");
      const discussions = await fetchIssueDiscussions(projectId, issueId);

      // Save discussions for chat follow-up
      setIssueDiscussions(discussions);

      const modelInfo = createModelInfoElement(
        ISSUE_ACTION_TYPES[actionType].title,
        aiProvider || 'AI',
        model,
        "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
      );

      if (iisRef?.current) {
        iisRef.current.appendChild(modelInfo);
      }

      // Execute the action and capture the response for chat context
      const response = await invokingIssueAction(iisRef, issueData, discussions, actionType);
      // Set initial response for chat follow-up (response may be void)
      setInitialIssueResponse(typeof response === 'string' ? response : '');
    } catch (error) {
      console.error("Error processing Issue action:", error);
    } finally {
      setIsProcessingIssueAction(false);
    }
  };

  // Handle chat message submission for issues
  const handleIssueChatSubmit = async (message: string) => {
    if (!hasLLMAPIKey || !projectId || !issueId || isChatProcessing) return;

    setIsChatProcessing(true);

    // Fetch discussions if not already fetched (for direct chat without quick action)
    let discussions = issueDiscussions;
    if (!discussions) {
      discussions = await fetchIssueDiscussions(projectId, issueId);
      setIssueDiscussions(discussions);
    }

    // Render user message in the chat container
    if (chatContainerRef?.current) {
      IssueChatRenderer.renderUserMessage(chatContainerRef.current, message);
    }

    // Add user message to conversation history
    const newHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    try {
      // Route the query through QueryRouter to detect and fetch external resources
      const routerResult = await routeQuery(message, currentProjectPath);

      // Show resource cards if external resources were fetched
      if (routerResult.shouldIncludeContext && routerResult.enrichedContext && chatContainerRef?.current) {
        const resourceCards = formatResourceCards(routerResult.enrichedContext);
        if (resourceCards.length > 0) {
          const cardsContainer = document.createElement("div");
          cardsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
          `;
          
          resourceCards.forEach((card) => {
            const cardDiv = document.createElement("div");
            const isError = card.state === 'error';
            const stateColor = card.state === 'opened' ? '#22c55e' : 
                               card.state === 'closed' ? '#ef4444' : 
                               card.state === 'merged' ? '#8b5cf6' : '#64748b';
            const typeIcon = card.type === 'issue' ? '🔵' : 
                             card.type === 'merge_request' ? '🟣' : 
                             card.type === 'wiki' ? '📄' : '❓';
            
            cardDiv.style.cssText = `
              padding: 10px 12px;
              background: ${isError ? '#fef2f2' : '#f8fafc'};
              border: 1px solid ${isError ? '#fecaca' : '#e2e8f0'};
              border-left: 3px solid ${isError ? '#ef4444' : stateColor};
              border-radius: 6px;
              font-size: 0.8rem;
            `;
            
            if (isError) {
              cardDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 6px; color: #dc2626;">
                  <span>❌</span>
                  <span>${card.title}</span>
                  <span style="color: #94a3b8; font-size: 0.75rem;">- ${card.error}</span>
                </div>
              `;
            } else {
              cardDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span>${typeIcon}</span>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 500; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${card.url ? `<a href="${card.url}" target="_blank" style="color: inherit; text-decoration: none; hover: underline;">${card.title}</a>` : card.title}
                    </div>
                  </div>
                  <span style="
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                    font-weight: 500;
                    background: ${stateColor}20;
                    color: ${stateColor};
                    text-transform: capitalize;
                  ">${card.state}</span>
                </div>
              `;
            }
            
            cardsContainer.appendChild(cardDiv);
          });
          
          chatContainerRef.current.appendChild(cardsContainer);
        }
      }

      // Callback to insert content into the issue comment box for user review
      const handleAddToComments = async (content: string): Promise<{ success: boolean; noteUrl?: string; error?: string }> => {
        try {
          // Send message to content script to insert text into comment box
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab?.id) {
            return { success: false, error: "Could not find active tab" };
          }

          // Execute script to find and fill the comment textarea
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (textToInsert: string) => {
              // Try to find the comment textarea in GitLab
              const selectors = [
                'textarea#note-body',
                'textarea#note_note',
                'textarea.note-textarea',
                'textarea[name="note[note]"]',
                '.js-note-text textarea',
                '.js-main-target-form textarea',
                '#note-body',
              ];

              let textarea: HTMLTextAreaElement | null = null;
              for (const selector of selectors) {
                textarea = document.querySelector(selector) as HTMLTextAreaElement;
                if (textarea) break;
              }

              if (!textarea) {
                // Try to click "Add comment" or expand the comment form first
                const addCommentBtn = document.querySelector('.js-note-target-toggle') as HTMLButtonElement;
                if (addCommentBtn) {
                  addCommentBtn.click();
                  // Wait a bit and try again
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      for (const selector of selectors) {
                        textarea = document.querySelector(selector) as HTMLTextAreaElement;
                        if (textarea) break;
                      }
                      if (textarea) {
                        textarea.value = textToInsert;
                        textarea.focus();
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        resolve({ success: true });
                      } else {
                        resolve({ success: false, error: "Could not find comment box" });
                      }
                    }, 300);
                  });
                }
                return { success: false, error: "Could not find comment box" };
              }

              // Insert the text
              textarea.value = textToInsert;
              textarea.focus();
              // Trigger input event so GitLab's JS picks up the change
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
              // Scroll to the textarea
              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });

              return { success: true };
            },
            args: [content],
          });

          const result = results?.[0]?.result as { success: boolean; error?: string } | undefined;
          if (result?.success) {
            return { success: true };
          } else {
            return { success: false, error: result?.error || "Failed to insert into comment box" };
          }
        } catch (error: any) {
          console.error("Error inserting into comment box:", error);
          return { success: false, error: error.message || "Unknown error" };
        }
      };

      // Build chat context with enriched resources if available
      const chatContext = {
        issueData,
        discussions: discussions,
        previousResponse: initialIssueResponse,
        conversationHistory: newHistory,
        currentUser: currentGitLabUser,
        // Add enriched context from QueryRouter if available
        enrichedResourcesContent: routerResult.shouldIncludeContext
          ? routerResult.enrichedContext?.resourcesContent
          : undefined,
        enrichedResourcesSummaries: routerResult.shouldIncludeContext
          ? routerResult.enrichedContext?.resourceSummaries
          : undefined,
      };

      // Call the chat function with current user context and enriched resources
      await invokingIssueChat(
        chatContainerRef,
        message,
        chatContext,
        (response: string) => {
          // Add assistant response to conversation history
          setConversationHistory([
            ...newHistory,
            { role: "assistant" as const, content: response },
          ]);
        },
        handleAddToComments
      );
    } catch (error) {
      console.error("Error processing chat message:", error);
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Manual refresh to load new page data (clears existing conversation)
  const handleManualRefresh = async () => {
    const tabURL = pendingTabURL || await getCurrentTabURL();
    if (!tabURL) return;

    // Clear all state and reload
    setCurrentTabURL(tabURL);
    setProjectId(undefined);
    setIssueId(undefined);
    setIssueData({});
    setMergeRequestId(undefined);
    setMergeRequestData(null);
    setMergeRequestChangesData({});
    setEnabledLLM(false);
    setStartGitLabAPI(true);
    setHasPendingPageData(false);
    setPendingTabURL(undefined);

    // Reset chat state
    setSelectedIssueAction(null);
    setSelectedMRAction(null);
    setIssueDiscussions(null);
    setInitialIssueResponse("");
    setConversationHistory([]);
    setIsChatProcessing(false);

    // Clear chat container
    if (chatContainerRef?.current) {
      chatContainerRef.current.innerHTML = '';
    }
    if (iisRef?.current) {
      iisRef.current.innerHTML = '';
    }
  };

  const handleResetMRAction = () => {
    setSelectedMRAction(null);
    if (iisRef?.current) {
      iisRef.current.innerHTML = '';
    }
  };

  // Computed state
  const isOnSupportedPage = projectId && (issueId || mergeRequestId);
  const isLoading = startGitLabAPI;

  return (
    <div
      className="container"
      id="gitlabAISummarizerDetails"
      ref={summarizerDetails}
      style={{ maxWidth: "100%" }}
    >
      {/* Pending new page notification */}
      {hasPendingPageData && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            border: "1px solid #fcd34d",
            borderRadius: "8px",
            marginBottom: "12px",
            boxShadow: "0 2px 8px rgba(251, 191, 36, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: "500" }}>
              New page detected
            </span>
          </div>
          <button
            onClick={handleManualRefresh}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "#f59e0b",
              border: "none",
              borderRadius: "6px",
              color: "white",
              fontSize: "0.75rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
        </div>
      )}

      {/* Refresh button in header when there's conversation */}
      {(conversationHistory.length > 0 || initialIssueResponse) && !hasPendingPageData && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "8px",
          }}
        >
          <button
            onClick={handleManualRefresh}
            title="Clear conversation and reload current page"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              background: "transparent",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              color: "#64748b",
              fontSize: "0.7rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Reset
          </button>
        </div>
      )}

      {/* Not on GitLab Page */}
      {!isLoading && !isOnSupportedPage && <NotOnGitLabPage />}

      {/* Loading State */}
      {isLoading && <LoadingState />}

      {/* Issue Title Card */}
      {issueData.title && <IssueTitleCard title={issueData.title} />}

      {/* Issue Info Card */}
      {Object.keys(issueData).length > 0 && <IssueInfoCard issueData={issueData} />}

      {/* MR Title Card */}
      {mergeRequestData?.title && (
        <MRTitleCard title={mergeRequestData.title} draft={mergeRequestData.draft} />
      )}

      {/* MR Info Card */}
      {mergeRequestData && <MRInfoCard mrData={mergeRequestData} />}

      {/* Setup LLM Button */}
      {!hasLLMAPIKey && <SetupLLMButton />}

      {/* Issue Actions - Quick actions as shortcuts (hidden immediately when sending) */}
      {hasLLMAPIKey && projectId && issueId &&
        !selectedIssueAction && !initialIssueResponse && conversationHistory.length === 0 &&
        !isChatProcessing && !isProcessingIssueAction && (
        <div style={{ marginTop: "20px" }}>
          <ActionSectionHeader color="#11998e" />
          {(Object.keys(ISSUE_ACTION_TYPES) as IssueActionType[]).map((actionType) => (
            <IssueActionCard
              key={actionType}
              actionType={actionType}
              onSelect={handleIssueActionSelect}
              isProcessing={false}
            />
          ))}
        </div>
      )}

      {/* MR Actions */}
      {hasLLMAPIKey && projectId && mergeRequestId && !selectedMRAction && (
        <div style={{ marginTop: "20px" }}>
          <ActionSectionHeader color="#667eea" />
          {(Object.keys(MR_ACTION_TYPES) as MRActionType[]).map((actionType) => (
            <MRActionCard
              key={actionType}
              actionType={actionType}
              onSelect={handleMRActionSelect}
              isProcessing={isProcessingMRAction}
            />
          ))}
        </div>
      )}

      {/* Results container for quick actions */}
      {hasLLMAPIKey && projectId && (
        (issueId && selectedIssueAction) || (mergeRequestId && selectedMRAction)
      ) && (
        <div ref={iisRef} />
      )}

      {/* Chat container for issue conversations - always visible on issue pages */}
      {hasLLMAPIKey && projectId && issueId && (
        <>
          {/* Chat messages container */}
          <div ref={chatContainerRef} style={{ marginTop: "16px" }} />

          {/* Chat input - always available for custom queries */}
          <ChatInput
            onSubmit={handleIssueChatSubmit}
            isLoading={isChatProcessing || isProcessingIssueAction}
            suggestedPrompts={issueChatPrompts.getSuggestedPrompts({
              issueData: issueData as IssueType,
              discussions: issueDiscussions || undefined,
              currentUser: currentGitLabUser,
              actionType: selectedIssueAction || undefined,
              hasInitialResponse: !!initialIssueResponse,
            })}
            placeholder="Ask about this issue, or reference others (#123, URLs)..."
          />
        </>
      )}

      {/* Try another action - MR */}
      {selectedMRAction && !isProcessingMRAction && (
        <TryAnotherActionButton onClick={handleResetMRAction} color="#667eea" />
      )}
    </div>
  );
};

export default GitLab;

