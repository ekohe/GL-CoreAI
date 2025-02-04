/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getGoogleAccount } from "../../utils";
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
          const result = await getGoogleAccount(googleToken);

          if (result.error) {
            setErrorText(result.error.message);

            chrome.storage.sync.remove(["GASGoogleAccessToken"], () => {
              setGoogleAccessToken(undefined);
            });
          } else {
            setData(result); // Update the state with the fetched data
          }
        } catch (err: any) {
          setErrorText(err.message); // Handle error

          chrome.storage.sync.remove(["GASGoogleAccessToken"], () => {
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
