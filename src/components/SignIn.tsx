/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from "../assets/icons/logo.png";
import { AiBOT } from "../utils/common";
import { AI_EXT_STATUS, MESSAGES } from "../utils/constants";
import OrDivider from "./OrDivider";
import GoogleAuthentication from "./GoogleAuthentication";
import Footer from "../containers/app/Footer";
import { useState } from "react";
import { isEmail } from "../utils/tools";
import { setStorage } from "../utils";

const SignIn: React.FC<ScreenProps> = ({
  setScreenName,
  setErrorText,
  setUserAccessToken,
  setGoogleAccessToken,
}) => {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false);

  const openPage = (screenName: string) => {
    setScreenName(screenName);
  };

  const handleSignIn = () => {
    const validations = [
      { condition: email === undefined, message: MESSAGES.missing_email },
      { condition: email && !isEmail(email), message: MESSAGES.invalid_email },
      { condition: password === undefined, message: MESSAGES.missing_password },
      {
        condition: password && password.length < 8,
        message: MESSAGES.invalid_password,
      },
    ];

    const hasError = validations.some(({ condition, message }) => {
      if (condition) {
        setErrorText(message);
        return true;
      }
      return false;
    });

    if (!hasError) {
      const newUserToken = "userToken";

      setStorage({ GASUserAccessToken: newUserToken }, () => {
        setUserAccessToken?.(newUserToken);
      });
    }
  };

  return (
    <section className="section" style={{ display: "flex" }}>
      <div className="columns is-centered" style={{ margin: "auto" }}>
        <div className="has-text-centered">
          <img src={logo} alt={AiBOT.name} style={{ borderRadius: "50%" }} />
        </div>
        <h1 className="title has-text-centered has-text-black mt-5">
          Welcome to {AiBOT.name}
        </h1>

        <GoogleAuthentication
          text={`${AI_EXT_STATUS.signin.text} with Google`}
          setGoogleAccessToken={setGoogleAccessToken}
        />

        <div className="field mt-5">
          <div className="control">
            <label className="checkbox has-text-black">
              <input
                type="checkbox"
                checked={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.checked)}
              />{" "}
              I agree to {AiBOT.name}{" "}
              <a href="#" className="link-color">
                Terms of Use, and Privacy Policy
              </a>
              .
            </label>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SignIn;
