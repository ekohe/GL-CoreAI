declare module "lodash/debounce";

// Define the props interface to include the setScreenName function
interface ScreenProps {
  setScreenName: (name: string) => void;
  setErrorText: (name: string) => void;
  setMessageText?: (name: string) => void;
  setUserAccessToken?: (name: string) => void;
  setGoogleAccessToken?: (name: string) => void;
}

type PlainObjectType = {
  [index: string]: any;
};

type IssueType = {
  id: number;
  iid: number;
  project_id: number;
  type: string;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  labels: string[];
  author: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  };
  assignee: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  };
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  due_date: string;
  web_url: string;
  closed_at: string;
  closed_by: string;
  task_status?: string;
  issue_type?: string;
  severity?: string;
  links?: any;
};

type ProjectType = {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  default_branch: string;
  created_at: string;
  tag_list: string[];
  topic: string[];
  description: string;
  web_url: string;
  readme_url: string;
  avatar_url: string;
  last_activity_at: string;
  open_issues_count: number;
  star_count: number;
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    parent_id: number;
    avatar_url: string;
    web_url: string;
  };
};

type UserType = {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  web_url: string;
};

type EventType = {
  id: number;
  project_id: number;
  action_name: string;
  target_id: number;
  target_iid: number;
  target_type: string;
  author_id: number;
  target_title: string;
  created_at: string;
  note: {
    id: number;
    type: string;
    body: string;
    created_at: string;
    updated_at: string;
    noteable_id: number;
    noteable_iid: number;
    noteable_type: string;
    author: {
      id: number;
      username: string;
      name: string;
      state: string;
      avatar_url: string;
      web_url: string;
    };
  };
  author: {
    id: number;
    username: string;
    name: string;
    state: string;
    locked: boolean;
    avatar_url: string;
    web_url: string;
  };
  push_data: {
    action: string;
    ref_type: string;
    ref: string;
    commit_title: string;
  };
  author_username: string;
};

type AccountType = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture?: string;
};
