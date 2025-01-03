/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from "../assets/icons/logo.svg";
import { AiBOT } from "../utils/common";
import { AI_EXT_STATUS, MESSAGES } from "../utils/constants";
import OrDivider from "./OrDivider";
import { useState } from "react";
import Footer from "../containers/app/Footer";
import { isEmail } from "../utils/tools";

const ForgetPassword: React.FC<ScreenProps> = ({
  setScreenName,
  setErrorText,
  setMessageText,
}) => {
  const [email, setEmail] = useState<string | undefined>(undefined);

  const openPage = (screenName: string) => {
    setScreenName(screenName);
  };

  const handleForgetPassword = () => {
    const validations = [
      { condition: email === undefined, message: MESSAGES.missing_email },
      { condition: email && !isEmail(email), message: MESSAGES.invalid_email },
    ];

    const hasError = validations.some(({ condition, message }) => {
      if (condition) {
        setErrorText(message);
        return true;
      }
      return false;
    });

    if (!hasError) {
      setScreenName(AI_EXT_STATUS.signin.code);
      setMessageText?.(MESSAGES.reset_password);
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
                Forgot your Password?
              </h1>
              <p className="subtitle has-text-left has-text-white mt-5">
                We’ll email you a secure link to reset your password
              </p>

              <>
                <div className="field" style={{ marginTop: "2rem" }}>
                  <input
                    className="input is-rounded is-medium"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="field" style={{ marginTop: "4rem" }}>
                  <div className="control">
                    <button
                      className="button is-fullwidth has-text-white btn-bg-color"
                      onClick={() => handleForgetPassword()}
                    >
                      {AI_EXT_STATUS.reset_password.text}
                    </button>
                  </div>
                </div>
              </>

              <OrDivider />

              <p className="has-text-centered has-text-white">
                <a
                  onClick={() => openPage(AI_EXT_STATUS.signin.code)}
                  className="link-color"
                >
                  {AI_EXT_STATUS.signin.text}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
};

export default ForgetPassword;
