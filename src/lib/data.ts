
import { AppData, Project } from './types';

export const INITIAL_DATA: AppData = {
  projects: [
    {
      id: '1',
      title: 'Project Hub',
      emoji: '📊',
      description: 'A centralized platform to manage and track all Biamino projects.',
      department: 'present',
      status: 'active',
      githubUrl: 'https://github.com/biamino/project-hub',
      requirements: 'React, TypeScript, Tailwind CSS',
      inventory: ['MacBook Pro', 'Design Toolkit', 'Project Management Software'],
      customFields: [
        { id: 'cf1', name: 'Priority', value: 'High' },
        { id: 'cf2', name: 'Team Size', value: '4' }
      ],
      comments: [
        {
          id: 'c1',
          text: 'Design phase completed. Moving to development.',
          userId: 'admin',
          username: 'Administrator',
          createdAt: '2023-05-01T10:30:00Z',
          reactions: { '👍': 2, '🎉': 1 }
        }
      ],
      createdAt: '2023-04-15T08:00:00Z',
      updatedAt: '2023-05-01T10:30:00Z'
    },
    {
      id: '2',
      title: 'Marketing Website',
      emoji: '🌐',
      description: 'Official Biamino company website showcasing our services and portfolio.',
      department: 'present',
      status: 'income',
      githubUrl: 'https://github.com/biamino/website',
      requirements: 'Next.js, GSAP, Contentful CMS',
      inventory: ['Design Assets', 'Content Plan', 'SEO Strategy'],
      customFields: [
        { id: 'cf1', name: 'Launch Date', value: 'June 30, 2023' },
        { id: 'cf2', name: 'Budget', value: '$12,000' }
      ],
      comments: [],
      createdAt: '2023-03-10T09:15:00Z',
      updatedAt: '2023-03-10T09:15:00Z'
    },
    {
      id: '3',
      title: 'Mobile App',
      emoji: '📱',
      description: 'Cross-platform mobile application for Biamino customers.',
      department: 'future',
      status: 'on-hold',
      requirements: 'React Native, Firebase, Redux',
      inventory: ['UI/UX Designs', 'API Documentation'],
      customFields: [
        { id: 'cf1', name: 'Planned Start', value: 'Q3 2023' }
      ],
      comments: [
        {
          id: 'c1',
          text: 'We should consider using Expo for faster development.',
          userId: 'user1',
          username: 'ProjectManager',
          createdAt: '2023-05-02T14:20:00Z'
        }
      ],
      createdAt: '2023-04-28T11:45:00Z',
      updatedAt: '2023-05-02T14:20:00Z'
    },
    {
      id: '4',
      title: 'Data Analytics Dashboard',
      emoji: '📈',
      description: 'Internal tool for visualizing company performance metrics.',
      department: 'future',
      status: 'no-income',
      requirements: 'Vue.js, D3.js, Node.js',
      inventory: ['Data Schema', 'Wireframes'],
      customFields: [],
      comments: [],
      createdAt: '2023-05-05T10:00:00Z',
      updatedAt: '2023-05-05T10:00:00Z'
    },
    {
      id: '5',
      title: 'Legacy CRM Integration',
      emoji: '🔄',
      description: 'Integration with legacy customer relationship management systems.',
      department: 'present',
      status: 'completed',
      githubUrl: 'https://github.com/biamino/crm-integration',
      requirements: 'PHP, MySQL, REST API',
      inventory: ['API Keys', 'Documentation', 'Test Environment'],
      customFields: [
        { id: 'cf1', name: 'Client', value: 'XYZ Corp' }
      ],
      comments: [
        {
          id: 'c1',
          text: 'Successfully integrated with all client systems.',
          userId: 'admin',
          username: 'Administrator',
          createdAt: '2023-04-10T16:30:00Z'
        }
      ],
      createdAt: '2023-02-15T08:30:00Z',
      updatedAt: '2023-04-10T16:30:00Z'
    },
    {
      id: '6',
      title: 'AI Research Tool',
      emoji: '🧠',
      description: 'AI-powered research assistant for market analysis.',
      department: 'future',
      status: 'active',
      requirements: 'Python, TensorFlow, OpenAI API',
      inventory: ['Research Papers', 'Dataset Access'],
      customFields: [
        { id: 'cf1', name: 'Research Lead', value: 'Dr. Smith' }
      ],
      comments: [],
      createdAt: '2023-05-08T09:00:00Z',
      updatedAt: '2023-05-08T09:00:00Z'
    }
  ]
};

// Function to get initial data from localStorage or use defaults
export const getInitialData = (): AppData => {
  const savedData = localStorage.getItem('biamino-data');
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error('Failed to parse stored data:', error);
      return INITIAL_DATA;
    }
  }
  return INITIAL_DATA;
};

// Function to save data to localStorage
export const saveData = (data: AppData): void => {
  localStorage.setItem('biamino-data', JSON.stringify(data));
};
