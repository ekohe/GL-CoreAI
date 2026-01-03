/* eslint-disable react/jsx-no-target-blank */
import { AiBOT } from "../../../utils/common";
import { THEME_GRADIENTS } from "../../../utils/theme";

/**
 * Settings page footer with author info
 */
const SettingsFooter = () => {
  return (
    <article
      className="message has-text-centered has-text-white"
      style={{ marginBottom: "0px" }}
    >
      <div className="message-body" style={{ background: THEME_GRADIENTS.primary }}>
        <p>
          <strong>{AiBOT.name}</strong> is made by{" "}
          <a
            href={AiBOT.homepageURL}
            style={{ color: "white", textDecorationLine: "underline" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {AiBOT.authorName}
          </a>
          . If you have any ideas? Please contact via (
          <a
            href={`mailto:${AiBOT.authorEmail}`}
            style={{ color: "white", textDecorationLine: "underline" }}
          >
            {AiBOT.authorEmail}
          </a>
          ).
        </p>
      </div>
    </article>
  );
};

export default SettingsFooter;

