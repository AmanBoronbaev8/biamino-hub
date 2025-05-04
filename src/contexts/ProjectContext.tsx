
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectContextType, Project, AppData } from '../lib/types';
import { getInitialData, saveData } from '../lib/data';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(getInitialData());
  const { user } = useAuth();

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveData(data);
  }, [data]);

  // Add a new project
  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): void => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };

    setData(prevData => ({
      ...prevData,
      projects: [...prevData.projects, newProject]
    }));
    
    toast.success(`Project "${project.title}" has been created`);
  };

  // Update an existing project
  const updateProject = (id: string, updatedFields: Partial<Project>): void => {
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
    
    toast.success('Project has been updated');
  };

  // Delete a project
  const deleteProject = (id: string): void => {
    setData(prevData => ({
      ...prevData,
      projects: prevData.projects.filter(project => project.id !== id)
    }));
    
    toast.success('Project has been deleted');
  };

  // Add a comment to a project
  const addComment = (projectId: string, text: string): void => {
    if (!user) return;
    
    const newComment = {
      id: uuidv4(),
      text,
      userId: user.id,
      username: user.username,
      createdAt: new Date().toISOString(),
      reactions: {}
    };

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
    
    toast.success('Comment added');
  };

  // Delete a comment
  const deleteComment = (projectId: string, commentId: string): void => {
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
    
    toast.success('Comment deleted');
  };

  // Update a comment
  const updateComment = (projectId: string, commentId: string, text: string): void => {
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
    
    toast.success('Comment updated');
  };

  // Add a reaction to a comment
  const addReaction = (projectId: string, commentId: string, emoji: string): void => {
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
    toast.success('Data exported successfully');
  };

  // Import data from JSON
  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData) as AppData;
      
      // Validate data format (basic check)
      if (!parsedData || !Array.isArray(parsedData.projects)) {
        throw new Error('Invalid data format');
      }
      
      setData(parsedData);
      saveData(parsedData);
      toast.success('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      toast.error('Failed to import data. Invalid format.');
      return false;
    }
  };

  const value: ProjectContextType = {
    projects: data.projects,
    addProject,
    updateProject,
    deleteProject,
    addComment,
    deleteComment,
    updateComment,
    addReaction,
    exportData,
    importData
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
