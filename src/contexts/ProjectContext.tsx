import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectContextType, Project, AppData } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { API_BASE_URL } from '../lib/config';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({ projects: [] });
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  // Fetch data from server on initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Also refresh data when user changes - ensure everyone sees the same data
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`);
      if (!response.ok) {
        throw new Error('Не удалось получить данные с сервера');
      }
      const serverData = await response.json();
      setData(serverData);
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      toast.error('Не удалось загрузить проекты с сервера');
    } finally {
      setLoading(false);
    }
  };

  // Add a new project
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут создавать проекты');
      return;
    }

    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить проект');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: [...prevData.projects, newProject]
      }));
      
      toast.success(`Проект "${project.title}" успешно создан`);
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
      toast.error('Не удалось создать проект');
    }
  };

  // Update an existing project
  const updateProject = async (id: string, updatedFields: Partial<Project>): Promise<void> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут обновлять проекты');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updatedFields,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить проект');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.map(project => 
          project.id === id 
            ? { 
                ...project, 
                ...updatedFields, 
                updatedAt: new Date().toISOString() 
              } 
            : project
        )
      }));
      
      toast.success('Проект успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении проекта:', error);
      toast.error('Не удалось обновить проект');
    }
  };

  // Delete a project
  const deleteProject = async (id: string): Promise<void> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут удалять проекты');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить проект');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.filter(project => project.id !== id)
      }));
      
      toast.success('Проект успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении проекта:', error);
      toast.error('Не удалось удалить проект');
    }
  };

  // Add a comment to a project
  const addComment = async (projectId: string, text: string): Promise<void> => {
    if (!user) return;
    
    const newComment = {
      id: uuidv4(),
      text,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      reactions: {}
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComment),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить комментарий');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                comments: [...project.comments, newComment],
                updatedAt: new Date().toISOString()
              } 
            : project
        )
      }));
      
      toast.success('Комментарий добавлен');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      toast.error('Не удалось добавить комментарий');
    }
  };

  // Delete a comment
  const deleteComment = async (projectId: string, commentId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить комментарий');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                comments: project.comments.filter(comment => comment.id !== commentId),
                updatedAt: new Date().toISOString()
              } 
            : project
        )
      }));
      
      toast.success('Комментарий удален');
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
      toast.error('Не удалось удалить комментарий');
    }
  };

  // Update a comment
  const updateComment = async (projectId: string, commentId: string, text: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить комментарий');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                comments: project.comments.map(comment =>
                  comment.id === commentId
                    ? { ...comment, text }
                    : comment
                ),
                updatedAt: new Date().toISOString()
              } 
            : project
        )
      }));
      
      toast.success('Комментарий обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
      toast.error('Не удалось обновить комментарий');
    }
  };

  // Add a reaction to a comment
  const addReaction = async (projectId: string, commentId: string, emoji: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить реакцию');
      }

      // Update local state after successful server update
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                comments: project.comments.map(comment =>
                  comment.id === commentId
                    ? { 
                        ...comment, 
                        reactions: {
                          ...comment.reactions,
                          [emoji]: (comment.reactions?.[emoji] || 0) + 1
                        }
                      }
                    : comment
                )
              } 
            : project
        )
      }));
    } catch (error) {
      console.error('Ошибка при добавлении реакции:', error);
      toast.error('Не удалось добавить реакцию');
    }
  };

  // Export data as JSON file
  const exportData = (): void => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `biamino-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Данные успешно экспортированы');
  };

  // Import data from JSON - modified to only work with the server API
  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData) as AppData;
      
      // Validate data format (basic check)
      if (!parsedData || !Array.isArray(parsedData.projects)) {
        throw new Error('Неверный формат данных');
      }
      
      // Update server with imported data
      if (isAdmin) {
        // Only admins can overwrite the database
        fetch(`${API_BASE_URL}/api/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: jsonData,
        })
        .then(response => {
          if (response.ok) {
            setData(parsedData);
            toast.success('Данные успешно импортированы на сервер');
            // Force refresh for all users
            fetchData();
          } else {
            throw new Error('Не удалось импортировать данные на сервер');
          }
        })
        .catch(error => {
          console.error('Ошибка при импорте данных:', error);
          toast.error('Не удалось импортировать данные на сервер');
        });
      } else {
        toast.error('Только администраторы могут импортировать данные в БД');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Не удалось разобрать данные JSON:', error);
      toast.error('Не удалось импортировать данные. Неверный формат.');
      return false;
    }
  };

  const value: ProjectContextType = {
    projects: data.projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    addComment,
    deleteComment,
    updateComment,
    addReaction,
    exportData,
    importData,
    refreshData: fetchData
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
