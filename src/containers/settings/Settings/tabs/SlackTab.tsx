import { useState } from "react";
import { useFormContext } from "../../../../contexts/FormContext";
import { postToSlack, SlackMessageOptions } from "../../../../utils/slack";
import FormField from "../FormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { AiBOT } from "../../../../utils/common";

const SlackTab = () => {
  const { formData, handleChange } = useFormContext();
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string>("");

  const handleTestConnection = async () => {
    if (!formData.GASSlackWebhookUrl) {
      setTestStatus("error");
      setTestError("Please enter a webhook URL first");
      return;
    }

    setTestStatus("testing");
    setTestError("");

    try {
      const testMessage: SlackMessageOptions = {
        text: `Test message from ${AiBOT.name} - Connection successful!`,
        username: formData.GASSlackBotName || AiBOT.name,
        icon_emoji: formData.GASSlackIconEmoji || ":robot_face:",
      };

      const result = await postToSlack(formData.GASSlackWebhookUrl, testMessage);

      if (result.success) {
        setTestStatus("success");
        setTimeout(() => setTestStatus("idle"), 3000);
      } else {
        setTestStatus("error");
        setTestError(result.error || "Failed to send test message");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err.message || "An unexpected error occurred");
    }
  };

  // Handle checkbox change for enabled state
  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Create a synthetic event that the handleChange function expects
    handleChange(e);
  };

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">Slack Integration</h2>
        <p className="section-description">
          Connect your Slack workspace to share AI summaries and insights directly with your team
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">⚡</span>
          Quick Settings
        </div>
        <div className="group-content">
          <FormField label="Enable Slack">
            <div className="control">
              <label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  name="GASSlackEnabled"
                  checked={formData.GASSlackEnabled}
                  onChange={handleEnabledChange}
                  style={{
                    width: "18px",
                    height: "18px",
                    cursor: "pointer",
                  }}
                />
                <span style={{ color: formData.GASSlackEnabled ? "#16a34a" : "#64748b" }}>
                  {formData.GASSlackEnabled ? "Slack integration is enabled" : "Slack integration is disabled"}
                </span>
              </label>
            </div>
          </FormField>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🔗</span>
          Webhook Configuration
        </div>
        <div className="group-content">
          <FormField label="Webhook URL">
            <div className="control">
              <input
                className="input"
                type="password"
                name="GASSlackWebhookUrl"
                value={formData.GASSlackWebhookUrl}
                onChange={handleChange}
                placeholder="https://hooks.slack.com/services/..."
                style={{ fontFamily: "monospace" }}
              />
              <p className="help" style={{ marginTop: "6px", fontSize: "0.8rem", color: "#64748b" }}>
                Create an Incoming Webhook in your Slack App settings.
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: "4px", color: "#667eea" }}
                >
                  Learn how →
                </a>
              </p>
            </div>
          </FormField>

          {/* Test Connection Button */}
          <div style={{ marginTop: "16px", marginBottom: "8px" }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === "testing" || !formData.GASSlackWebhookUrl}
              className="button"
              style={{
                background: testStatus === "success"
                  ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                  : testStatus === "error"
                  ? "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: testStatus === "testing" ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
                fontWeight: 500,
                opacity: !formData.GASSlackWebhookUrl ? 0.5 : 1,
                transition: "all 0.2s ease",
              }}
            >
              {testStatus === "testing" && (
                <FontAwesomeIcon icon={faSpinner} spin />
              )}
              {testStatus === "success" && (
                <FontAwesomeIcon icon={faCheckCircle} />
              )}
              {testStatus === "error" && (
                <FontAwesomeIcon icon={faTimesCircle} />
              )}
              {testStatus === "idle" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              )}
              {testStatus === "testing" ? "Sending..." :
               testStatus === "success" ? "Message Sent!" :
               testStatus === "error" ? "Failed" :
               "Test Connection"}
            </button>
            {testStatus === "error" && testError && (
              <p style={{
                color: "#dc2626",
                fontSize: "0.8rem",
                marginTop: "8px",
                padding: "8px 12px",
                background: "#fef2f2",
                borderRadius: "6px",
                border: "1px solid #fecaca"
              }}>
                {testError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bot Customization */}
      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🤖</span>
          Bot Customization
        </div>
        <div className="group-content">
          <FormField label="Bot Name">
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASSlackBotName"
                value={formData.GASSlackBotName}
                onChange={handleChange}
                placeholder={AiBOT.name}
              />
              <p className="help" style={{ marginTop: "6px", fontSize: "0.8rem", color: "#64748b" }}>
                The name that will appear as the sender in Slack
              </p>
            </div>
          </FormField>

          <FormField label="Default Channel">
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASSlackDefaultChannel"
                value={formData.GASSlackDefaultChannel}
                onChange={handleChange}
                placeholder="#general or leave empty for webhook default"
              />
              <p className="help" style={{ marginTop: "6px", fontSize: "0.8rem", color: "#64748b" }}>
                Optional: Override the default channel set in your webhook
              </p>
            </div>
          </FormField>

          <FormField label="Icon Emoji">
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASSlackIconEmoji"
                value={formData.GASSlackIconEmoji}
                onChange={handleChange}
                placeholder=":robot_face:"
              />
              <p className="help" style={{ marginTop: "6px", fontSize: "0.8rem", color: "#64748b" }}>
                Slack emoji to use as the bot's icon (e.g., :robot_face:, :brain:, :sparkles:)
              </p>
            </div>
          </FormField>
        </div>
      </div>

      {/* Usage Info */}
      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">💡</span>
          How to Use
        </div>
        <div className="group-content" style={{ padding: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #bae6fd"
          }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 600, color: "#0369a1" }}>
              Share AI insights to Slack
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: "20px",
              color: "#0c4a6e",
              fontSize: "0.875rem",
              lineHeight: 1.6
            }}>
              <li>After any AI response, click the <strong>Share to Slack</strong> button</li>
              <li>Use the chat to ask AI to "send this to Slack"</li>
              <li>Summaries and code reviews can be shared instantly</li>
              <li>Messages include context about the source (issue/MR)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackTab;
