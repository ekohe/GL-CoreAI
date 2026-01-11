import { useFormContext } from "../../../../contexts/FormContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import FormField from "../FormField";

const GitLabTab = () => {
  const { formData, handleChange } = useFormContext();
  const { t } = useLanguage();

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">{t("gitlab.title")}</h2>
        <p className="section-description">
          {t("gitlab.description")}
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🔗</span>
          {t("gitlab.connection")}
        </div>
        <div className="group-content">
          <FormField label={t("gitlab.webUrl")}>
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASGitLab"
                placeholder={t("gitlab.autoDetectedPlaceholder")}
                onChange={handleChange}
                value={formData.GASGitLab}
                readOnly
              />
            </div>
          </FormField>

          <FormField label={t("gitlab.apiVersion")}>
            <div className="control">
              <input
                className="input"
                type="text"
                autoComplete="off"
                name="GASGitLabApiVersion"
                placeholder="api/v4"
                readOnly
                onChange={handleChange}
                value={formData.GASGitLabApiVersion}
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <strong>Note:</strong> {t("gitlab.autoDetectNote")}
        </div>
      </div>
    </div>
  );
};

export default GitLabTab;
