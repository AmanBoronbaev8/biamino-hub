
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass()}`}>
          {project.status.replace('-', ' ')}
        </span>
      </div>

      <p className="text-muted-foreground mb-4 line-clamp-3 flex-grow">
        {project.description}
      </p>

      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Created: {formatDate(project.createdAt)}</span>
          <span>Updated: {formatDate(project.updatedAt)}</span>
        </div>
        
        {project.comments.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">
              {project.comments.length} comment{project.comments.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <Link 
        to={`/project/${project.id}`} 
        className="biamino-btn-primary mt-auto w-full flex justify-center"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProjectCard;
