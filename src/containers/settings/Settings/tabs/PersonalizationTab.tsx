import { useFormContext } from "../../../../contexts/FormContext";
import FormField from "../FormField";

const PersonalizationTab = () => {
  const { formData, handleChange } = useFormContext();

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">Personalization</h2>
        <p className="section-description">
          Customize how the AI understands and responds to you
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">✨</span>
          Custom Instructions
        </div>
        <div className="group-content">
          <FormField label="Instructions">
            <div className="control">
              <textarea
                className="textarea"
                name="GASCustomInstructions"
                placeholder="e.g., Always provide code examples, Focus on security aspects..."
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
          About You
        </div>
        <div className="group-content">
          <FormField label="Nickname">
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASNickname"
                placeholder="How should the AI address you?"
                onChange={handleChange}
                value={formData.GASNickname}
              />
            </div>
          </FormField>

          <FormField label="Occupation">
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASOccupation"
                placeholder="e.g., Senior Frontend Developer, Product Manager..."
                onChange={handleChange}
                value={formData.GASOccupation}
              />
            </div>
          </FormField>

          <FormField label="About You">
            <div className="control">
              <textarea
                className="textarea"
                name="GASAboutYou"
                placeholder="e.g., I work with React and TypeScript, prefer functional programming..."
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
          <strong>Better context = Better responses!</strong> The more details you provide, the more tailored the AI responses will be.
        </div>
      </div>
    </div>
  );
};

export default PersonalizationTab;
