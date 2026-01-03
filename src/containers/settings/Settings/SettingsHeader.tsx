import { AiBOT } from "../../../utils/common";
import logoBrand from "../../../assets/icons/logo-brand.png";

/**
 * Settings page header with logo
 */
const SettingsHeader = () => {
  return (
    <div className="has-text-left">
      <a
        href={AiBOT.homepageURL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={logoBrand}
          alt={AiBOT.name}
          style={{
            height: "64px",
            marginTop: "24px",
            marginBottom: "12px",
          }}
        />
      </a>
    </div>
  );
};

export default SettingsHeader;

