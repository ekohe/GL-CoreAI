/* eslint-disable jsx-a11y/anchor-is-valid */
import { useEffect, useState } from 'react';

import Settings from './Settings';
import { getStorage } from './../../utils';


function AppSettings() {
  const [tab, setTab] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');

  useEffect(() => {
    getStorage(["currentTab", "backgroundUrl"], result => {
      setTab(result.currentTab || 'settings');
      result.backgroundUrl && setBackgroundUrl(result.backgroundUrl);
    });
  }, []);

  return (
    <section
      className="hero is-info is-fullheight"
      style={
        backgroundUrl ? {
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          background: `linear-gradient(rgba(31, 44, 108, 0.65), rgba(31, 44, 108, 0.65)), rgba(0, 0, 0, 0.55) url("${backgroundUrl}") no-repeat`
        } : {}
      }
    >
      {tab === 'settings' && <Settings />}
    </section>
  );
}

export default AppSettings;
