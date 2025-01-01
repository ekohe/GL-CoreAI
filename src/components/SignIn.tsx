/* eslint-disable jsx-a11y/anchor-is-valid */
import logo from "../assets/icons/logo.png";
import { AiBOT } from "../utils/common";
import { AI_EXT_STATUS } from "../utils/constants";
import GoogleAuthentication from "./GoogleAuthentication";
import Footer from "../containers/app/Footer";
import { useState } from "react";

const SignIn: React.FC<ScreenProps> = ({
  setGoogleAccessToken,
}) => {
  const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false);

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
