import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { launchGoogleAuthentication } from "../utils";

const GoogleAuthentication = (props: {
  text: string;
  setGoogleAccessToken: any;
  privacyPolicy: boolean;
}) => {
  const { text, setGoogleAccessToken, privacyPolicy } = props;
  const backgroundColor = privacyPolicy ? "#00cbc0" : "#f9f7f9";
  const borderColor = privacyPolicy ? "#00cbc0" : "#000000";
  const primaryColor = privacyPolicy ? "has-text-white" : "has-text-black";

  return (
    <div className="field mb-5">
      <div className="control m-6">
        <button
          className={`button is-fullwidth is-large ${primaryColor}`}
          style={{
            background: backgroundColor,
            borderColor: borderColor,
            borderRadius: "0px",
            fontWeight: "bold",
          }}
          onClick={(e) =>
            privacyPolicy && launchGoogleAuthentication(e, setGoogleAccessToken)
          }
        >
          <span className="icon">
            <FontAwesomeIcon icon={faGoogle} />
          </span>
          <span>{text}</span>
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthentication;
