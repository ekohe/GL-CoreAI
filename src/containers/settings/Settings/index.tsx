/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";

import SettingsHeader from "./SettingsHeader";
import SettingsFooter from "./SettingsFooter";
import {
  TabNavigation,
  GeneralTab,
  GitLabTab,
  AIProviderTab,
  PersonalizationTab,
  SlackTab,
  type SettingsTab,
} from "./tabs";

function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab />;
      case "gitlab":
        return <GitLabTab />;
      case "ai-provider":
        return <AIProviderTab />;
      case "personalization":
        return <PersonalizationTab />;
      case "slack":
        return <SlackTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className="settings-layout">
      <SettingsHeader />

      <div className="settings-container">
        <aside className="settings-sidebar">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        <main className="settings-main">
          <div className="settings-content">
            {renderTabContent()}
          </div>
        </main>
      </div>

      <SettingsFooter />
    </div>
  );
}

export default Settings;
