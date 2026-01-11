import { useFormContext } from "../../../../contexts/FormContext";
import { useLanguage } from "../../../../contexts/LanguageContext";
import FormField from "../FormField";

const PersonalizationTab = () => {
  const { formData, handleChange } = useFormContext();
  const { t } = useLanguage();

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">{t("personalization.title")}</h2>
        <p className="section-description">
          {t("personalization.description")}
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">✨</span>
          {t("personalization.customInstructions")}
        </div>
        <div className="group-content">
          <FormField label={t("personalization.instructions")}>
            <div className="control">
              <textarea
                className="textarea"
                name="GASCustomInstructions"
                placeholder={t("personalization.instructionsPlaceholder")}
                onChange={handleChange}
                value={formData.GASCustomInstructions}
                rows={3}
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">👤</span>
          {t("personalization.aboutYou")}
        </div>
        <div className="group-content">
          <FormField label={t("personalization.nickname")}>
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASNickname"
                placeholder={t("personalization.nicknamePlaceholder")}
                onChange={handleChange}
                value={formData.GASNickname}
              />
            </div>
          </FormField>

          <FormField label={t("personalization.occupation")}>
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASOccupation"
                placeholder={t("personalization.occupationPlaceholder")}
                onChange={handleChange}
                value={formData.GASOccupation}
              />
            </div>
          </FormField>

          <FormField label={t("personalization.aboutYouLabel")}>
            <div className="control">
              <textarea
                className="textarea"
                name="GASAboutYou"
                placeholder={t("personalization.aboutYouPlaceholder")}
                onChange={handleChange}
                value={formData.GASAboutYou}
                rows={3}
              />
            </div>
          </FormField>
        </div>
      </div>

      <div className="info-card success">
        <div className="info-icon">🎯</div>
        <div className="info-content">
          <strong>{t("personalization.tip")}</strong>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationTab;
