/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { getGitLabWebURL } from "../../../utils";
import {
  getAiProvider,
  getClaudeModel,
  getOpenAIModel,
  getDeepSeekModel,
  getOllamaModel,
} from "../../../utils";
import { DEFAULT_AI_MODELS } from "../../../utils/constants";
import { GitLabTodo, TodoSummary, PriorityItem, TopicGroup, TopicItem } from "../../../utils/prompts/aiInbox";
import { invokingAIInboxProcess, invokingAIInboxChat } from "../../../utils/llms";
import ChatInput from "../../../components/ChatInput";
import { IssueChatRenderer } from "../../../utils/issueChatRenderer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSpinner, faCloud, faBrain, faPaintBrush, faCrown, faExternalLinkAlt, faCheckCircle, faArrowsSpin } from "@fortawesome/free-solid-svg-icons";

// Theme colors
const THEME = {
  primary: "#667eea",
  primaryDark: "#764ba2",
  primaryGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  success: "#11998e",
  successLight: "#38ef7d",
  successGradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  clientPrimary: "#667eea",
  clientSecondary: "#764ba2",
  clientGradient: "linear-gradient(135deg, #667eea15 0%, #764ba215 100%)",
  clientBorder: "#667eea",
  clientBadgeGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

// Date formatting helper
const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Progress step types
type ProgressStep = "idle" | "fetching" | "processing" | "rendering" | "complete";

interface ProgressInfo {
  step: ProgressStep;
  message: string;
  todoCount?: number;
  provider?: string;
  model?: string;
}

// Progress indicator component
const ProgressIndicator = ({ progress }: { progress: ProgressInfo }) => {
  const steps = [
    { key: "fetching", label: "Fetching Todos", icon: faCloud, description: "Connecting to GitLab API..." },
    { key: "processing", label: "AI Analysis", icon: faBrain, description: "Analyzing and categorizing..." },
    { key: "rendering", label: "Preparing View", icon: faPaintBrush, description: "Organizing your inbox..." },
  ];

  const getStepStatus = (stepKey: string): "pending" | "active" | "complete" => {
    const stepOrder = ["fetching", "processing", "rendering", "complete"];
    const currentIndex = stepOrder.indexOf(progress.step);
    const stepIndex = stepOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return "complete";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const getStepMessage = () => {
    switch (progress.step) {
      case "fetching":
        return "Connecting to GitLab to fetch your todos...";
      case "processing":
        return progress.todoCount
          ? `Analyzing ${progress.todoCount} todos with ${progress.provider || "AI"}${progress.model ? ` (${progress.model})` : ""}...`
          : "Processing your todos with AI...";
      case "rendering":
        return "Preparing your personalized inbox view...";
      case "complete":
        return "All done!";
      default:
        return "Preparing...";
    }
  };

  return (
    <div
      style={{
        padding: "40px 24px",
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        borderRadius: "16px",
        margin: "20px 0",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
          }}
        >
          <FontAwesomeIcon
            icon={faBrain}
            style={{
              fontSize: "28px",
              color: "white",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        </div>
        <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 600, color: "#1e293b" }}>
          Building Your AI Inbox
        </h3>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
          {getStepMessage()}
        </p>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.key);
          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "16px",
                marginBottom: index < steps.length - 1 ? "24px" : 0,
                opacity: status === "pending" ? 0.5 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {/* Step Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background:
                    status === "complete"
                      ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                      : status === "active"
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "#e2e8f0",
                  boxShadow:
                    status === "active"
                      ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                      : status === "complete"
                      ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                      : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {status === "complete" ? (
                  <FontAwesomeIcon icon={faCheck} style={{ color: "white", fontSize: "16px" }} />
                ) : status === "active" ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    style={{ color: "white", fontSize: "16px", animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <FontAwesomeIcon icon={step.icon} style={{ color: "#94a3b8", fontSize: "16px" }} />
                )}
              </div>

              {/* Step Content */}
              <div style={{ flex: 1, paddingTop: "4px" }}>
                <h4
                  style={{
                    margin: "0 0 4px",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: status === "pending" ? "#94a3b8" : "#1e293b",
                  }}
                >
                  {step.label}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8rem",
                    color: "#64748b",
                  }}
                >
                  {status === "active" && step.key === "fetching" && progress.todoCount
                    ? `Found ${progress.todoCount} todos`
                    : status === "active" && step.key === "processing" && progress.provider
                    ? `Using ${progress.provider}${progress.model ? ` (${progress.model})` : ""}`
                    : step.description}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: "43px",
                    top: "48px",
                    width: "2px",
                    height: "24px",
                    background:
                      getStepStatus(steps[index + 1].key) !== "pending"
                        ? "linear-gradient(180deg, #10b981 0%, #667eea 100%)"
                        : "#e2e8f0",
                    transition: "background 0.3s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div
        style={{
          marginTop: "32px",
          background: "#e2e8f0",
          borderRadius: "8px",
          height: "6px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #667eea 0%, #764ba2 50%, #10b981 100%)",
            borderRadius: "8px",
            transition: "width 0.5s ease-out",
            width:
              progress.step === "fetching"
                ? "25%"
                : progress.step === "processing"
                ? "60%"
                : progress.step === "rendering"
                ? "90%"
                : progress.step === "complete"
                ? "100%"
                : "5%",
          }}
        />
      </div>
    </div>
  );
};

// Priority item card component
interface PriorityCardProps {
  item: PriorityItem;
  onMarkDone: (id: string, gitlabTodoId?: number) => Promise<void>;
  isMarkingDone: boolean;
}

const PriorityCard = ({ item, onMarkDone, isMarkingDone }: PriorityCardProps) => {
  const urgencyColors = {
    high: { bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444" },
    medium: { bg: "#fffbeb", border: "#fcd34d", dot: THEME.primary },
    low: { bg: "#f0fdf4", border: "#86efac", dot: THEME.success },
  };

  const colors = urgencyColors[item.urgency];
  const isClient = item.isClientFeedback;

  const handleMarkDone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onMarkDone(item.id, item.gitlabTodoId);
  };

  return (
    <div
      className="priority-card"
      style={{
        background: isClient ? THEME.clientGradient : "white",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: isClient
          ? `0 4px 16px rgba(102, 126, 234, 0.15)`
          : "0 2px 8px rgba(0, 0, 0, 0.06)",
        border: isClient
          ? `2px solid ${THEME.clientBorder}`
          : "1px solid #e2e8f0",
        transition: "all 0.2s ease",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => window.open(item.targetUrl, "_blank")}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateX(4px)";
        e.currentTarget.style.boxShadow = isClient
          ? "0 8px 24px rgba(102, 126, 234, 0.25)"
          : "0 4px 12px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.boxShadow = isClient
          ? "0 4px 16px rgba(102, 126, 234, 0.15)"
          : "0 2px 8px rgba(0, 0, 0, 0.06)";
      }}
    >
      {/* Client feedback badge */}
      {isClient && (
        <div
          style={{
            position: "absolute",
            top: "-8px",
            right: "12px",
            background: THEME.clientBadgeGradient,
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
          }}
        >
          <FontAwesomeIcon icon={faCrown} style={{ fontSize: "0.55rem" }} />
          CLIENT
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <img
          src={item.authorAvatar}
          alt={item.author}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            flexShrink: 0,
            border: isClient ? `2px solid ${THEME.clientBorder}` : "none",
          }}
          onError={(e) => {
            e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h4
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: 1.3,
                flex: 1,
              }}
            >
              {item.title}
            </h4>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: colors.dot,
                flexShrink: 0,
              }}
            />
          </div>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "0.85rem",
              color: "#64748b",
              lineHeight: 1.5,
            }}
          >
            {item.summary}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.75rem", color: "#94a3b8" }}>
              {/* Date */}
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
                title={item.createdAt ? formatFullDate(item.createdAt) : ""}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {item.createdAt ? formatRelativeDate(item.createdAt) : "—"}
              </span>
              {/* Email count */}
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {item.emailCount}
              </span>
              {/* Project */}
              <span>{item.project}</span>
            </div>
            {/* Mark as done button */}
            <button
              onClick={handleMarkDone}
              disabled={isMarkingDone}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: THEME.successGradient,
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.7rem",
                fontWeight: 500,
                cursor: isMarkingDone ? "wait" : "pointer",
                opacity: isMarkingDone ? 0.7 : 1,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(17, 153, 142, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!isMarkingDone) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(17, 153, 142, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 6px rgba(17, 153, 142, 0.3)";
              }}
            >
              {isMarkingDone ? (
                <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "0.65rem" }} />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: "0.65rem" }} />
              )}
              {isMarkingDone ? "Marking..." : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Topic item component (clickable)
const TopicItemRow = ({ item }: { item: TopicItem }) => {
  const isClient = item.isClientFeedback;

  return (
    <li
      style={{
        marginBottom: "10px",
        lineHeight: 1.6,
        padding: "8px 12px",
        marginLeft: "-12px",
        borderRadius: "8px",
        cursor: item.targetUrl ? "pointer" : "default",
        background: isClient ? THEME.clientGradient : "transparent",
        border: isClient ? `1px solid ${THEME.clientBorder}40` : "1px solid transparent",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "8px",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (item.targetUrl) {
          window.open(item.targetUrl, "_blank");
        }
      }}
      onMouseEnter={(e) => {
        if (item.targetUrl) {
          e.currentTarget.style.background = isClient
            ? "linear-gradient(135deg, #667eea20 0%, #764ba220 100%)"
            : "#f1f5f9";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isClient ? THEME.clientGradient : "transparent";
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {isClient && (
            <FontAwesomeIcon
              icon={faCrown}
              style={{ color: THEME.primary, fontSize: "0.7rem", flexShrink: 0 }}
            />
          )}
          <span>{item.summary}</span>
        </span>
        {item.createdAt && (
          <span
            style={{
              fontSize: "0.7rem",
              color: "#94a3b8",
              marginTop: "4px",
              display: "block",
            }}
            title={formatFullDate(item.createdAt)}
          >
            {formatRelativeDate(item.createdAt)}
          </span>
        )}
      </div>
      {item.targetUrl && (
        <FontAwesomeIcon
          icon={faExternalLinkAlt}
          style={{
            color: "#94a3b8",
            fontSize: "0.7rem",
            flexShrink: 0,
            marginTop: "4px",
          }}
        />
      )}
    </li>
  );
};

// Topic group card component
const TopicCard = ({ group }: { group: TopicGroup }) => {
  const isClient = group.isClientFeedback;

  return (
    <div
      className="topic-card"
      style={{
        background: isClient
          ? "linear-gradient(135deg, #667eea08 0%, #ffffff 100%)"
          : "white",
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: isClient
          ? "0 4px 16px rgba(102, 126, 234, 0.12)"
          : "0 4px 16px rgba(0, 0, 0, 0.06)",
        border: isClient
          ? `2px solid ${THEME.clientBorder}60`
          : "1px solid #e8ecf2",
        transition: "all 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isClient
          ? "0 8px 24px rgba(102, 126, 234, 0.2)"
          : "0 8px 24px rgba(0, 0, 0, 0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isClient
          ? "0 4px 16px rgba(102, 126, 234, 0.12)"
          : "0 4px 16px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Client feedback badge */}
      {isClient && (
        <div
          style={{
            position: "absolute",
            top: "-8px",
            right: "16px",
            background: THEME.clientBadgeGradient,
            color: "white",
            fontSize: "0.65rem",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 8px rgba(102, 126, 234, 0.4)",
          }}
        >
          <FontAwesomeIcon icon={faCrown} style={{ fontSize: "0.55rem" }} />
          CLIENT
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h4
          style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          {group.topic}
        </h4>
      </div>
      <ul style={{ margin: "0 0 12px 0", paddingLeft: "8px", color: "#475569", fontSize: "0.875rem", listStyle: "none" }}>
        {group.items.slice(0, 4).map((item, i) => (
          <TopicItemRow key={i} item={item} />
        ))}
        {group.items.length > 4 && (
          <li
            style={{
              fontSize: "0.8rem",
              color: "#667eea",
              fontWeight: 500,
              marginTop: "8px",
              cursor: "pointer",
            }}
          >
            +{group.items.length - 4} more updates
          </li>
        )}
      </ul>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex" }}>
            {group.avatars.slice(0, 3).map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt=""
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  marginLeft: i > 0 ? "-10px" : 0,
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onError={(e) => {
                  e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
            {group.emailCount} {group.emailCount === 1 ? "update" : "updates"}
          </span>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => (
  <div
    style={{
      textAlign: "center",
      padding: "60px 20px",
      color: "#64748b",
    }}
  >
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="1.5"
      style={{ margin: "0 auto 16px" }}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
    <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", color: "#475569" }}>
      All caught up! 🎉
    </h3>
    <p style={{ margin: 0, fontSize: "0.9rem" }}>
      You have no pending todos. Great job staying on top of things!
    </p>
  </div>
);

// Error state component
const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div
    style={{
      textAlign: "center",
      padding: "40px 20px",
      background: "#fef2f2",
      borderRadius: "12px",
      margin: "20px 0",
    }}
  >
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ef4444"
      strokeWidth="2"
      style={{ margin: "0 auto 16px" }}
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
    <h3 style={{ margin: "0 0 8px", fontSize: "1rem", color: "#dc2626" }}>
      Something went wrong
    </h3>
    <p style={{ margin: "0 0 16px", fontSize: "0.875rem", color: "#991b1b" }}>
      {message}
    </p>
    <button
      onClick={onRetry}
      style={{
        background: "#dc2626",
        color: "white",
        border: "none",
        padding: "8px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 500,
      }}
    >
      Try Again
    </button>
  </div>
);

interface AIInboxProps {
  onBack: () => void;
}

const AIInbox = ({ onBack }: AIInboxProps) => {
  const [todos, setTodos] = useState<GitLabTodo[]>([]);
  const [summary, setSummary] = useState<TodoSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Progress tracking
  const [progress, setProgress] = useState<ProgressInfo>({
    step: "idle",
    message: "Preparing...",
  });

  // Chat state
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Mark as done state
  const [markingDoneIds, setMarkingDoneIds] = useState<Set<string>>(new Set());

  // Get AI model for provider
  const getModelForProvider = async (provider: string): Promise<string> => {
    if (provider === "claude") return (await getClaudeModel()) || DEFAULT_AI_MODELS.claude;
    if (provider === "openai") return (await getOpenAIModel()) || DEFAULT_AI_MODELS.openai;
    if (provider === "deepseek") return (await getDeepSeekModel()) || DEFAULT_AI_MODELS.deepseek;
    if (provider === "ollama") return (await getOllamaModel()) || DEFAULT_AI_MODELS.ollama;
    return "";
  };

  // Helper function to fetch CSRF token from GitLab
  const fetchCsrfToken = async (gitlabUrl: string): Promise<string> => {
    try {
      // Fetch a GitLab page to extract CSRF token from meta tag
      const response = await fetch(`${gitlabUrl}/`, {
        credentials: "include",
        headers: {
          "Accept": "text/html",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch GitLab page for CSRF token");
      }

      const html = await response.text();

      // Extract CSRF token from meta tag
      const csrfMatch = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
      if (csrfMatch && csrfMatch[1]) {
        return csrfMatch[1];
      }

      throw new Error("CSRF token not found in page");
    } catch (err) {
      console.error("Failed to fetch CSRF token:", err);
      throw err;
    }
  };

  // Mark a todo as done via GitLab GraphQL API
  const markTodoAsDone = async (itemId: string, gitlabTodoId?: number): Promise<void> => {
    // If gitlabTodoId is provided directly, use it; otherwise find it from headsUp items
    let actualGitlabId = gitlabTodoId;

    if (!actualGitlabId && summary) {
      const item = summary.headsUp.find((i) => i.id === itemId);
      if (item) {
        actualGitlabId = item.gitlabTodoId;
      }
    }

    if (!actualGitlabId) {
      console.error("GitLab todo ID not found for item:", itemId);
      return;
    }

    setMarkingDoneIds((prev) => new Set(prev).add(itemId));

    try {
      const gitlabUrl = await getGitLabWebURL();
      if (!gitlabUrl) throw new Error("GitLab URL not configured");

      // First, fetch the CSRF token
      const csrfToken = await fetchCsrfToken(gitlabUrl);

      // Use GraphQL mutation to mark todo as done
      const graphqlQuery = `mutation markAsDone($todoId: TodoID!) {
  toggleStatus: todoMarkDone(input: {id: $todoId}) {
    todo {
      id
      state
      __typename
    }
    errors
    __typename
  }
}`;

      const response = await fetch(`${gitlabUrl}/api/graphql`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          operationName: "markAsDone",
          query: graphqlQuery,
          variables: {
            todoId: `gid://gitlab/Todo/${actualGitlabId}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to mark todo as done: ${response.statusText}`);
      }

      const result = await response.json();

      // Check for GraphQL errors
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message || "GraphQL error");
      }

      // Check for mutation errors
      if (result.data?.toggleStatus?.errors?.length > 0) {
        throw new Error(result.data.toggleStatus.errors[0] || "Failed to mark as done");
      }

      // Verify the state changed to "done"
      if (result.data?.toggleStatus?.todo?.state !== "done") {
        console.warn("Todo state may not have changed:", result.data?.toggleStatus?.todo);
      }

      // Remove the item from our local state
      setTodos((prev) => prev.filter((t) => t.id !== actualGitlabId));

      // Update summary to remove the item - filter by both id and gitlabTodoId
      setSummary((prev) => {
        if (!prev) return null;
        return {
          headsUp: prev.headsUp.filter((item) =>
            item.id !== itemId && item.gitlabTodoId !== actualGitlabId
          ),
          catchUp: prev.catchUp.map((group) => ({
            ...group,
            items: group.items.filter((_, idx) =>
              !itemId.includes(`topic-${prev.catchUp.indexOf(group)}-${idx}`)
            ),
          })).filter((group) => group.items.length > 0),
        };
      });

      console.log(`Todo ${actualGitlabId} marked as done via GraphQL, removing item ${itemId}`);
    } catch (err) {
      console.error("Failed to mark todo as done:", err);
    } finally {
      setMarkingDoneIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Fetch todos from GitLab
  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    setProgress({ step: "fetching", message: "Connecting to GitLab..." });

    try {
      const gitlabUrl = await getGitLabWebURL();
      if (!gitlabUrl) {
        throw new Error("GitLab URL not configured. Please set it in settings.");
      }

      // Fetch todos from GitLab API
      const response = await fetch(`${gitlabUrl}/api/v4/todos?state=pending&per_page=20`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Not authenticated. Please log in to GitLab first.");
        }
        throw new Error(`Failed to fetch todos: ${response.statusText}`);
      }

      const todosData: GitLabTodo[] = await response.json();
      setTodos(todosData);
      setProgress({
        step: "fetching",
        message: `Found ${todosData.length} todos`,
        todoCount: todosData.length,
      });

      // Also try to get user info for personalization
      try {
        const userResponse = await fetch(`${gitlabUrl}/api/v4/user`, {
          credentials: "include",
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserName(userData.name || userData.username || "");
        }
      } catch {
        // Ignore user fetch errors
      }

      if (todosData.length > 0) {
        await processTodosWithAI(todosData);
      } else {
        setProgress({ step: "complete", message: "No todos found" });
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch todos");
      setProgress({ step: "idle", message: "Failed" });
      setIsLoading(false);
    }
  };

  // Process todos with AI
  const processTodosWithAI = async (todosData: GitLabTodo[]) => {
    try {
      const provider = await getAiProvider();
      const model = await getModelForProvider(provider || "openai");

      // Update progress to show AI processing
      setProgress({
        step: "processing",
        message: `Analyzing with ${provider || "AI"}...`,
        todoCount: todosData.length,
        provider: provider || "AI",
        model: model,
      });

      const result = await invokingAIInboxProcess(todosData, provider || "openai", model);

      // Update progress to rendering
      setProgress({
        step: "rendering",
        message: "Preparing your inbox view...",
        todoCount: todosData.length,
        provider: provider || "AI",
        model: model,
      });

      // Small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSummary(result);

      // Mark as complete
      setProgress({
        step: "complete",
        message: "All done!",
        todoCount: todosData.length,
        provider: provider || "AI",
        model: model,
      });
    } catch (err: any) {
      console.error("Error processing todos with AI:", err);
      // Create a fallback summary without AI
      setProgress({
        step: "rendering",
        message: "Using fallback categorization...",
        todoCount: todosData.length,
      });
      setSummary(createFallbackSummary(todosData));
      setProgress({ step: "complete", message: "Done (without AI)" });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to detect client feedback from labels
  const hasClientLabels = (todo: GitLabTodo): boolean => {
    const clientKeywords = ["client", "customer", "external", "feedback", "bug-report", "support"];
    const labels = todo.target.labels || [];
    return labels.some(label =>
      clientKeywords.some(kw => label.toLowerCase().includes(kw))
    );
  };

  // Create fallback summary without AI
  const createFallbackSummary = (todosData: GitLabTodo[]): TodoSummary => {
    const headsUp: PriorityItem[] = [];
    const catchUpMap = new Map<string, TopicGroup>();

    todosData.forEach((todo) => {
      const isClient = hasClientLabels(todo);
      const isHighPriority =
        todo.action_name === "assigned" ||
        todo.action_name === "mentioned" ||
        todo.action_name === "directly_addressed" ||
        isClient;

      if (isHighPriority && headsUp.length < 5) {
        headsUp.push({
          id: todo.id.toString(),
          gitlabTodoId: todo.id,
          title: todo.target.title,
          summary: `${todo.author.name} ${todo.action_name} you`,
          urgency: isClient ? "high" : (todo.action_name === "assigned" ? "high" : "medium"),
          project: todo.project.name,
          projectUrl: todo.project.web_url,
          targetUrl: todo.target.web_url,
          targetType: todo.target_type,
          author: todo.author.name,
          authorAvatar: todo.author.avatar_url,
          emailCount: 1,
          createdAt: todo.created_at,
          actionName: todo.action_name,
          isClientFeedback: isClient,
        });
      } else {
        const projectName = todo.project.name;
        if (!catchUpMap.has(projectName)) {
          catchUpMap.set(projectName, {
            topic: projectName,
            items: [],
            emailCount: 0,
            avatars: [],
            isClientFeedback: false,
          });
        }
        const group = catchUpMap.get(projectName)!;
        const itemIsClient = hasClientLabels(todo);
        group.items.push({
          summary: `${todo.author.name} ${todo.action_name}: ${todo.target.title}`,
          targetUrl: todo.target.web_url,
          createdAt: todo.created_at,
          isClientFeedback: itemIsClient,
        });
        group.emailCount++;
        if (itemIsClient) {
          group.isClientFeedback = true;
        }
        if (!group.avatars.includes(todo.author.avatar_url)) {
          group.avatars.push(todo.author.avatar_url);
        }
      }
    });

    return {
      headsUp,
      catchUp: Array.from(catchUpMap.values()),
    };
  };

  // Handle chat submission
  const handleChatSubmit = async (message: string) => {
    if (isChatProcessing) return;

    setIsChatProcessing(true);

    // Render user message
    if (chatContainerRef?.current) {
      IssueChatRenderer.renderUserMessage(chatContainerRef.current, message);
    }

    const newHistory = [...conversationHistory, { role: "user" as const, content: message }];

    try {
      const provider = await getAiProvider();

      await invokingAIInboxChat(
        chatContainerRef,
        message,
        {
          todos,
          summary,
          conversationHistory: newHistory,
        },
        provider || "openai",
        (response: string) => {
          setConversationHistory([
            ...newHistory,
            { role: "assistant" as const, content: response },
          ]);
        }
      );
    } catch (err: any) {
      console.error("Chat error:", err);
      if (chatContainerRef?.current) {
        IssueChatRenderer.showErrorState(chatContainerRef.current, err.message || "Failed to process message");
      }
    } finally {
      setIsChatProcessing(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="ai-inbox-container" style={{ padding: "0", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)",
          padding: "24px 20px 20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#64748b",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Back to Summarizer</span>
        </div>

        <h1
          style={{
            margin: "0 0 4px",
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""} 👋{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontStyle: "italic",
            }}
          >
            Let's tackle your next big thing
          </span>
        </h1>
      </div>

      {/* Content */}
      <div style={{ padding: "20px", overflowY: "auto" }}>
        {isLoading ? (
          <ProgressIndicator progress={progress} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchTodos} />
        ) : todos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Heads Up Section */}
            {summary && summary.headsUp.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "1.25rem", color: THEME.primary }}>🎯</span>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
                    Heads up:
                  </h2>
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    I've found <strong>{summary.headsUp.length} priorities</strong> that need your attention
                  </span>
                </div>
                {summary.headsUp.map((item) => (
                  <PriorityCard
                    key={item.id}
                    item={item}
                    onMarkDone={markTodoAsDone}
                    isMarkingDone={markingDoneIds.has(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Catch Up Section */}
            {summary && summary.catchUp.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "1.25rem", color: THEME.primary }}>⚡</span>
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>
                    Catch up:
                  </h2>
                  <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                    I've summarized your other updates into <strong>{summary.catchUp.length} topics</strong>
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {summary.catchUp.map((group, i) => (
                    <TopicCard key={i} group={group} />
                  ))}
                </div>
              </div>
            )}

            {/* Chat Section */}
            <div style={{ marginTop: "24px" }}>
              <div ref={chatContainerRef} style={{ marginBottom: "16px" }} />
              <ChatInput
                onSubmit={handleChatSubmit}
                isLoading={isChatProcessing}
                suggestedPrompts={[
                  "What should I focus on first?",
                  "Summarize my urgent items",
                  "Which items are overdue?",
                  "Help me prioritize",
                ]}
                placeholder="Ask about your todos..."
              />
            </div>
          </>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }

          .ai-inbox-loading {
            padding: 20px;
          }

          .skeleton-header {
            margin-bottom: 24px;
          }

          .skeleton-title {
            height: 28px;
            width: 60%;
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
            margin-bottom: 8px;
          }

          .skeleton-subtitle {
            height: 16px;
            width: 40%;
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
          }

          .skeleton-card {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 16px;
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            margin-bottom: 12px;
          }

          .skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            flex-shrink: 0;
          }

          .skeleton-content {
            flex: 1;
          }

          .skeleton-line {
            height: 12px;
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 6px;
            margin-bottom: 8px;
          }

          .skeleton-line.long { width: 100%; }
          .skeleton-line.medium { width: 70%; }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default AIInbox;
