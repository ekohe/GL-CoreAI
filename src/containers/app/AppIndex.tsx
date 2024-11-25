/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';

import { getGoogleAccessToken, getThemeType, getUserAccessToken } from './../../utils';

import Header from './Header';
import Footer from './Footer';

import SignIn from '../../components/SignIn';
import SignUp from '../../components/SignUp';
import AiSummarizer from './AiSummarizer';

import { AI_EXT_STATUS } from '../../utils/constants';

import './../../assets/styles/inject.css';
import ForgetPassword from '../../components/ForgetPassword';
import { toastMessage } from '../../utils/tools';

const storageGoogleAccessToken = await getGoogleAccessToken();
const storageUserAccessToken = await getUserAccessToken();
const themeType = await getThemeType();

function AppIndex() {
  const issueDetailsRef = useRef(null);
  const [isCopy, setIsCopy] = useState(false);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | undefined>(undefined);
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>(undefined);

  const [screenName, setScreenName] = useState(AI_EXT_STATUS.signin.code);
  const [errorText, setErrorText] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (googleAccessToken === undefined && storageGoogleAccessToken !== undefined) {
      setGoogleAccessToken(storageGoogleAccessToken);
    }

    if (userAccessToken === undefined && storageUserAccessToken !== undefined) {
      setUserAccessToken(storageUserAccessToken);
    }
  }, []);

  useEffect(() => {
    if (googleAccessToken !== undefined || userAccessToken !== undefined) {
      setScreenName(AI_EXT_STATUS.summarizer.code);
    }
  }, [googleAccessToken, userAccessToken]);

  useEffect(() => {
    if (errorText !== '') toastMessage(errorText, 'is-danger')
    if (messageText !== '') toastMessage(messageText, 'is-info')
  }, [errorText, messageText]);

  const signOut = (): void => {
    chrome.storage.sync.remove(["GASGoogleAccessToken", "GASUserAccessToken"], () => {
      setGoogleAccessToken(undefined);
      setUserAccessToken(undefined);
    });
  }

  return (
    <div data-theme={themeType}>
      {screenName === AI_EXT_STATUS.signin.code &&
        <section className="is-info is-fullheight">
          <SignIn
            setScreenName={setScreenName}
            setErrorText={setErrorText}
            setUserAccessToken={setUserAccessToken}
            setGoogleAccessToken={setGoogleAccessToken}
          />
        </section>
      }

      {screenName === AI_EXT_STATUS.signup.code &&
        <section className="is-info is-fullheight">
          <SignUp
            setScreenName={setScreenName}
            setErrorText={setErrorText}
            setUserAccessToken={setUserAccessToken}
            setGoogleAccessToken={setGoogleAccessToken}
          />
        </section>
      }

      {screenName === AI_EXT_STATUS.forget_password.code &&
        <section className="is-info is-fullheight">
          <ForgetPassword
            setScreenName={setScreenName}
            setErrorText={setErrorText}
            setMessageText={setMessageText}
          />
        </section>
      }

      {screenName === AI_EXT_STATUS.summarizer.code && <>
        <Header
          signOut={signOut}
          isCopy={isCopy}
          iisRef={issueDetailsRef}
          setScreenName={setScreenName}
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
      </>}
    </div>
  );
}

export default AppIndex;
