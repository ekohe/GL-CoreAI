import { openChromeSettingPage } from "../../../utils";
import { MESSAGES } from "../../../utils/constants";

interface SetupLLMButtonProps {
  message?: string;
}

/**
 * Button to open settings page to configure LLM API key
 */
export const SetupLLMButton = ({ message = MESSAGES.setup_llm_apikey }: SetupLLMButtonProps) => (
  <div className="control has-text-centered" style={{ margin: "24px 0" }}>
    <button
      className="button is-medium"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: "8px",
        border: "none",
        padding: "12px 28px",
        fontWeight: "600",
        fontSize: "0.9rem",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={() => openChromeSettingPage()}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
      }}
    >
      {message}
    </button>
  </div>
);

interface TryAnotherActionButtonProps {
  onClick: () => void;
  color: string;
}

/**
 * Button to reset action selection and try another action
 */
export const TryAnotherActionButton = ({ onClick, color }: TryAnotherActionButtonProps) => (
  <div style={{ marginTop: "20px", textAlign: "center" }}>
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: color,
        border: `2px solid ${color}`,
        borderRadius: "8px",
        padding: "10px 20px",
        fontWeight: "600",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.color = "white";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = color;
      }}
    >
      ← Try another action
    </button>
  </div>
);

