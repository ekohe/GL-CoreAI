import { useFormContext } from "../../../../contexts/FormContext";
import { APPEARANCE_OPTIONS, LANGUAGE_OPTIONS } from "../../../../utils/constants";
import { applyAppearance } from "../../../../utils/theme";
import FormField from "../FormField";

const GeneralTab = () => {
  const { formData, handleChange } = useFormContext();

  // Handle appearance change and apply immediately
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
    applyAppearance(e.target.value);
  };

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">General Settings</h2>
        <p className="section-description">
          Customize the appearance and language of your extension
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🎨</span>
          Appearance
        </div>
        <div className="group-content">
          <FormField label="Theme">
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  name="GASAppearance"
                  onChange={handleAppearanceChange}
                  value={formData.GASAppearance}
                >
                  {APPEARANCE_OPTIONS.map(({ value, label }) => (
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

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🌐</span>
          Language
        </div>
        <div className="group-content">
          <FormField label="Language">
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  name="GASLanguage"
                  onChange={handleChange}
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
