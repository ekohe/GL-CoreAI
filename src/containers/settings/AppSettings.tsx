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
      style={{background:'#F9F7F9'}}
    >
      {tab === 'settings' && <Settings />}
    </section>
  );
}

export default AppSettings;
