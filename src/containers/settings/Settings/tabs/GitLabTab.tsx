import { useFormContext } from "../../../../contexts/FormContext";
import FormField from "../FormField";

const GitLabTab = () => {
  const { formData, handleChange } = useFormContext();

  return (
    <div className="tab-content-section">
      <div className="section-header">
        <h2 className="section-title">GitLab Configuration</h2>
        <p className="section-description">
          Configure your GitLab instance connection settings
        </p>
      </div>

      <div className="settings-group">
        <div className="group-title">
          <span className="group-icon">🔗</span>
          Connection
        </div>
        <div className="group-content">
          <FormField label="Web URL">
            <div className="control">
              <input
                className="input"
                type="text"
                name="GASGitLab"
                placeholder="Auto-detected from GitLab page"
                onChange={handleChange}
                value={formData.GASGitLab}
                readOnly
              />
            </div>
          </FormField>

          <FormField label="API Version">
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
          <strong>Note:</strong> The GitLab URL is automatically detected when you visit a GitLab page.
        </div>
      </div>
    </div>
  );
};

export default GitLabTab;
