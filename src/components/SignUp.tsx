/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */

import logo from "../assets/icons/logo.svg";
import { AiBOT } from "../utils/common";

import { AI_EXT_STATUS, MESSAGES } from "../utils/constants";
import OrDivider from "./OrDivider";
import GoogleAuthentication from "./GoogleAuthentication";
import Footer from "../containers/app/Footer";
import { useState } from "react";
import { isEmail } from "../utils/tools";
import { setStorage } from "../utils";
import { THEME_COLORS } from "../utils/theme";

const SignUp: React.FC<ScreenProps> = ({
  setScreenName,
  setErrorText,
  setUserAccessToken,
  setGoogleAccessToken,
}) => {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [confirmPassword, setConfirmPassword] = useState<string | undefined>(
    undefined
  );
  const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false);

  const openPage = (screenName: string) => {
    setScreenName(screenName);
  };

  const handleSignUp = () => {
    const validations = [
      { condition: email === undefined, message: MESSAGES.missing_email },
      { condition: email && !isEmail(email), message: MESSAGES.invalid_email },
      { condition: password === undefined, message: MESSAGES.missing_password },
      {
        condition: password && password.length < 8,
        message: MESSAGES.invalid_password,
      },
      {
        condition: confirmPassword === undefined,
        message: MESSAGES.missing_confirm_password,
      },
      {
        condition: password !== confirmPassword,
        message: MESSAGES.password_not_match,
      },
    ];

    const hasError = validations.some(({ condition, message }) => {
      if (condition) {
        setErrorText(message);
        return true;
      }
      return false;
    });

    if (!hasError) {
      const newUserToken = "userToken";

      setStorage({ GASUserAccessToken: newUserToken }, () => {
        setUserAccessToken?.(newUserToken);
      });
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "0.875rem 1rem",
    fontSize: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box" as const,
  };

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "1rem",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          padding: "1rem 0",
        }}
      >
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src={logo}
            alt={AiBOT.name}
            style={{
              borderRadius: "50%",
              width: "min(100px, 25vw)",
              height: "min(100px, 25vw)",
              objectFit: "contain",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
            }}
          />
          <h1
            style={{
              fontSize: "clamp(1.25rem, 4vw, 1.5rem)",
              fontWeight: "700",
              marginTop: "1rem",
              color: "#1a1a2e",
            }}
          >
            {AI_EXT_STATUS.signup.text} to {AiBOT.name}
          </h1>
        </div>

        {/* Form Fields */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#00cbc0";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 203, 192, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password || ""}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#00cbc0";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 203, 192, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword || ""}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#00cbc0";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0, 203, 192, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Privacy Policy */}
        <div style={{ width: "100%", margin: "1rem 0" }}>
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
                  textDecoration: "underline",
                  fontWeight: "500",
                  borderBottom: `1px dashed ${THEME_COLORS.primaryLight}`,
                }}
                target="_blank"
              >
                Terms of Use and Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* Sign Up Button */}
        <button
          style={{
            width: "100%",
            padding: "0.875rem",
            fontSize: "1rem",
            fontWeight: "600",
            color: "white",
            background: privacyPolicy ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#d1d5db",
            border: "none",
            borderRadius: "12px",
            cursor: privacyPolicy ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: privacyPolicy ? "0 4px 14px rgba(102, 126, 234, 0.3)" : "none",
          }}
          onClick={() => privacyPolicy && handleSignUp()}
          onMouseEnter={(e) => {
            if (privacyPolicy) {
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {AI_EXT_STATUS.signup.text}
        </button>

        {/* Sign In Link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "clamp(0.875rem, 2.5vw, 0.95rem)",
            color: "#6b7280",
          }}
        >
          Already have an account?{" "}
          <a
            onClick={() => openPage(AI_EXT_STATUS.signin.code)}
            style={{
              color: THEME_COLORS.primaryLight,
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "none",
              borderBottom: `1px dashed ${THEME_COLORS.primaryLight}`,
            }}
          >
            {AI_EXT_STATUS.signin.text}
          </a>
        </p>

        <OrDivider />

        {/* Google Auth */}
        <div style={{ width: "100%" }}>
          <GoogleAuthentication
            text={`${AI_EXT_STATUS.signup.text} with Google`}
            setGoogleAccessToken={setGoogleAccessToken}
            privacyPolicy={privacyPolicy}
            setErrorText={setErrorText}
          />
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SignUp;
