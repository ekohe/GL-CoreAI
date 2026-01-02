import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import { launchGoogleAuthentication } from "../utils";

const GoogleAuthentication = (props: {
  text: string;
  setGoogleAccessToken: any;
  privacyPolicy: boolean;
  setErrorText?: (error: string) => void;
}) => {
  const { text, setGoogleAccessToken, privacyPolicy, setErrorText } = props;
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  return (
    <div className="field mb-5">
      <div className="control m-6">
        <button
          className={`button is-fullwidth is-large has-text-white ${isAuthenticating ? 'is-loading' : ''}`}
          style={{
            background: "#00cbc0",
            borderColor: "#00cbc0",
            borderRadius: "0px",
            fontWeight: "bold",
          }}
          disabled={!privacyPolicy || isAuthenticating}
          onClick={(e) =>
            privacyPolicy && !isAuthenticating && launchGoogleAuthentication(e, setGoogleAccessToken, setIsAuthenticating, setErrorText)
          }
        >
          {!isAuthenticating && (
            <span className="icon">
              <FontAwesomeIcon icon={faGoogle} />
            </span>
          )}
          <span style={{ fontSize: "1.1rem" }}>
            {isAuthenticating ? "Authenticating..." : text}
          </span>
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthentication;
