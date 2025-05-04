
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../lib/types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // Determine status badge color
  const getStatusBadgeClass = () => {
    switch (project.status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'income':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'no-income':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Status translation mapping
  const getStatusTranslation = (status: string): string => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      case 'archived': return 'Архивирован';
      case 'income': return 'Доходный';
      case 'no-income': return 'Не доходный';
      case 'on-hold': return 'Приостановлен';
      default: return status.replace('-', ' ');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="biamino-card p-5 flex flex-col h-full transition-all hover:translate-y-[-2px]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-3xl" role="img" aria-label="Project emoji">
            {project.emoji}
          </span>
          <h3 className="text-xl font-semibold truncate">{project.title}</h3>
        </div>
        <div className="flex flex-col gap-1">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
            {getStatusTranslation(project.status)}
          </span>
          
          {project.secondaryStatus && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
              {project.secondaryStatus}
            </span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
        {project.description}
      </p>

      {project.goal && (
        <div className="mb-3 border-l-2 pl-2 border-primary/60">
          <p className="text-sm line-clamp-2">🎯 {project.goal}</p>
        </div>
      )}

      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Создан: {formatDate(project.createdAt)}</span>
          <span>Обновлен: {formatDate(project.updatedAt)}</span>
        </div>
        
        {project.comments.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">
              {project.comments.length} {project.comments.length === 1 ? 'комментарий' : project.comments.length > 1 && project.comments.length < 5 ? 'комментария' : 'комментариев'}
            </span>
          </div>
        )}
      </div>

      <Link 
        to={`/project/${project.id}`} 
        className="biamino-btn-primary mt-auto w-full flex justify-center"
      >
        Подробнее
      </Link>
    </div>
  );
};

export default ProjectCard;
