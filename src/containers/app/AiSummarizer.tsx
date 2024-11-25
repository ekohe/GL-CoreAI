/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { getGoogleAccount, getUserAccount } from "../../utils";
import GitLab from "./GitLab";

function AiSummarizer(porps: {
  googleToken: string | undefined,
  userAccessToken: string | undefined,
  setIsCopy: any,
  setScreenName: any,
  setGoogleAccessToken: any,
  setUserAccessToken: any,
  setErrorText: any,
  iisRef: any
}) {
  const { googleToken, userAccessToken, setIsCopy, setGoogleAccessToken, setUserAccessToken, setErrorText, iisRef } = porps;
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

      fetchGoogleAccount()
    }

    if (userAccessToken !== undefined) {
      const fetchUserAccount = async () => {
        try {
          const result = await getUserAccount(userAccessToken);

          setData(result);
        } catch (err: any) {
          setErrorText(err.message); // Handle error
          setUserAccessToken(undefined);

          chrome.storage.sync.remove(["GASUserAccessToken"], () => {
            setUserAccessToken(undefined);
          });
        }
      };

      fetchUserAccount()
    }
  }, [googleToken, userAccessToken]);

  return (
    <div
      className="container m-3 p-3"
      style={{
        height: "calc(100vh - 133px)",
        width: "95%",
        backgroundColor: 'white',
        overflowY: 'scroll'
      }}
    >
      {data && <GitLab setIsCopy={setIsCopy} iisRef={iisRef} />}
    </div>
  );
}

export default AiSummarizer;
