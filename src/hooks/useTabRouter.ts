import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TAB_TO_PATH: Record<string, string> = {
  dashboard: "/",
  documents: "/documents",
  employees: "/employees",
  analytics: "/analytics",
  history: "/history",
  folders: "/folders",
  "document-types": "/document-types",
  "professional-cards": "/professional-cards",
  agencies: "/agencies",
  roles: "/roles",
  permissions: "/permissions",
  workflow: "/workflow",
  chatbot: "/chatbot",
  notifications: "/notifications",
  trash: "/trash",
  "roles-permissions": "/roles-permissions",
  parameters: "/parameters",
  "activity-logs": "/activity-logs",
  administration: "/administration",
};

const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [path, tab])
);

export function useTabRouter(currentTab: string, setCurrentTab: (tab: string) => void) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = PATH_TO_TAB[location.pathname];
    if (tab && tab !== currentTab) {
      setCurrentTab(tab);
    }
  }, [location.pathname, currentTab, setCurrentTab]);

  const navigateToTab = (tab: string) => {
    setCurrentTab(tab);
    const path = TAB_TO_PATH[tab] ?? "/";
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return { navigateToTab };
}
