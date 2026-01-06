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

export default IssueInfoCard;

