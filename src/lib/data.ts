
import { AppData, Project } from './types';

export const INITIAL_DATA: AppData = {
  projects: [
    {
      id: '1',
      title: 'Проектный Хаб',
      emoji: '📊',
      description: 'Централизованная платформа для управления и отслеживания всех проектов Biamino.',
      department: 'present',
      status: 'active',
      secondaryStatus: 'В разработке',
      goal: 'Создать единую систему для мониторинга статуса проекта и обмена информацией между командами',
      githubUrl: 'https://github.com/biamino/project-hub',
      requirements: 'React, TypeScript, Tailwind CSS',
      inventory: ['MacBook Pro', 'Набор дизайнера', 'ПО для управления проектами'],
      customFields: [
        { id: 'cf1', name: 'Приоритет', value: 'Высокий' },
        { id: 'cf2', name: 'Размер команды', value: '4' }
      ],
      importantLinks: [
        { 
          id: 'il1', 
          title: 'Макеты дизайна', 
          url: 'https://figma.com/file/project-hub', 
          description: 'UI/UX дизайны для интерфейса проектного хаба' 
        },
        {
          id: 'il2',
          title: 'API Документация',
          url: 'https://docs.projecthub.com/api',
          description: 'Спецификации REST API'
        }
      ],
      comments: [
        {
          id: 'c1',
          text: 'Фаза проектирования завершена. Переходим к разработке.',
          userId: 'admin',
          username: 'Администратор',
          createdAt: '2023-05-01T10:30:00Z',
          reactions: { '👍': 2, '🎉': 1 }
        }
      ],
      createdAt: '2023-04-15T08:00:00Z',
      updatedAt: '2023-05-01T10:30:00Z'
    },
    {
      id: '2',
      title: 'Маркетинговый сайт',
      emoji: '🌐',
      description: 'Официальный сайт компании Biamino, демонстрирующий наши услуги и портфолио.',
      department: 'present',
      status: 'income',
      secondaryStatus: 'На рассмотрении',
      goal: 'Создать привлекательное онлайн-присутствие для привлечения новых клиентов и демонстрации нашей работы',
      githubUrl: 'https://github.com/biamino/website',
      requirements: 'Next.js, GSAP, Contentful CMS',
      inventory: ['Дизайн-ассеты', 'План контента', 'SEO стратегия'],
      customFields: [
        { id: 'cf1', name: 'Дата запуска', value: '30 июня, 2023' },
        { id: 'cf2', name: 'Бюджет', value: '12 000 $' }
      ],
      importantLinks: [
        {
          id: 'il1',
          title: 'Календарь контента',
          url: 'https://notion.so/biamino/content-calendar',
          description: 'Расписание публикаций блога и план контента'
        }
      ],
      comments: [],
      createdAt: '2023-03-10T09:15:00Z',
      updatedAt: '2023-03-10T09:15:00Z'
    },
    {
      id: '3',
      title: 'Мобильное приложение',
      emoji: '📱',
      description: 'Кросс-платформенное мобильное приложение для клиентов Biamino.',
      department: 'future',
      status: 'on-hold',
      secondaryStatus: 'Планирование',
      goal: 'Разработать мобильное приложение, позволяющее клиентам отслеживать свои проекты в пути',
      requirements: 'React Native, Firebase, Redux',
      inventory: ['UI/UX Дизайны', 'API Документация'],
      customFields: [
        { id: 'cf1', name: 'Планируемый старт', value: 'Q3 2023' }
      ],
      importantLinks: [
        {
          id: 'il1',
          title: 'Исследование рынка',
          url: 'https://drive.google.com/file/market-research',
          description: 'Анализ конкурентов и интервью пользователей'
        }
      ],
      comments: [
        {
          id: 'c1',
          text: 'Мы должны рассмотреть возможность использования Expo для ускорения разработки.',
          userId: 'user1',
          username: 'Менеджер проекта',
          createdAt: '2023-05-02T14:20:00Z'
        }
      ],
      createdAt: '2023-04-28T11:45:00Z',
      updatedAt: '2023-05-02T14:20:00Z'
    },
    {
      id: '4',
      title: 'Панель аналитики данных',
      emoji: '📈',
      description: 'Внутренний инструмент для визуализации показателей эффективности компании.',
      department: 'future',
      status: 'no-income',
      secondaryStatus: 'Этап планирования',
      goal: 'Создать аналитическую платформу для принятия решений на основе данных',
      requirements: 'Vue.js, D3.js, Node.js',
      inventory: ['Схема данных', 'Каркасы интерфейса'],
      customFields: [],
      importantLinks: [],
      comments: [],
      createdAt: '2023-05-05T10:00:00Z',
      updatedAt: '2023-05-05T10:00:00Z'
    },
    {
      id: '5',
      title: 'Интеграция с устаревшим CRM',
      emoji: '🔄',
      description: 'Интеграция с устаревшими системами управления взаимоотношениями с клиентами.',
      department: 'present',
      status: 'completed',
      secondaryStatus: 'Поддержка',
      goal: 'Подключить наши новые системы к существующему CRM-решению клиента',
      githubUrl: 'https://github.com/biamino/crm-integration',
      requirements: 'PHP, MySQL, REST API',
      inventory: ['API ключи', 'Документация', 'Тестовая среда'],
      customFields: [
        { id: 'cf1', name: 'Клиент', value: 'XYZ Corp' }
      ],
      importantLinks: [
        {
          id: 'il1',
          title: 'Документация системы клиента',
          url: 'https://client-docs.xyz-corp.com',
          description: 'Технические спецификации CRM клиента'
        }
      ],
      comments: [
        {
          id: 'c1',
          text: 'Успешно интегрировано со всеми системами клиента.',
          userId: 'admin',
          username: 'Администратор',
          createdAt: '2023-04-10T16:30:00Z'
        }
      ],
      createdAt: '2023-02-15T08:30:00Z',
      updatedAt: '2023-04-10T16:30:00Z'
    },
    {
      id: '6',
      title: 'Инструмент исследований на базе ИИ',
      emoji: '🧠',
      description: 'Исследовательский помощник на базе ИИ для анализа рынка.',
      department: 'future',
      status: 'active',
      secondaryStatus: 'Активная разработка',
      goal: 'Использовать ИИ для автоматизации маркетинговых исследований и конкурентного анализа',
      requirements: 'Python, TensorFlow, OpenAI API',
      inventory: ['Исследовательские работы', 'Доступ к данным'],
      customFields: [
        { id: 'cf1', name: 'Руководитель исследований', value: 'Др. Смит' }
      ],
      importantLinks: [
        {
          id: 'il1',
          title: 'Архитектура ИИ-модели',
          url: 'https://miro.com/app/board/ai-architecture',
          description: 'Диаграмма компонентов ИИ-модели'
        },
        {
          id: 'il2',
          title: 'Исследовательская библиография',
          url: 'https://zotero.org/groups/biamino/ai-research',
          description: 'Коллекция статей и ссылок'
        }
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
      console.error('Не удалось разобрать сохраненные данные:', error);
      return INITIAL_DATA;
    }
  }
  return INITIAL_DATA;
};

// Function to save data to localStorage
export const saveData = (data: AppData): void => {
  localStorage.setItem('biamino-data', JSON.stringify(data));
};
