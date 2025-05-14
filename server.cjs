
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize database connection
const dbPromise = open({
  filename: process.env.DATABASE_PATH || './database.sqlite',
  driver: sqlite3.Database
});

// Initialize database schema
async function initializeDb() {
  const db = await dbPromise;
  
  // Create projects table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `);
  
  // Check if we need to initialize with default data
  const count = await db.get('SELECT COUNT(*) as count FROM projects');
  
  if (count.count === 0) {
    console.log('Initializing database with default projects');
    
    // Define initial data directly instead of importing from TypeScript
    const initialData = {
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
        }
      ]
    };
    
    // Insert each project as a separate row
    for (const project of initialData.projects) {
      await db.run(
        'INSERT INTO projects (id, data) VALUES (?, ?)',
        [project.id, JSON.stringify(project)]
      );
    }
  }
}

// Initialize database on server start
initializeDb().catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// API Routes

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const db = await dbPromise;
    const projects = await db.all('SELECT data FROM projects');
    
    res.json({
      projects: projects.map(row => JSON.parse(row.data))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    const project = await db.get('SELECT data FROM projects WHERE id = ?', req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(JSON.parse(project.data));
  } catch (error) {
    console.error(`Error fetching project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const project = req.body;
    const db = await dbPromise;
    
    await db.run(
      'INSERT INTO projects (id, data) VALUES (?, ?)',
      [project.id, JSON.stringify(project)]
    );
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update a project
app.patch('/api/projects/:id', async (req, res) => {
  try {
    const updates = req.body;
    const db = await dbPromise;
    
    // Get existing project
    const projectRow = await db.get('SELECT data FROM projects WHERE id = ?', req.params.id);
    
    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Merge updates with existing project
    const existingProject = JSON.parse(projectRow.data);
    const updatedProject = { 
      ...existingProject, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    // Save updated project
    await db.run(
      'UPDATE projects SET data = ? WHERE id = ?',
      [JSON.stringify(updatedProject), req.params.id]
    );
    
    res.json(updatedProject);
  } catch (error) {
    console.error(`Error updating project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete a project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const db = await dbPromise;
    
    const result = await db.run('DELETE FROM projects WHERE id = ?', req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Comments endpoints

// Add comment to a project
app.post('/api/projects/:id/comments', async (req, res) => {
  try {
    const comment = req.body;
    const db = await dbPromise;
    
    // Get existing project
    const projectRow = await db.get('SELECT data FROM projects WHERE id = ?', req.params.id);
    
    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Add comment to project
    const project = JSON.parse(projectRow.data);
    
    if (!project.comments) {
      project.comments = [];
    }
    
    project.comments.push(comment);
    project.updatedAt = new Date().toISOString();
    
    // Save updated project
    await db.run(
      'UPDATE projects SET data = ? WHERE id = ?',
      [JSON.stringify(project), req.params.id]
    );
    
    res.status(201).json(comment);
  } catch (error) {
    console.error(`Error adding comment to project ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete comment from a project
app.delete('/api/projects/:projectId/comments/:commentId', async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const db = await dbPromise;
    
    // Get existing project
    const projectRow = await db.get('SELECT data FROM projects WHERE id = ?', projectId);
    
    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Remove comment from project
    const project = JSON.parse(projectRow.data);
    
    if (!project.comments) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const initialLength = project.comments.length;
    project.comments = project.comments.filter(c => c.id !== commentId);
    
    if (project.comments.length === initialLength) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    project.updatedAt = new Date().toISOString();
    
    // Save updated project
    await db.run(
      'UPDATE projects SET data = ? WHERE id = ?',
      [JSON.stringify(project), projectId]
    );
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting comment ${req.params.commentId}:`, error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Update comment
app.patch('/api/projects/:projectId/comments/:commentId', async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const { text } = req.body;
    const db = await dbPromise;
    
    // Get existing project
    const projectRow = await db.get('SELECT data FROM projects WHERE id = ?', projectId);
    
    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Update comment in project
    const project = JSON.parse(projectRow.data);
    
    if (!project.comments) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentIndex = project.comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    project.comments[commentIndex].text = text;
    project.updatedAt = new Date().toISOString();
    
    // Save updated project
    await db.run(
      'UPDATE projects SET data = ? WHERE id = ?',
      [JSON.stringify(project), projectId]
    );
    
    res.json(project.comments[commentIndex]);
  } catch (error) {
    console.error(`Error updating comment ${req.params.commentId}:`, error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Add reaction to a comment
app.post('/api/projects/:projectId/comments/:commentId/reactions', async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const { emoji } = req.body;
    const db = await dbPromise;
    
    // Get existing project
    const projectRow = await db.get('SELECT data FROM projects WHERE id = ?', projectId);
    
    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Add reaction to comment
    const project = JSON.parse(projectRow.data);
    
    if (!project.comments) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const commentIndex = project.comments.findIndex(c => c.id === commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    const comment = project.comments[commentIndex];
    
    if (!comment.reactions) {
      comment.reactions = {};
    }
    
    comment.reactions[emoji] = (comment.reactions[emoji] || 0) + 1;
    
    // Save updated project
    await db.run(
      'UPDATE projects SET data = ? WHERE id = ?',
      [JSON.stringify(project), projectId]
    );
    
    res.json(comment.reactions);
  } catch (error) {
    console.error(`Error adding reaction to comment ${req.params.commentId}:`, error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Import data endpoint
app.post('/api/import', async (req, res) => {
  try {
    const importData = req.body;
    
    if (!importData || !Array.isArray(importData.projects)) {
      return res.status(400).json({ error: 'Invalid import data format' });
    }
    
    const db = await dbPromise;
    
    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Delete all existing projects
      await db.run('DELETE FROM projects');
      
      // Insert new projects
      for (const project of importData.projects) {
        await db.run(
          'INSERT INTO projects (id, data) VALUES (?, ?)',
          [project.id, JSON.stringify(project)]
        );
      }
      
      // Commit the transaction
      await db.run('COMMIT');
      
      res.json({ success: true, message: 'Data imported successfully' });
    } catch (error) {
      // Rollback the transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Change app.get('*') to use a simple path pattern without the problematic URL
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
