/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */

import logo from "../assets/icons/logo.svg";
import { AiBOT } from "../utils/common";

import { AI_EXT_STATUS, MESSAGES } from "../utils/constants";
import OrDivider from "./OrDivider";
import GoogleAuthentication from "./GoogleAuthentication";
import Footer from "../containers/app/Footer";
import { useState } from "react";
import { isEmail } from "../utils/tools";
import { setStorage } from "../utils";

const SignUp: React.FC<ScreenProps> = ({
  setScreenName,
  setErrorText,
  setUserAccessToken,
  setGoogleAccessToken,
}) => {
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string | undefined>(undefined);
  const [confirmPassword, setConfirmPassword] = useState<string | undefined>(
    undefined
  );
  const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false);

  const openPage = (screenName: string) => {
    setScreenName(screenName);
  };

  const handleSignUp = () => {
    const validations = [
      { condition: email === undefined, message: MESSAGES.missing_email },
      { condition: email && !isEmail(email), message: MESSAGES.invalid_email },
      { condition: password === undefined, message: MESSAGES.missing_password },
      {
        condition: password && password.length < 8,
        message: MESSAGES.invalid_password,
      },
      {
        condition: confirmPassword === undefined,
        message: MESSAGES.missing_confirm_password,
      },
      {
        condition: password !== confirmPassword,
        message: MESSAGES.password_not_match,
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
    <section className="section" style={{ height: "100%" }}>
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-one-third">
            <div
              className="box p-5 wrap-bg-color"
              style={{ borderRadius: "50px" }}
            >
              <div className="has-text-centered">
                <img
                  src={logo}
                  alt={AiBOT.name}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <h1 className="title has-text-centered has-text-white mt-5">
                {AI_EXT_STATUS.signup.text} to {AiBOT.name}
              </h1>

              <>
                <div className="field">
                  <input
                    className="input is-rounded is-medium"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="field">
                  <input
                    className="input is-rounded is-medium"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="field">
                  <input
                    className="input is-rounded is-medium"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="field mt-5">
                  <div className="control">
                    <label className="checkbox has-text-white">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={privacyPolicy}
                        onChange={(e) => setPrivacyPolicy(e.target.checked)}
                      />{" "}
                      I agree to {AiBOT.name}{" "}
                      <a
                        href="https://ekohe.github.io/GL-CoreAI/public/privacy.html"
                        style={{
                          textDecoration: "underline",
                          color: "#00cbc0",
                        }}
                        target="_blank"
                      >
                        Terms of Use, and Privacy Policy
                      </a>
                      .
                    </label>
                  </div>
                </div>

                <div className="field">
                  <div className="control">
                    <button
                      className="button is-fullwidth has-text-white btn-bg-color"
                      style={privacyPolicy ? {} : { opacity: "0.5" }}
                      onClick={() => privacyPolicy && handleSignUp()}
                    >
                      {AI_EXT_STATUS.signup.text}
                    </button>
                  </div>
                </div>

                <p className="has-text-centered has-text-white">
                  Already have an account
                  <a
                    onClick={() => openPage(AI_EXT_STATUS.signin.code)}
                    className="link-color"
                  >
                    {" "}
                    {AI_EXT_STATUS.signin.text}
                  </a>
                </p>
              </>

              <OrDivider />

              <GoogleAuthentication
                text={`${AI_EXT_STATUS.signup.text} with Google`}
                setGoogleAccessToken={setGoogleAccessToken}
                privacyPolicy={privacyPolicy}
                setErrorText={setErrorText}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default SignUp;
