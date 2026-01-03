/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from "../assets/icons/logo.svg";
import { AiBOT } from "../utils/common";
import { AI_EXT_STATUS } from "../utils/constants";
import GoogleAuthentication from "./GoogleAuthentication";
import Footer from "../containers/app/Footer";
import { useState } from "react";
import { THEME_COLORS } from "../utils/theme";

const SignIn: React.FC<ScreenProps> = ({ setGoogleAccessToken, setErrorText }) => {
  const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false);

  return (
    <section
      className="section"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "0",
        boxSizing: "border-box",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #f0f4f8 100%)",
      }}
    >
      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: "1.5rem",
        }}
      >
        {/* Card Container - Expands with window */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "white",
            borderRadius: "20px",
            padding: "clamp(1.5rem, 4vw, 2.5rem)",
            boxShadow: "0 10px 40px rgba(102, 126, 234, 0.12), 0 2px 10px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "1rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "24px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)",
              }}
            >
              <img
                src={logo}
                alt={AiBOT.name}
                style={{
                  width: "clamp(80px, 20vw, 100px)",
                  height: "clamp(80px, 20vw, 100px)",
                  objectFit: "contain",
                  filter: "brightness(1.1)",
                }}
              />
            </div>
            <h1
              style={{
                fontSize: "clamp(1.25rem, 4vw, 1.5rem)",
                fontWeight: "700",
                marginTop: "1.5rem",
                color: "#1a1a2e",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome to {AiBOT.name}
            </h1>
            <p
              style={{
                fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                color: "#6b7280",
                marginTop: "0.5rem",
              }}
            >
              AI-powered GitLab issue summarization and code review
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
              margin: "1.5rem 0",
            }}
          />

          {/* Google Auth Button */}
          <div style={{ width: "100%" }}>
            <GoogleAuthentication
              text={`${AI_EXT_STATUS.signin.text} with Google`}
              setGoogleAccessToken={setGoogleAccessToken}
              privacyPolicy={privacyPolicy}
              setErrorText={setErrorText}
            />
          </div>

          {/* Privacy Policy Checkbox */}
          <div
            style={{
              width: "100%",
              marginTop: "1rem",
              padding: "0.75rem",
              background: "#f9fafb",
              borderRadius: "12px",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)",
                color: "#374151",
                cursor: "pointer",
                lineHeight: "1.5",
              }}
            >
              <input
                type="checkbox"
                checked={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.checked)}
                style={{
                  marginTop: "0.2rem",
                  width: "18px",
                  height: "18px",
                  accentColor: THEME_COLORS.primary,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <span>
                I agree to {AiBOT.name}{" "}
                <a
                  href="https://ekohe.github.io/GL-CoreAI/public/privacy.html"
                  style={{
                    color: THEME_COLORS.primaryLight,
                    textDecoration: "none",
                    fontWeight: "600",
                    borderBottom: `1px dashed ${THEME_COLORS.primaryLight}`,
                  }}
                  target="_blank"
                >
                  Terms of Use and Privacy Policy
                </a>
              </span>
            </label>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SignIn;
