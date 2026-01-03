import { MR_ACTION_TYPES, MRActionType, ISSUE_ACTION_TYPES, IssueActionType } from "../../../utils/constants";

// MR Action Icons
const MRActionIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    summarize: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    issues: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    notes: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  };
  return <span style={{ display: "flex", alignItems: "center" }}>{icons[type] || icons.summarize}</span>;
};

// Issue Action Icons
const IssueActionIcon = ({ type }: { type: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    summarize: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    blockers: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    update: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
  };
  return <span style={{ display: "flex", alignItems: "center" }}>{icons[type] || icons.summarize}</span>;
};

interface MRActionCardProps {
  actionType: keyof typeof MR_ACTION_TYPES;
  onSelect: (type: MRActionType) => void;
  isProcessing: boolean;
}

/**
 * MR Action Card Component - displays a selectable action for merge requests
 */
export const MRActionCard = ({ actionType, onSelect, isProcessing }: MRActionCardProps) => {
  const action = MR_ACTION_TYPES[actionType];

  return (
    <div
      style={{
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
        marginBottom: "12px",
        cursor: isProcessing ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        border: "1px solid #e2e8f0",
        opacity: isProcessing ? 0.7 : 1,
      }}
      onClick={() => !isProcessing && onSelect(actionType)}
      onMouseEnter={(e) => {
        if (!isProcessing) {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.borderColor = "#667eea";
          e.currentTarget.style.transform = "translateX(4px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f8fafc";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "8px",
            padding: "10px",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MRActionIcon type={action.icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: "600",
              fontSize: "0.95rem",
              color: "#1e293b",
              marginBottom: "4px",
            }}
          >
            {action.title}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
              lineHeight: "1.4",
            }}
          >
            {action.description}
          </div>
        </div>
        <div
          style={{
            color: "#667eea",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

interface IssueActionCardProps {
  actionType: keyof typeof ISSUE_ACTION_TYPES;
  onSelect: (type: IssueActionType) => void;
  isProcessing: boolean;
}

/**
 * Issue Action Card Component - displays a selectable action for issues
 */
export const IssueActionCard = ({ actionType, onSelect, isProcessing }: IssueActionCardProps) => {
  const action = ISSUE_ACTION_TYPES[actionType];

  return (
    <div
      style={{
        padding: "16px",
        background: "#f8fafc",
        borderRadius: "12px",
        marginBottom: "12px",
        cursor: isProcessing ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        border: "1px solid #e2e8f0",
        opacity: isProcessing ? 0.7 : 1,
      }}
      onClick={() => !isProcessing && onSelect(actionType)}
      onMouseEnter={(e) => {
        if (!isProcessing) {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.borderColor = "#11998e";
          e.currentTarget.style.transform = "translateX(4px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f8fafc";
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            borderRadius: "8px",
            padding: "10px",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IssueActionIcon type={action.icon} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: "600",
              fontSize: "0.95rem",
              color: "#1e293b",
              marginBottom: "4px",
            }}
          >
            {action.title}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#64748b",
              lineHeight: "1.4",
            }}
          >
            {action.description}
          </div>
        </div>
        <div
          style={{
            color: "#11998e",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

interface ActionSectionHeaderProps {
  color: string;
}

/**
 * Section header for action cards
 */
export const ActionSectionHeader = ({ color }: ActionSectionHeaderProps) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "16px",
      paddingBottom: "12px",
      borderBottom: `2px solid ${color}`,
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b" }}>
      What would you like to do?
    </span>
  </div>
);

