/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-target-blank */
import { calculateTicketAge } from "../../../utils";
import { enhanceStringPrototype } from "../../../utils/enhanceStringPrototype";

enhanceStringPrototype();

// Icon components for issue info
const InfoIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    author: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    assignee: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    comments: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    age: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    updated: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 4v6h-6"/>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
      </svg>
    ),
    state: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  };
  return <span style={{ display: "flex", alignItems: "center", color: "#667eea" }}>{icons[type] || icons.state}</span>;
};

const InfoRow = ({ label, value, iconType }: { label: string; value: JSX.Element | string; iconType: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "10px 14px",
      background: "#f8fafc",
      borderRadius: "10px",
      marginBottom: "8px",
      transition: "all 0.2s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: "120px",
        color: "#64748b",
        fontSize: "0.8rem",
        fontWeight: "500",
      }}
    >
      <InfoIcon type={iconType} />
      {label}
    </div>
    <div style={{ fontSize: "0.85rem", color: "#1e293b", fontWeight: "500", flex: 1 }}>
      {value}
    </div>
  </div>
);

interface IssueData {
  title?: string;
  author?: { web_url: string; avatar_url: string; name: string };
  assignee?: { web_url: string; avatar_url: string; name: string };
  user_notes_count?: number;
  created_at?: string;
  updated_at?: string;
  state?: string;
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
 * Issue info card showing details like author, assignee, comments, etc.
 */
export const IssueInfoCard = ({ issueData }: IssueInfoCardProps) => {
  if (Object.keys(issueData).length === 0) return null;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        border: "1px solid #e2e8f0",
        marginBottom: "20px",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
          paddingBottom: "12px",
          borderBottom: "2px solid #667eea",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
          Issue Details
        </span>
      </div>

      <div className="gitlab-infos">
        {['author', 'assignee'].map((role: string) => {
          const roleData = issueData[role as keyof IssueData] as IssueData['author'];
          return roleData && (
            <InfoRow
              key={role}
              label={role.titlize()}
              value={
                <a
                  href={roleData.web_url}
                  target="_blank"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    color: "#1e293b",
                  }}
                >
                  <img
                    src={roleData.avatar_url}
                    alt={roleData.name}
                    style={{
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      border: "2px solid #e2e8f0",
                    }}
                  />
                  <span style={{ fontWeight: "500" }}>{roleData.name}</span>
                </a>
              }
              iconType={role}
            />
          );
        })}

        <InfoRow
          label="Comments"
          value={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: (issueData.user_notes_count ?? 0) > 0 ? "#667eea" : "#94a3b8",
                color: "white",
                borderRadius: "12px",
                padding: "2px 10px",
                fontSize: "0.8rem",
                fontWeight: "600",
                minWidth: "28px",
              }}
            >
              {issueData.user_notes_count ?? 0}
            </span>
          }
          iconType="comments"
        />

        {['created_at', 'updated_at'].map((dateType) => {
          const dateValue = issueData[dateType as keyof IssueData] as string | undefined;
          return dateValue && (
            <InfoRow
              key={dateType}
              label={dateType === 'created_at' ? 'Age' : 'Last Updated'}
              value={
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "600", color: "#667eea" }}>
                    {calculateTicketAge(dateValue)} days
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    ({new Date(dateValue).toLocaleDateString()})
                  </span>
                </span>
              }
              iconType={dateType === 'created_at' ? 'age' : 'updated'}
            />
          );
        })}

        <InfoRow
          label="State"
          value={
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: issueData.state === "opened" ? "#dcfce7" : "#fee2e2",
                color: issueData.state === "opened" ? "#166534" : "#991b1b",
                borderRadius: "16px",
                padding: "4px 12px",
                fontSize: "0.8rem",
                fontWeight: "600",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: issueData.state === "opened" ? "#22c55e" : "#ef4444",
                }}
              />
              {issueData.state === "opened" ? "Open" : (issueData.state || "").titlize()}
            </span>
          }
          iconType="state"
        />
      </div>
    </div>
  );
};

export default IssueInfoCard;

