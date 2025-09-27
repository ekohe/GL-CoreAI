/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from "../assets/icons/logo.svg";
import { AiBOT } from "../utils/common";
import { AI_EXT_STATUS } from "../utils/constants";
import GoogleAuthentication from "./GoogleAuthentication";
import Footer from "../containers/app/Footer";
import { useState } from "react";

const SignIn: React.FC<ScreenProps> = ({ setGoogleAccessToken }) => {
  const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false);

  return (
    <section className="section" style={{ display: "flex" }}>
      <div className="columns is-centered" style={{ margin: "auto" }}>
        <div className="has-text-centered">
          <img
            src={logo}
            alt={AiBOT.name}
            style={{ borderRadius: "50%", height: "200px" }}
          />
        </div>

        <GoogleAuthentication
          text={`${AI_EXT_STATUS.signin.text} with Google`}
          setGoogleAccessToken={setGoogleAccessToken}
          privacyPolicy={privacyPolicy}
        />

        <div className="field mt-5">
          <div className="control m-5">
            <label
              className="checkbox has-text-black"
              style={{ fontSize: "20px" }}
            >
              <input
                type="checkbox"
                checked={privacyPolicy}
                style={{ marginRight: "10px" }}
                onChange={(e) => setPrivacyPolicy(e.target.checked)}
              />{" "}
              I agree to {AiBOT.name}{" "}
              <a
                href="https://ekohe.github.io/GL-CoreAI/public/privacy.html"
                style={{ textDecoration: "underline", color: "#00cbc0" }}
                target="_blank"
              >
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
