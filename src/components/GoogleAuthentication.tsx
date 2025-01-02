import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { launchGoogleAuthentication } from "../utils";

const GoogleAuthentication = (props: {
  text: string;
  setGoogleAccessToken: any;
  privacyPolicy: boolean;
}) => {
  const { text, setGoogleAccessToken, privacyPolicy } = props;

  return (
    <div className="field mb-5">
      <div className="control m-6">
        <button
          className={`button is-fullwidth is-large has-text-white`}
          style={{
            background: "#00cbc0",
            borderColor: "#00cbc0",
            borderRadius: "0px",
            fontWeight: "bold",
          }}
          disabled={!privacyPolicy}
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
