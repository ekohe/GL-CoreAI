/**
 * Loading state component shown while analyzing the page
 */
const LoadingState = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "3px solid #e2e8f0",
          borderTop: "3px solid #667eea",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "16px",
        }}
      />
      <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
        Analyzing page...
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingState;

