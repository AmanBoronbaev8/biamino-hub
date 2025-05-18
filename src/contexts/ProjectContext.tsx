
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectContextType, Project, AppData } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>({ projects: [] });
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase on initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Также обновляем данные при изменении пользователя
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 60000); // Обновляем каждую минуту
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Функция для получения всех проектов и их связанных данных
  const fetchData = async () => {
    setLoading(true);
    try {
      // Получаем все проекты
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      if (!projects) throw new Error('Не удалось получить проекты');

      // Для каждого проекта получаем пользовательские поля
      const projectsWithDetails = await Promise.all(projects.map(async (project) => {
        // Получаем пользовательские поля
        const { data: customFields, error: customFieldsError } = await supabase
          .from('custom_fields')
          .select('*')
          .eq('project_id', project.id);

        if (customFieldsError) console.error('Ошибка при загрузке пользовательских полей:', customFieldsError);

        // Получаем важные ссылки
        const { data: importantLinks, error: linksError } = await supabase
          .from('important_links')
          .select('*')
          .eq('project_id', project.id);

        if (linksError) console.error('Ошибка при загрузке важных ссылок:', linksError);

        // Получаем комментарии
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false });

        if (commentsError) console.error('Ошибка при загрузке комментариев:', commentsError);

        // Для каждого комментария получаем реакции
        const commentsWithReactions = await Promise.all((comments || []).map(async (comment) => {
          const { data: reactions, error: reactionsError } = await supabase
            .from('comment_reactions')
            .select('*')
            .eq('comment_id', comment.id);

          if (reactionsError) console.error('Ошибка при загрузке реакций:', reactionsError);

          // Преобразуем реакции в нужный формат
          const reactionsObject: { [key: string]: number } = {};
          (reactions || []).forEach(reaction => {
            reactionsObject[reaction.emoji] = reaction.count;
          });

          return {
            ...comment,
            reactions: reactionsObject
          };
        }));

        // Формируем объект проекта с нужной структурой для приложения
        return {
          id: project.id,
          title: project.title,
          emoji: project.emoji || '',
          description: project.description || '',
          department: project.department as 'present' | 'future' || 'present',
          status: project.status as any || 'active',
          secondaryStatus: project.secondary_status || undefined,
          goal: project.goal || undefined,
          githubUrl: project.github_url || undefined,
          requirements: project.requirements || undefined,
          inventory: project.inventory || [],
          customFields: (customFields || []).map(field => ({
            id: field.id,
            name: field.name,
            value: field.value || ''
          })),
          importantLinks: (importantLinks || []).map(link => ({
            id: link.id,
            title: link.title,
            url: link.url,
            description: link.description || undefined
          })),
          comments: commentsWithReactions || [],
          createdAt: project.created_at,
          updatedAt: project.updated_at
        };
      }));

      setData({ projects: projectsWithDetails });
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
      toast.error('Не удалось загрузить проекты из базы данных');
    } finally {
      setLoading(false);
    }
  };

  // Добавление нового проекта
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут создавать проекты');
      return;
    }

    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }

    try {
      // Сначала добавляем проект
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: project.title,
          emoji: project.emoji,
          description: project.description,
          department: project.department,
          status: project.status,
          secondary_status: project.secondaryStatus,
          goal: project.goal,
          github_url: project.githubUrl,
          requirements: project.requirements,
          inventory: project.inventory
        })
        .select('*')
        .single();

      if (projectError) throw projectError;
      if (!newProject) throw new Error('Не удалось создать проект');

      // Добавляем пользовательские поля
      if (project.customFields?.length) {
        const customFieldsToInsert = project.customFields.map(field => ({
          project_id: newProject.id,
          name: field.name,
          value: field.value
        }));

        const { error: customFieldsError } = await supabase
          .from('custom_fields')
          .insert(customFieldsToInsert);

        if (customFieldsError) console.error('Ошибка при добавлении пользовательских полей:', customFieldsError);
      }

      // Добавляем важные ссылки
      if (project.importantLinks?.length) {
        const linksToInsert = project.importantLinks.map(link => ({
          project_id: newProject.id,
          title: link.title,
          url: link.url,
          description: link.description
        }));

        const { error: linksError } = await supabase
          .from('important_links')
          .insert(linksToInsert);

        if (linksError) console.error('Ошибка при добавлении важных ссылок:', linksError);
      }

      // Обновляем локальное состояние после успешного добавления в БД
      fetchData(); // Перезагружаем все данные для обновления состояния
      
      toast.success(`Проект "${project.title}" успешно создан`);
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
      toast.error('Не удалось создать проект');
    }
  };

  // Обновление существующего проекта
  const updateProject = async (id: string, updatedFields: Partial<Project>): Promise<void> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут обновлять проекты');
      return;
    }

    try {
      // Обновляем основную информацию о проекте
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: updatedFields.title,
          emoji: updatedFields.emoji,
          description: updatedFields.description,
          department: updatedFields.department,
          status: updatedFields.status,
          secondary_status: updatedFields.secondaryStatus,
          goal: updatedFields.goal,
          github_url: updatedFields.githubUrl,
          requirements: updatedFields.requirements,
          inventory: updatedFields.inventory,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (projectError) throw projectError;

      // Обновляем пользовательские поля, если они предоставлены
      if (updatedFields.customFields) {
        // Получаем текущие поля для сравнения
        const { data: currentFields, error: fieldsError } = await supabase
          .from('custom_fields')
          .select('*')
          .eq('project_id', id);
        
        if (fieldsError) throw fieldsError;

        // Поля для обновления или добавления
        for (const field of updatedFields.customFields) {
          const existingField = currentFields?.find(f => f.id === field.id);

          if (existingField) {
            // Обновляем существующее поле
            await supabase
              .from('custom_fields')
              .update({
                name: field.name,
                value: field.value,
                updated_at: new Date().toISOString()
              })
              .eq('id', field.id);
          } else {
            // Добавляем новое поле
            await supabase
              .from('custom_fields')
              .insert({
                project_id: id,
                name: field.name,
                value: field.value
              });
          }
        }

        // Удаляем поля, которых нет в обновлении
        const fieldIdsToKeep = updatedFields.customFields.map(field => field.id);
        const fieldsToDelete = currentFields?.filter(field => !fieldIdsToKeep.includes(field.id));
        
        if (fieldsToDelete && fieldsToDelete.length > 0) {
          await supabase
            .from('custom_fields')
            .delete()
            .in('id', fieldsToDelete.map(field => field.id));
        }
      }

      // Аналогичная логика для важных ссылок
      if (updatedFields.importantLinks) {
        const { data: currentLinks, error: linksError } = await supabase
          .from('important_links')
          .select('*')
          .eq('project_id', id);
        
        if (linksError) throw linksError;

        // Ссылки для обновления или добавления
        for (const link of updatedFields.importantLinks) {
          const existingLink = currentLinks?.find(l => l.id === link.id);

          if (existingLink) {
            // Обновляем существующую ссылку
            await supabase
              .from('important_links')
              .update({
                title: link.title,
                url: link.url,
                description: link.description,
                updated_at: new Date().toISOString()
              })
              .eq('id', link.id);
          } else {
            // Добавляем новую ссылку
            await supabase
              .from('important_links')
              .insert({
                project_id: id,
                title: link.title,
                url: link.url,
                description: link.description
              });
          }
        }

        // Удаляем ссылки, которых нет в обновлении
        const linkIdsToKeep = updatedFields.importantLinks.map(link => link.id);
        const linksToDelete = currentLinks?.filter(link => !linkIdsToKeep.includes(link.id));
        
        if (linksToDelete && linksToDelete.length > 0) {
          await supabase
            .from('important_links')
            .delete()
            .in('id', linksToDelete.map(link => link.id));
        }
      }

      // Обновляем локальное состояние после успешного обновления в БД
      fetchData(); // Перезагружаем все данные для обновления состояния
      
      toast.success('Проект успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении проекта:', error);
      toast.error('Не удалось обновить проект');
    }
  };

  // Удаление проекта
  const deleteProject = async (id: string): Promise<void> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут удалять проекты');
      return;
    }

    try {
      // Удаление проекта автоматически удалит все связанные записи благодаря ON DELETE CASCADE
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Обновляем локальное состояние после успешного удаления из БД
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

  // Добавление комментария к проекту
  const addComment = async (projectId: string, text: string): Promise<void> => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      return;
    }
    
    try {
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          username: user.username,
          text
        })
        .select()
        .single();

      if (error) throw error;

      // Обновляем локальное состояние после успешного добавления в БД
      fetchData(); // Перезагружаем все данные для обновления состояния
      
      toast.success('Комментарий добавлен');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      toast.error('Не удалось добавить комментарий');
    }
  };

  // Удаление комментария
  const deleteComment = async (projectId: string, commentId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Обновляем локальное состояние после успешного удаления из БД
      setData(prevData => ({
        ...prevData,
        projects: prevData.projects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                comments: project.comments.filter(comment => comment.id !== commentId)
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

  // Обновление комментария
  const updateComment = async (projectId: string, commentId: string, text: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ text })
        .eq('id', commentId);

      if (error) throw error;

      // Обновляем локальное состояние после успешного обновления в БД
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
                )
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

  // Добавление реакции к комментарию
  const addReaction = async (projectId: string, commentId: string, emoji: string): Promise<void> => {
    try {
      // Проверяем, существует ли уже реакция с таким emoji
      const { data: existingReactions, error: fetchError } = await supabase
        .from('comment_reactions')
        .select('*')
        .eq('comment_id', commentId)
        .eq('emoji', emoji);

      if (fetchError) throw fetchError;

      if (existingReactions && existingReactions.length > 0) {
        // Если реакция уже существует, увеличиваем счетчик
        const { error: updateError } = await supabase
          .from('comment_reactions')
          .update({ 
            count: existingReactions[0].count + 1,
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingReactions[0].id);

        if (updateError) throw updateError;
      } else {
        // Если реакции еще нет, создаем новую
        const { error: insertError } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            emoji,
            count: 1
          });

        if (insertError) throw insertError;
      }

      // Обновляем локальное состояние после успешного добавления/обновления в БД
      fetchData(); // Перезагружаем все данные для обновления состояния
    } catch (error) {
      console.error('Ошибка при добавлении реакции:', error);
      toast.error('Не удалось добавить реакцию');
    }
  };

  // Экспорт данных в формате JSON
  const exportData = async (): Promise<void> => {
    try {
      // Получаем данные из Supabase для экспорта
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');
      
      if (projectsError) throw projectsError;

      // Преобразуем данные в нужный формат
      const exportData = { projects };
      
      // Создаем и скачиваем файл
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `biamino-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Данные успешно экспортированы');
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      toast.error('Не удалось экспортировать данные');
    }
  };

  // Импорт данных из JSON
  const importData = async (jsonData: string): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Только администраторы могут импортировать данные в БД');
      return false;
    }
    
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Валидация данных
      if (!parsedData || !Array.isArray(parsedData.projects)) {
        throw new Error('Неверный формат данных');
      }
      
      // Очистка всех таблиц
      await supabase.from('comment_reactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('important_links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('custom_fields').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Импорт проектов
      for (const project of parsedData.projects) {
        // Добавляем проект
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            id: project.id,
            title: project.title,
            emoji: project.emoji,
            description: project.description,
            department: project.department,
            status: project.status,
            secondary_status: project.secondary_status,
            goal: project.goal,
            github_url: project.github_url,
            requirements: project.requirements,
            inventory: project.inventory,
            created_at: project.created_at,
            updated_at: project.updated_at
          })
          .select()
          .single();
        
        if (projectError) {
          console.error('Ошибка при импорте проекта:', projectError);
          continue;
        }

        // Импортируем связанные данные
        if (project.custom_fields && project.custom_fields.length > 0) {
          await supabase
            .from('custom_fields')
            .insert(project.custom_fields.map((field: any) => ({
              id: field.id,
              project_id: newProject.id,
              name: field.name,
              value: field.value,
              created_at: field.created_at,
              updated_at: field.updated_at
            })));
        }
        
        if (project.important_links && project.important_links.length > 0) {
          await supabase
            .from('important_links')
            .insert(project.important_links.map((link: any) => ({
              id: link.id,
              project_id: newProject.id,
              title: link.title,
              url: link.url,
              description: link.description,
              created_at: link.created_at,
              updated_at: link.updated_at
            })));
        }
        
        if (project.comments && project.comments.length > 0) {
          for (const comment of project.comments) {
            const { data: newComment, error: commentError } = await supabase
              .from('comments')
              .insert({
                id: comment.id,
                project_id: newProject.id,
                user_id: comment.user_id,
                username: comment.username,
                text: comment.text,
                created_at: comment.created_at
              })
              .select()
              .single();
            
            if (commentError) {
              console.error('Ошибка при импорте комментария:', commentError);
              continue;
            }
            
            // Импортируем реакции на комментарии
            if (comment.reactions) {
              for (const [emoji, count] of Object.entries(comment.reactions)) {
                await supabase
                  .from('comment_reactions')
                  .insert({
                    comment_id: newComment.id,
                    emoji,
                    count: count as number
                  });
              }
            }
          }
        }
      }
      
      toast.success('Данные успешно импортированы');
      fetchData(); // Обновляем данные после импорта
      return true;
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
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
