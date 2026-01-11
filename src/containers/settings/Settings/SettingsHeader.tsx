import { AiBOT } from "../../../utils/common";
import logoBrand from "../../../assets/icons/logo-brand.png";
import manifest from "../../../resources/manifest.json";
import { useLanguage } from "../../../contexts/LanguageContext";

/**
 * Settings page header with logo and description
 */
const SettingsHeader = () => {
  const { t } = useLanguage();

  return (
    <header className="settings-header">
      <div className="header-content">
        <a
          href={AiBOT.homepageURL}
          target="_blank"
          rel="noopener noreferrer"
          className="logo-link"
        >
          <img
            src={logoBrand}
            alt={AiBOT.name}
            className="logo-image"
          />
        </a>
        <div className="header-info">
          <h1 className="app-name">{manifest.name}</h1>
          <p className="app-description">{t("header.description")}</p>
          <span className="app-version">v{manifest.version}</span>
        </div>
      </div>
    </header>
  );
};

export default SettingsHeader;
