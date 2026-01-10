import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faRobot,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faGitlab, faSlack } from "@fortawesome/free-brands-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type SettingsTab = "general" | "gitlab" | "ai-provider" | "personalization" | "slack";

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: IconDefinition;
  description: string;
}

const TABS: TabItem[] = [
  {
    id: "general",
    label: "General",
    icon: faCog,
    description: "Appearance & Language",
  },
  {
    id: "gitlab",
    label: "GitLab",
    icon: faGitlab,
    description: "GitLab connection settings",
  },
  {
    id: "ai-provider",
    label: "AI Provider",
    icon: faRobot,
    description: "AI model & API configuration",
  },
  {
    id: "personalization",
    label: "Personalization",
    icon: faUser,
    description: "Custom preferences & profile",
  },
  {
    id: "slack",
    label: "Slack",
    icon: faSlack,
    description: "Slack webhook integration",
  },
];

interface TabNavigationProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <nav className="settings-tab-nav">
      <div className="tab-nav-header">
        <span className="nav-title">Settings</span>
      </div>
      <ul className="tab-list">
        {TABS.map((tab) => (
          <li key={tab.id}>
            <button
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              <span className="tab-icon">
                <FontAwesomeIcon icon={tab.icon} />
              </span>
              <span className="tab-content">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TabNavigation;
