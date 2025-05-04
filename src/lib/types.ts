
export type User = {
  id: string;
  username: string;
  role: 'admin' | 'user';
};

export type ProjectStatus = 
  | 'active' 
  | 'completed' 
  | 'archived' 
  | 'income' 
  | 'no-income'
  | 'on-hold';

// Changed to string to allow custom text
export type SecondaryStatus = string;

export type Department = 'present' | 'future';

export type CustomField = {
  id: string;
  name: string;
  value: string;
};

export type ImportantLink = {
  id: string;
  title: string;
  url: string;
  description?: string;
};

export type Comment = {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: string;
  reactions?: { [key: string]: number };
};

export type Project = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  department: Department;
  status: ProjectStatus;
  secondaryStatus?: SecondaryStatus;
  goal?: string;
  githubUrl?: string;
  requirements?: string;
  inventory?: string[];
  customFields: CustomField[];
  importantLinks?: ImportantLink[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
};

export type AppData = {
  projects: Project[];
};

export type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

export type ProjectContextType = {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addComment: (projectId: string, text: string) => void;
  deleteComment: (projectId: string, commentId: string) => void;
  updateComment: (projectId: string, commentId: string, text: string) => void;
  addReaction: (projectId: string, commentId: string, emoji: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
};

export type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};
