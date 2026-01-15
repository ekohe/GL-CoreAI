import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faRobot,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faGitlab, faSlack } from "@fortawesome/free-brands-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useLanguage } from "../../../../contexts/LanguageContext";

export type SettingsTab = "general" | "gitlab" | "ai-provider" | "personalization" | "slack";

interface TabItem {
  id: SettingsTab;
  labelKey: string;
  icon: IconDefinition;
  descriptionKey: string;
}

const TABS: TabItem[] = [
  {
    id: "general",
    labelKey: "tabs.general",
    icon: faCog,
    descriptionKey: "tabs.generalDesc",
  },
  {
    id: "personalization",
    labelKey: "tabs.personalization",
    icon: faUser,
    descriptionKey: "tabs.personalizationDesc",
  },
  {
    id: "gitlab",
    labelKey: "tabs.gitlab",
    icon: faGitlab,
    descriptionKey: "tabs.gitlabDesc",
  },
  {
    id: "ai-provider",
    labelKey: "tabs.aiProvider",
    icon: faRobot,
    descriptionKey: "tabs.aiProviderDesc",
  },
  {
    id: "slack",
    labelKey: "tabs.slack",
    icon: faSlack,
    descriptionKey: "tabs.slackDesc",
  },
];

interface TabNavigationProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const { t } = useLanguage();

  return (
    <nav className="settings-tab-nav">
      <div className="tab-nav-header">
        <span className="nav-title">{t("tabs.settings")}</span>
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
                <span className="tab-label">{t(tab.labelKey)}</span>
                <span className="tab-description">{t(tab.descriptionKey)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TabNavigation;
