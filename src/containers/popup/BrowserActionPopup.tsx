/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  getGoogleAccessToken,
  getGoogleAccount,
  getUserAccessToken,
  openChromeSettingPage,
  getThemeType,
} from "../../utils";
import { AiBOT } from "../../utils/common";

// Icons
import logoBrand from "../../assets/icons/logo-brand.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCog, faBuilding, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

interface UserInfo {
  name?: string;
  email?: string;
  picture?: string;
}

function BrowserActionPopup() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [themeType, setThemeType] = useState<string>("light");

  useEffect(() => {
    loadUserData();
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const theme = await getThemeType();
    setThemeType(theme || "light");
  };

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated via Google or custom auth
      const googleToken = await getGoogleAccessToken();
      const userToken = await getUserAccessToken();

      if (googleToken) {
        // Get Google user info
        const googleUserData = await getGoogleAccount(googleToken);
        setUserInfo({
          name: googleUserData.name,
          email: googleUserData.email,
          picture: googleUserData.picture,
        });
        setIsAuthenticated(true);
      } else if (userToken) {
        // User authenticated via custom system (no detailed user info available)
        setUserInfo({
          name: "User",
          email: "Authenticated User",
        });
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsClick = () => {
    openChromeSettingPage();
    window.close(); // Close popup after opening settings
  };

  const handleSignOut = () => {
    chrome.storage.sync.remove(
      ["GASGoogleAccessToken", "GASGoogleTokenExpiry", "GASGoogleLastValidated", "GASUserAccessToken"],
      () => {
        setUserInfo(null);
        setIsAuthenticated(false);
        // Optionally reload or redirect to sign in
        window.close();
      }
    );
  };

  const handleOpenApp = async () => {
    try {
      // Get the current window
      const currentWindow = await chrome.windows.getCurrent();
      if (currentWindow.id) {
        // Open the side panel
        chrome.sidePanel.open({ windowId: currentWindow.id });
      }
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
    window.close();
  };

  if (loading) {
    return (
      <div className="popup-container" data-theme={themeType}>
        <article className="message is-info">
          <div className="message-body has-text-centered">
            <div className="loader"></div>
            <p className="mt-2">Loading...</p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="popup-container" data-theme={themeType}>
      {/* Header */}
      <div className="popup-header">
        <div className="level is-mobile">
          <div className="level-left">
            <div className="level-item">
              <img src={logoBrand} alt={AiBOT.name} className="popup-logo" />
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <button
                className="button is-small is-ghost"
                onClick={handleSettingsClick}
                title="Settings"
              >
                <FontAwesomeIcon icon={faCog} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="popup-content">
        {isAuthenticated && userInfo ? (
          <>
            {/* User Section */}
            <div className="user-section">
              <div className="media">
                <div className="media-left">
                  {userInfo.picture ? (
                    <figure className="image is-48x48">
                      <img className="is-rounded" src={userInfo.picture} alt="User Avatar" />
                    </figure>
                  ) : (
                    <div className="avatar-placeholder">
                      <FontAwesomeIcon icon={faUser} size="2x" />
                    </div>
                  )}
                </div>
                <div className="media-content">
                  <p className="title is-6">{userInfo.name || "User"}</p>
                  <p className="subtitle is-7">{userInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Company Section */}
            <div className="company-section">
              <div className="media">
                <div className="media-left">
                  <span className="icon is-large has-text-primary">
                    <FontAwesomeIcon icon={faBuilding} size="lg" />
                  </span>
                </div>
                <div className="media-content">
                  <p className="title is-6">{AiBOT.authorName}</p>
                  <p className="subtitle is-7">
                    <a
                      href={AiBOT.homepageURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="has-text-primary"
                    >
                      {AiBOT.homepageURL?.replace('https://', '')}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="button is-primary is-fullwidth mb-2"
                onClick={handleOpenApp}
              >
                <span className="icon">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <span>Open {AiBOT.name}</span>
              </button>

              <button
                className="button is-light is-fullwidth is-small"
                onClick={handleSignOut}
              >
                <span className="icon">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </span>
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          /* Not Authenticated */
          <div className="not-authenticated">
            <div className="has-text-centered mb-4">
              <span className="icon is-large has-text-grey-light">
                <FontAwesomeIcon icon={faUser} size="3x" />
              </span>
              <p className="title is-6 mt-2">Not Signed In</p>
              <p className="subtitle is-7">Sign in to use {AiBOT.name}</p>
            </div>

            <button
              className="button is-primary is-fullwidth mb-2"
              onClick={handleOpenApp}
            >
              <span>Open {AiBOT.name}</span>
            </button>

            <div className="company-info has-text-centered">
              <p className="is-size-7 has-text-grey">
                By <a
                  href={AiBOT.homepageURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="has-text-primary"
                >
                  {AiBOT.authorName}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="popup-footer">
        <p className="has-text-centered is-size-7 has-text-grey">
          v{AiBOT.version} • {AiBOT.authorEmail}
        </p>
      </div>
    </div>
  );
}

export default BrowserActionPopup;
