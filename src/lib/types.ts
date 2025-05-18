
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

// Изменено на строковый тип для пользовательского текста
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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

export type ProjectContextType = {
  projects: Project[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addComment: (projectId: string, text: string) => Promise<void>;
  deleteComment: (projectId: string, commentId: string) => Promise<void>;
  updateComment: (projectId: string, commentId: string, text: string) => Promise<void>;
  addReaction: (projectId: string, commentId: string, emoji: string) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (jsonData: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
};

export type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};
