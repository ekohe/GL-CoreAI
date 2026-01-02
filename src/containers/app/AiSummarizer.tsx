/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getGoogleAccount, getGoogleLastValidated, needsTokenValidation, setStorage } from "../../utils";
import GitLab from "./GitLab";

function AiSummarizer(porps: {
  googleToken: string | undefined;
  userAccessToken: string | undefined;
  setIsCopy: any;
  setScreenName: any;
  setGoogleAccessToken: any;
  setUserAccessToken: any;
  setErrorText: any;
  iisRef: any;
}) {
  const {
    googleToken,
    setIsCopy,
    setGoogleAccessToken,
    setErrorText,
    iisRef,
  } = porps;
  const [data, setData] = useState<AccountType | undefined>(undefined);

  useEffect(() => {
    if (googleToken !== undefined) {
      const fetchGoogleAccount = async () => {
        try {
          // Check if we need to validate the token (once every 30 days)
          const lastValidated = await getGoogleLastValidated();
          const shouldValidate = needsTokenValidation(lastValidated);

          if (!shouldValidate) {
            // Token was validated within the last 30 days, skip validation
            // Set mock data to allow app to proceed
            setData({ verified: true, skipValidation: true } as any);
            return;
          }

          const result = await getGoogleAccount(googleToken);

          if (result.error) {
            const errorMessage = result.error.message;
            console.error("Google API error:", errorMessage);

            if (errorMessage.includes("Invalid Credentials") || errorMessage.includes("unauthorized")) {
              setErrorText("Your authentication has expired. Please sign in again.");
            } else {
              setErrorText(`Authentication error: ${errorMessage}`);
            }

            chrome.storage.sync.remove(["GASGoogleAccessToken", "GASGoogleTokenExpiry", "GASGoogleLastValidated"], () => {
              setGoogleAccessToken(undefined);
            });
          } else {
            // Successful validation - update last validated timestamp
            setStorage({ GASGoogleLastValidated: Date.now() });
            setData(result); // Update the state with the fetched data
          }
        } catch (err: any) {
          console.error("Error fetching Google account:", err);

          // Enhanced error handling
          let errorMessage = "Authentication failed. Please try again.";
          if (err.message.includes("Token expired") || err.message.includes("Invalid token")) {
            errorMessage = "Your authentication has expired. Please sign in again.";
          } else if (err.message.includes("network") || err.message.includes("fetch")) {
            errorMessage = "Network error. Please check your connection and try again.";
          }

          setErrorText(errorMessage);

          chrome.storage.sync.remove(["GASGoogleAccessToken", "GASGoogleTokenExpiry", "GASGoogleLastValidated"], () => {
            setGoogleAccessToken(undefined);
          });
        }
      };

      fetchGoogleAccount();
    }
  }, [googleToken]);

  return (
    <div
      className="container p-5 m-4"
      style={{
        height: "calc(100vh - 150px)",
        width: "calc(100% - 2rem)",
        backgroundColor: "white",
        overflowY: "scroll",
      }}
    >
      {data && <GitLab setIsCopy={setIsCopy} iisRef={iisRef} />}
    </div>
  );
}

export default AiSummarizer;
