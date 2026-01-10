/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";

import {
  getGoogleAccessToken,
  getGoogleTokenExpiry,
  getThemeType,
  getAppearance,
  getUserAccessToken,
  isTokenExpired,
  refreshGoogleToken,
} from "./../../utils";
import { initializeAppearance, applyAppearance } from "./../../utils/theme";

import Header from "./Header";
import Footer from "./Footer";

import SignIn from "../../components/SignIn";
import SignUp from "../../components/SignUp";
import AiSummarizer from "./AiSummarizer";
import AIInbox from "./AIInbox";
// SidePanelToggle functionality integrated directly

import { AI_EXT_STATUS } from "../../utils/constants";

import "./../../assets/styles/inject.css";
import ForgetPassword from "../../components/ForgetPassword";
import { toastMessage } from "../../utils/tools";

const storageGoogleAccessToken = await getGoogleAccessToken();
const storageGoogleTokenExpiry = await getGoogleTokenExpiry();
const storageUserAccessToken = await getUserAccessToken();
const themeType = await getThemeType();

// Initialize appearance mode
await initializeAppearance();

function AppIndex() {
  const issueDetailsRef = useRef(null);
  const [isCopy, setIsCopy] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<
    string | undefined
  >(undefined);
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>(
    undefined
  );

  const [screenName, setScreenName] = useState(AI_EXT_STATUS.signin.code);
  const [errorText, setErrorText] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (storageGoogleAccessToken && storageGoogleTokenExpiry) {
        if (isTokenExpired(storageGoogleTokenExpiry)) {
          try {
            const refreshedToken = await refreshGoogleToken();
            if (refreshedToken) {
              setGoogleAccessToken(refreshedToken);
            } else {
              // Refresh failed, redirect to sign-in
              chrome.storage.sync.remove(
                ["GASGoogleAccessToken", "GASGoogleTokenExpiry", "GASGoogleLastValidated"],
                () => {
                  setScreenName(AI_EXT_STATUS.signin.code);
                }
              );
            }
          } catch (error) {
            console.error("Error during token refresh:", error);
            setErrorText("Authentication expired. Please sign in again.");
            chrome.storage.sync.remove(
              ["GASGoogleAccessToken", "GASGoogleTokenExpiry", "GASGoogleLastValidated"],
              () => {
                setScreenName(AI_EXT_STATUS.signin.code);
              }
            );
          }
        } else {
          setGoogleAccessToken(storageGoogleAccessToken);
        }
      } else if (storageGoogleAccessToken) {
        setGoogleAccessToken(storageGoogleAccessToken);
      }
    };

    if (userAccessToken === undefined && storageUserAccessToken !== undefined) {
      setUserAccessToken(storageUserAccessToken);
    }

    checkAndRefreshToken();
  }, []);

  useEffect(() => {
    if (googleAccessToken !== undefined || userAccessToken !== undefined) {
      setScreenName(AI_EXT_STATUS.summarizer.code);
    }
  }, [googleAccessToken, userAccessToken]);

  useEffect(() => {
    if (errorText !== "") toastMessage(errorText, "is-danger");
    if (messageText !== "") toastMessage(messageText, "is-info");
  }, [errorText, messageText]);

  const signOut = (): void => {
    chrome.storage.sync.remove(
      ["GASGoogleAccessToken", "GASGoogleTokenExpiry", "GASGoogleLastValidated", "GASUserAccessToken"],
      () => {
        setGoogleAccessToken(undefined);
        setUserAccessToken(undefined);
      }
    );
  };

  return (
    <div data-theme={themeType}>
      {screenName === AI_EXT_STATUS.signin.code && (
        <section
          className="is-info is-fullheight"
          style={{ height: "100vh" }}
        >
          <SignIn
            setScreenName={setScreenName}
            setErrorText={setErrorText}
            setUserAccessToken={setUserAccessToken}
            setGoogleAccessToken={setGoogleAccessToken}
          />
        </section>
      )}

      {screenName === AI_EXT_STATUS.signup.code && (
        <section
          className="is-info is-fullheight"
          style={{ height: "100vh" }}
        >
          <SignUp
            setScreenName={setScreenName}
            setErrorText={setErrorText}
            setUserAccessToken={setUserAccessToken}
            setGoogleAccessToken={setGoogleAccessToken}
          />
        </section>
      )}

      {screenName === AI_EXT_STATUS.forget_password.code && (
        <section
          className="is-info is-fullheight"
          style={{ height: "100vh" }}
        >
          <ForgetPassword
            setScreenName={setScreenName}
            setErrorText={setErrorText}
            setMessageText={setMessageText}
          />
        </section>
      )}

      {screenName === AI_EXT_STATUS.summarizer.code && (
        <>
          <Header
            signOut={signOut}
            isCopy={isCopy}
            iisRef={issueDetailsRef}
            setScreenName={setScreenName}
            currentScreen={screenName}
          />

          <AiSummarizer
            googleToken={googleAccessToken}
            userAccessToken={userAccessToken}
            setIsCopy={setIsCopy}
            setScreenName={setScreenName}
            setGoogleAccessToken={setGoogleAccessToken}
            setUserAccessToken={setUserAccessToken}
            setErrorText={setErrorText}
            iisRef={issueDetailsRef}
          />

          <Footer />
        </>
      )}

      {screenName === AI_EXT_STATUS.ai_inbox.code && (
        <>
          <Header
            signOut={signOut}
            isCopy={isCopy}
            iisRef={issueDetailsRef}
            setScreenName={setScreenName}
            currentScreen={screenName}
          />

          <div
            className="container"
            style={{
              height: "calc(-120px + 100vh)",
              width: "100%",
              maxWidth: "100%",
              backgroundColor: "white",
              overflowY: "auto",
            }}
          >
            <AIInbox onBack={() => setScreenName(AI_EXT_STATUS.summarizer.code)} />
          </div>

          <Footer />
        </>
      )}
    </div>
  );
}

export default AppIndex;
