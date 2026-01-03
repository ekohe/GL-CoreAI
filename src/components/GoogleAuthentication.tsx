import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import { launchGoogleAuthentication } from "../utils";

const GoogleAuthentication = (props: {
  text: string;
  setGoogleAccessToken: any;
  privacyPolicy: boolean;
  setErrorText?: (error: string) => void;
}) => {
  const { text, setGoogleAccessToken, privacyPolicy, setErrorText } = props;
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <button
        className={`button is-fullwidth ${isAuthenticating ? 'is-loading' : ''}`}
        style={{
          background: privacyPolicy
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
          border: "none",
          borderRadius: "14px",
          padding: "1rem 1.5rem",
          height: "auto",
          minHeight: "clamp(52px, 8vw, 60px)",
          fontWeight: "600",
          color: privacyPolicy ? "white" : "#9ca3af",
          boxShadow: privacyPolicy
            ? "0 4px 20px rgba(102, 126, 234, 0.35)"
            : "0 2px 8px rgba(0, 0, 0, 0.08)",
          transition: "all 0.25s ease",
          cursor: privacyPolicy ? "pointer" : "not-allowed",
          opacity: isAuthenticating ? 0.85 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
        }}
        disabled={!privacyPolicy || isAuthenticating}
        onClick={(e) =>
          privacyPolicy && !isAuthenticating && launchGoogleAuthentication(e, setGoogleAccessToken, setIsAuthenticating, setErrorText)
        }
        onMouseEnter={(e) => {
          if (privacyPolicy && !isAuthenticating) {
            e.currentTarget.style.transform = "translateY(-3px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(102, 126, 234, 0.45)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = privacyPolicy
            ? "0 4px 20px rgba(102, 126, 234, 0.35)"
            : "0 2px 8px rgba(0, 0, 0, 0.08)";
        }}
      >
        {!isAuthenticating && (
          <span
            style={{
              fontSize: "clamp(1.1rem, 3vw, 1.25rem)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon icon={faGoogle} />
          </span>
        )}
        <span
          style={{
            fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
            letterSpacing: "0.01em",
          }}
        >
          {isAuthenticating ? "Authenticating..." : text}
        </span>
      </button>
    </div>
  );
};

export default GoogleAuthentication;
