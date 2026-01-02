/* eslint-disable jsx-a11y/anchor-is-valid */
import { AiBOT } from "../../utils/common";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faGears, faSignOut } from "@fortawesome/free-solid-svg-icons";

import logo from "../../assets/icons/icon48.png";
import { AI_EXT_STATUS } from "../../utils/constants";
import { openChromeSettingPage } from "../../utils";

const Header = (props: {
  signOut: any;
  isCopy: boolean;
  iisRef: any;
  setScreenName: any;
}) => {
  const { signOut, isCopy, iisRef, setScreenName } = props;

  const handleSignOut = (): void => {
    signOut();

    setScreenName(AI_EXT_STATUS.signin.code);
  };

  return (
    <nav className="has-background-white py-2 px-4 mb-4 is-flex is-justify-content-space-between is-align-items-center">
      <div className="navbar-brand">
        <a
          className="is-flex is-align-items-center"
          href={AiBOT.homepageURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={logo} alt={AiBOT.name} style={{ borderRadius: "50%" }} />
          <span className="has-text-grey-dark ml-2">{AiBOT.name}</span>
        </a>
      </div>

      <div className="is-flex">
        {isCopy && (
          <a
            className="navbar-item is-size-5 has-tooltip-arrow has-tooltip-info has-tooltip-left"
            data-tooltip="Copy it"
            onClick={() => navigator.clipboard.writeText(iisRef.innerText)}
          >
            <FontAwesomeIcon
              icon={faCopy}
              fontSize={"1rem"}
              color="#333333B2"
            />
          </a>
        )}

        <a
          className="navbar-item is-size-5 has-tooltip-arrow has-tooltip-info has-tooltip-left"
          data-tooltip="Open Settings Page"
          onClick={() => openChromeSettingPage()}
        >
          <FontAwesomeIcon icon={faGears} fontSize={"1rem"} color="#333333B2" />
        </a>

        <a
          className="navbar-item is-size-5 has-tooltip-arrow has-tooltip-info has-tooltip-left"
          data-tooltip="Sign Out"
          onClick={() => handleSignOut()}
        >
          <FontAwesomeIcon
            icon={faSignOut}
            fontSize={"1rem"}
            color="#333333B2"
          />
        </a>
      </div>
    </nav>
  );
};

export default Header;
