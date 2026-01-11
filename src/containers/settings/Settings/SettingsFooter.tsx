/* eslint-disable react/jsx-no-target-blank */
import { Trans } from "react-i18next";
import { AiBOT } from "../../../utils/common";
import { THEME_GRADIENTS } from "../../../utils/theme";

/**
 * Settings page footer with author info
 */
const SettingsFooter = () => {
  const linkStyle = { color: "white", textDecorationLine: "underline" as const };

  return (
    <footer className="settings-footer">
      <article
        className="message has-text-centered has-text-white"
        style={{ marginBottom: "0px" }}
      >
        <div className="message-body" style={{ background: THEME_GRADIENTS.primary }}>
          <p>
            <Trans
              i18nKey="footer.content"
              values={{
                name: AiBOT.name,
                author: AiBOT.authorName,
                email: AiBOT.authorEmail,
              }}
              components={[
                <strong key="name" />,
                <a
                  key="author"
                  href={AiBOT.homepageURL}
                  style={linkStyle}
                  target="_blank"
                  rel="noopener noreferrer"
                />,
                <a
                  key="email"
                  href={`mailto:${AiBOT.authorEmail}`}
                  style={linkStyle}
                />,
              ]}
            />
          </p>
        </div>
      </article>
    </footer>
  );
};

export default SettingsFooter;
