/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-target-blank */
import { calculateTicketAge } from "../../../utils";
import { enhanceStringPrototype } from "../../../utils/enhanceStringPrototype";

enhanceStringPrototype();

interface IssueData {
  title?: string;
  author?: { web_url: string; avatar_url: string; name: string };
  assignee?: { web_url: string; avatar_url: string; name: string };
  user_notes_count?: number;
  created_at?: string;
  updated_at?: string;
  state?: string;
  labels?: string[];
}

interface IssueTitleCardProps {
  title: string;
}

/**
 * Issue title card with gradient background
 */
export const IssueTitleCard = ({ title }: IssueTitleCardProps) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: "white",
          margin: 0,
          lineHeight: "1.5",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        title={title}
      >
        {title}
      </h3>
    </div>
  );
};

interface IssueInfoCardProps {
  issueData: IssueData;
}

/**
 * Compact issue info summary - single line with key details
 */
export const IssueInfoCard = ({ issueData }: IssueInfoCardProps) => {
  if (Object.keys(issueData).length === 0) return null;

  const stateLabel = issueData.state === "opened" ? "Open" : (issueData.state || "").titlize();
  const authorName = issueData.author?.name;
  const assigneeName = issueData.assignee?.name;
  const commentsCount = issueData.user_notes_count ?? 0;
  const age = issueData.created_at ? calculateTicketAge(issueData.created_at) : null;
  const labels = issueData.labels ?? [];

  return (
    <div
      style={{
        background: "white",
        borderRadius: "10px",
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
        border: "1px solid #e2e8f0",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
        fontSize: "0.82rem",
        color: "#475569",
      }}
    >
      {/* State indicator */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          background: issueData.state === "opened" ? "#dcfce7" : "#fee2e2",
          color: issueData.state === "opened" ? "#166534" : "#991b1b",
          borderRadius: "12px",
          padding: "3px 10px",
          fontSize: "0.75rem",
          fontWeight: "600",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: issueData.state === "opened" ? "#22c55e" : "#ef4444",
          }}
        />
        {stateLabel}
      </span>

      {/* Summary text */}
      <span style={{ color: "#64748b" }}>
        {authorName && (
          <>
            by <strong style={{ color: "#334155", fontWeight: "500" }}>{authorName}</strong>
          </>
        )}
        {assigneeName && assigneeName !== authorName && (
          <>
            {" → "}
            <strong style={{ color: "#334155", fontWeight: "500" }}>{assigneeName}</strong>
          </>
        )}
      </span>

      {/* Separator */}
      <span style={{ color: "#cbd5e1" }}>•</span>

      {/* Comments count */}
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{ fontWeight: "500", color: "#667eea" }}>{commentsCount}</span>
      </span>

      {/* Age */}
      {age !== null && (
        <>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style={{ fontWeight: "500", color: "#667eea" }}>{age}d</span>
          </span>
        </>
      )}

      {/* Labels */}
      {labels.length > 0 && (
        <>
          <span style={{ color: "#cbd5e1" }}>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
            {labels.slice(0, 3).map((label, idx) => (
              <span
                key={idx}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                  border: "1px solid #e2e8f0",
                }}
              >
                {label}
              </span>
            ))}
            {labels.length > 3 && (
              <span
                style={{
                  color: "#94a3b8",
                  fontSize: "0.7rem",
                  fontWeight: "500",
                }}
                title={labels.slice(3).join(', ')}
              >
                +{labels.length - 3}
              </span>
            )}
          </span>
        </>
      )}
    </div>
  );
};

// MR Data interface
interface MRData {
  title?: string;
  author?: { web_url?: string; avatar_url?: string; name: string };
  assignee?: { web_url?: string; avatar_url?: string; name: string };
  assignees?: Array<{ web_url?: string; avatar_url?: string; name: string }>;
  reviewers?: Array<{ web_url?: string; avatar_url?: string; name: string }>;
  user_notes_count?: number;
  changes_count?: string;
  created_at?: string;
  updated_at?: string;
  merged_at?: string;
  state?: string;
  labels?: string[];
  source_branch?: string;
  target_branch?: string;
  draft?: boolean;
  has_conflicts?: boolean;
  detailed_merge_status?: string;
}

interface MRTitleCardProps {
  title: string;
  draft?: boolean;
}

/**
 * MR title card with gradient background
 */
export const MRTitleCard = ({ title, draft }: MRTitleCardProps) => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
      }}
    >
      {draft && (
        <span
          style={{
            display: "inline-block",
            background: "rgba(255, 255, 255, 0.2)",
            color: "white",
            borderRadius: "8px",
            padding: "2px 8px",
            fontSize: "0.7rem",
            fontWeight: "600",
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Draft
        </span>
      )}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: "white",
          margin: 0,
          lineHeight: "1.5",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        title={title}
      >
        {title}
      </h3>
    </div>
  );
};

interface MRInfoCardProps {
  mrData: MRData;
}

/**
 * Compact MR info summary - single line with key details
 */
export const MRInfoCard = ({ mrData }: MRInfoCardProps) => {
  if (Object.keys(mrData).length === 0) return null;

  const getStateInfo = () => {
    switch (mrData.state) {
      case "merged":
        return { label: "Merged", bg: "#dbeafe", color: "#1e40af", dotColor: "#3b82f6" };
      case "closed":
        return { label: "Closed", bg: "#fee2e2", color: "#991b1b", dotColor: "#ef4444" };
      case "opened":
        if (mrData.draft) {
          return { label: "Draft", bg: "#f3f4f6", color: "#4b5563", dotColor: "#9ca3af" };
        }
        if (mrData.has_conflicts) {
          return { label: "Conflicts", bg: "#fef3c7", color: "#92400e", dotColor: "#f59e0b" };
        }
        return { label: "Open", bg: "#dcfce7", color: "#166534", dotColor: "#22c55e" };
      default:
        return { label: (mrData.state || "").titlize(), bg: "#f3f4f6", color: "#4b5563", dotColor: "#9ca3af" };
    }
  };

  const stateInfo = getStateInfo();
  const authorName = mrData.author?.name;
  const commentsCount = mrData.user_notes_count ?? 0;
  const changesCount = mrData.changes_count;
  const age = mrData.created_at ? calculateTicketAge(mrData.created_at) : null;
  const labels = mrData.labels ?? [];
  const reviewers = mrData.reviewers ?? [];

  return (
    <div
      style={{
        background: "white",
        borderRadius: "10px",
        padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
        border: "1px solid #e2e8f0",
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        fontSize: "0.82rem",
        color: "#475569",
      }}
    >
      {/* First row: State, author, comments, age */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        {/* State indicator */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: stateInfo.bg,
            color: stateInfo.color,
            borderRadius: "12px",
            padding: "3px 10px",
            fontSize: "0.75rem",
            fontWeight: "600",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: stateInfo.dotColor,
            }}
          />
          {stateInfo.label}
        </span>

        {/* Author info */}
        <span style={{ color: "#64748b" }}>
          {authorName && (
            <>
              by <strong style={{ color: "#334155", fontWeight: "500" }}>{authorName}</strong>
            </>
          )}
        </span>

        {/* Separator */}
        <span style={{ color: "#cbd5e1" }}>•</span>

        {/* Comments count */}
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span style={{ fontWeight: "500", color: "#667eea" }}>{commentsCount}</span>
        </span>

        {/* Changes count */}
        {changesCount && (
          <>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <span style={{ fontWeight: "500", color: "#667eea" }}>{changesCount} files</span>
            </span>
          </>
        )}

        {/* Age */}
        {age !== null && (
          <>
            <span style={{ color: "#cbd5e1" }}>•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontWeight: "500", color: "#667eea" }}>{age}d</span>
            </span>
          </>
        )}
      </div>

      {/* Second row: Branch info */}
      {mrData.source_branch && mrData.target_branch && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, width: "100%" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2" style={{ flexShrink: 0 }}>
            <line x1="6" y1="3" x2="6" y2="15"/>
            <circle cx="18" cy="6" r="3"/>
            <circle cx="6" cy="18" r="3"/>
            <path d="M18 9a9 9 0 0 1-9 9"/>
          </svg>
          <span
            style={{
              background: "#f0f4ff",
              color: "#4338ca",
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "0.72rem",
              fontWeight: "500",
              fontFamily: "monospace",
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "default",
            }}
            title={mrData.source_branch}
          >
            {mrData.source_branch}
          </span>
          <span style={{ color: "#94a3b8", flexShrink: 0 }}>→</span>
          <span
            style={{
              background: "#f0fdf4",
              color: "#166534",
              borderRadius: "6px",
              padding: "2px 8px",
              fontSize: "0.72rem",
              fontWeight: "500",
              fontFamily: "monospace",
              flexShrink: 0,
              maxWidth: "30%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "default",
            }}
            title={mrData.target_branch}
          >
            {mrData.target_branch}
          </span>
        </div>
      )}

      {/* Third row: Reviewers */}
      {reviewers.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Reviewers:</span>
          {reviewers.slice(0, 3).map((reviewer, idx) => (
            <span
              key={idx}
              style={{
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: "10px",
                padding: "2px 8px",
                fontSize: "0.7rem",
                fontWeight: "500",
              }}
              title={reviewer.name}
            >
              {reviewer.name}
            </span>
          ))}
          {reviewers.length > 3 && (
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.7rem",
                fontWeight: "500",
              }}
              title={reviewers.slice(3).map(r => r.name).join(', ')}
            >
              +{reviewers.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Fourth row: Labels */}
      {labels.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          {labels.slice(0, 4).map((label, idx) => (
            <span
              key={idx}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                borderRadius: "10px",
                padding: "2px 8px",
                fontSize: "0.7rem",
                fontWeight: "500",
                border: "1px solid #e2e8f0",
              }}
            >
              {label}
            </span>
          ))}
          {labels.length > 4 && (
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.7rem",
                fontWeight: "500",
              }}
              title={labels.slice(4).join(', ')}
            >
              +{labels.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueInfoCard;

