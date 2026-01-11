import { useFormContext } from "../../../../contexts/FormContext";
import { useLanguage, Language } from "../../../../contexts/LanguageContext";
import { APPEARANCE_OPTIONS, LANGUAGE_OPTIONS } from "../../../../utils/constants";
import { applyAppearance } from "../../../../utils/theme";
import FormField from "../FormField";

const GeneralTab = () => {
  const { formData, handleChange } = useFormContext();
  const { t, setLanguage } = useLanguage();

  // Handle appearance change and apply immediately
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
    applyAppearance(e.target.value);
  };

  // Handle language change and update context
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
    setLanguage(e.target.value as Language);
  };

  // Get translated appearance options
  const getAppearanceLabel = (value: string): string => {
    switch (value) {
      case "system":
        return t("general.systemDefault");
      case "light":
        return t("general.light");
      case "dark":
        return t("general.dark");
      default:
        return value;
    }
  };

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">{t("general.title")}</h2>
        <p className="section-description">
          {t("general.description")}
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🎨</span>
          {t("general.appearance")}
        </div>
        <div className="group-content">
          <FormField label={t("general.theme")}>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  name="GASAppearance"
                  onChange={handleAppearanceChange}
                  value={formData.GASAppearance}
                >
                  {APPEARANCE_OPTIONS.map(({ value }) => (
                    <option key={value} value={value}>
                      {getAppearanceLabel(value)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormField>
        </div>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🌐</span>
          {t("general.language")}
        </div>
        <div className="group-content">
          <FormField label={t("general.language")}>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  name="GASLanguage"
                  onChange={handleLanguageChange}
                  value={formData.GASLanguage}
                >
                  {LANGUAGE_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
