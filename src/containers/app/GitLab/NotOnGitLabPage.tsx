/**
 * Component displayed when user is not on a supported GitLab page
 */
const NotOnGitLabPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 8px 32px rgba(240, 147, 251, 0.3)",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "#1e293b",
          margin: "0 0 12px 0",
          lineHeight: "1.4",
        }}
      >
        Not a Supported Page
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: "0.9rem",
          color: "#64748b",
          margin: "0 0 24px 0",
          lineHeight: "1.6",
          maxWidth: "280px",
        }}
      >
        Navigate to a GitLab issue or merge request to use AI-powered analysis.
      </p>

      {/* Supported Pages */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "20px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            margin: "0 0 12px 0",
          }}
        >
          Supported Pages
        </p>

        {/* Issue Page */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Issues
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              /issues/123
            </div>
          </div>
        </div>

        {/* Merge Request Page */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 21V9a9 9 0 0 0 9 9" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              Merge Requests
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              /-/merge_requests/456
            </div>
          </div>
        </div>
      </div>

      {/* GitLab Logo */}
      <div
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#94a3b8",
          fontSize: "0.75rem",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
        </svg>
        <span>Works with any GitLab instance</span>
      </div>
    </div>
  );
};

export default NotOnGitLabPage;

