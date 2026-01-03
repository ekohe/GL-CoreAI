/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from "../assets/icons/logo.svg";
import { AiBOT } from "../utils/common";
import { AI_EXT_STATUS, MESSAGES } from "../utils/constants";
import OrDivider from "./OrDivider";
import { useState } from "react";
import Footer from "../containers/app/Footer";
import { isEmail } from "../utils/tools";

const ForgetPassword: React.FC<ScreenProps> = ({
  setScreenName,
  setErrorText,
  setMessageText,
}) => {
  const [email, setEmail] = useState<string | undefined>(undefined);

  const openPage = (screenName: string) => {
    setScreenName(screenName);
  };

  const handleForgetPassword = () => {
    const validations = [
      { condition: email === undefined, message: MESSAGES.missing_email },
      { condition: email && !isEmail(email), message: MESSAGES.invalid_email },
    ];

    const hasError = validations.some(({ condition, message }) => {
      if (condition) {
        setErrorText(message);
        return true;
      }
      return false;
    });

    if (!hasError) {
      setScreenName(AI_EXT_STATUS.signin.code);
      setMessageText?.(MESSAGES.reset_password);
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
        padding: "1.5rem",
        boxSizing: "border-box",
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
          padding: "0 1rem",
        }}
      >
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img
            src={logo}
            alt={AiBOT.name}
            style={{
              borderRadius: "50%",
              width: "min(120px, 30vw)",
              height: "min(120px, 30vw)",
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
            Forgot your Password?
          </h1>
          <p
            style={{
              fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
              color: "#6b7280",
              marginTop: "0.75rem",
              lineHeight: "1.6",
            }}
          >
            We'll email you a secure link to reset your password
          </p>
        </div>

        {/* Email Input */}
        <div style={{ width: "100%", marginBottom: "1.5rem" }}>
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
        </div>

        {/* Reset Button */}
        <button
          style={{
            width: "100%",
            padding: "0.875rem",
            fontSize: "1rem",
            fontWeight: "600",
            color: "white",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 14px rgba(102, 126, 234, 0.3)",
          }}
          onClick={() => handleForgetPassword()}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(102, 126, 234, 0.3)";
          }}
        >
          {AI_EXT_STATUS.reset_password.text}
        </button>

        <OrDivider />

        {/* Back to Sign In */}
        <p
          style={{
            textAlign: "center",
            fontSize: "clamp(0.875rem, 2.5vw, 0.95rem)",
            color: "#6b7280",
          }}
        >
          Remember your password?{" "}
          <a
            onClick={() => openPage(AI_EXT_STATUS.signin.code)}
            style={{
              color: "#00cbc0",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {AI_EXT_STATUS.signin.text}
          </a>
        </p>
      </div>

      <Footer />
    </section>
  );
};

export default ForgetPassword;
