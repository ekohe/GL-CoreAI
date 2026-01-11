import { useState } from "react";
import { useFormContext } from "../../../../contexts/FormContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { postToSlack, SlackMessageOptions } from "../../../../utils/slack";
import FormField from "../FormField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { AiBOT } from "../../../../utils/common";

const SlackTab = () => {
  const { formData, handleChange } = useFormContext();
  const { t } = useLanguage();
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string>("");

  const handleTestConnection = async () => {
    if (!formData.GASSlackWebhookUrl) {
      setTestStatus("error");
      setTestError(t("slack.enterWebhookFirst"));
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
        setTestError(result.error || t("slack.failed"));
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestError(err.message || t("slack.failed"));
    }
  };

  // Handle checkbox change for enabled state
  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">{t("slack.title")}</h2>
        <p className="section-description">
          {t("slack.description")}
        </p>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">⚡</span>
          {t("slack.quickSettings")}
        </div>
        <div className="group-content">
          <FormField label={t("slack.enableSlack")}>
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
                  {formData.GASSlackEnabled ? t("slack.enabled") : t("slack.disabled")}
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
          {t("slack.webhookConfig")}
        </div>
        <div className="group-content">
          <FormField label={t("slack.webhookUrl")}>
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
                {t("slack.webhookUrlHelp")}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: "4px", color: "#667eea" }}
                >
                  {t("slack.learnHow")}
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
              {testStatus === "testing" ? t("slack.sending") :
               testStatus === "success" ? t("slack.messageSent") :
               testStatus === "error" ? t("slack.failed") :
               t("slack.testConnection")}
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
          {t("slack.botCustomization")}
        </div>
        <div className="group-content">
          <FormField label={t("slack.botName")}>
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
                {t("slack.botNameHelp")}
              </p>
            </div>
          </FormField>

          <FormField label={t("slack.defaultChannel")}>
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASSlackDefaultChannel"
                value={formData.GASSlackDefaultChannel}
                onChange={handleChange}
                placeholder="#general"
              />
              <p className="help" style={{ marginTop: "6px", fontSize: "0.8rem", color: "#64748b" }}>
                {t("slack.defaultChannelHelp")}
              </p>
            </div>
          </FormField>

          <FormField label={t("slack.iconEmoji")}>
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
                {t("slack.iconEmojiHelp")}
              </p>
            </div>
          </FormField>
        </div>
      </div>

      {/* Usage Info */}
      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">💡</span>
          {t("slack.howToUse")}
        </div>
        <div className="group-content" style={{ padding: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #bae6fd"
          }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 600, color: "#0369a1" }}>
              {t("slack.shareAIInsights")}
            </h4>
            <ul style={{
              margin: 0,
              paddingLeft: "20px",
              color: "#0c4a6e",
              fontSize: "0.875rem",
              lineHeight: 1.6
            }}>
              <li>{t("slack.step1")}</li>
              <li>{t("slack.step2")}</li>
              <li>{t("slack.step3")}</li>
              <li>{t("slack.step4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackTab;
