
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ProjectCard from '../components/ProjectCard';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Department, ProjectStatus } from '../lib/types';
import { Search, PlusCircle, Filter } from 'lucide-react';

const Projects = () => {
  const { department } = useParams<{ department: Department }>();
  const { projects } = useProjects();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Validate department
  const validDepartment = department === 'present' || department === 'future' ? department : 'present';
  
  // Get department emoji
  const departmentEmoji = validDepartment === 'present' ? '🚀' : '🔮';
  
  // Filter projects based on department, search term, and status
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Filter by department
      const departmentMatch = project.department === validDepartment;
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;
      
      return departmentMatch && searchMatch && statusMatch;
    });
  }, [projects, validDepartment, searchTerm, statusFilter]);

  return (
    <Layout requireAuth>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-2" role="img" aria-label={validDepartment}>
                {departmentEmoji}
              </span>
              {validDepartment === 'present' ? 'Present' : 'Future'} Projects
            </h1>
            <p className="text-muted-foreground mt-1">
              {validDepartment === 'present' 
                ? 'Current active projects and initiatives' 
                : 'Upcoming and planned future projects'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="biamino-input pl-10"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="biamino-btn-outline flex items-center"
            >
              <Filter size={18} className="mr-2" />
              Filters
            </button>
            
            {isAdmin && (
              <Link to="/project/new" className="biamino-btn-primary">
                <PlusCircle size={18} className="mr-2" />
                New Project
              </Link>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border rounded-md bg-card">
            <h3 className="text-sm font-medium mb-2">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'active' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'completed' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setStatusFilter('income')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'income' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setStatusFilter('no-income')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'no-income' 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                }`}
              >
                No Income
              </button>
              <button
                onClick={() => setStatusFilter('on-hold')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'on-hold' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                }`}
              >
                On Hold
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'archived' 
                    ? 'bg-gray-500 text-white' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Archived
              </button>
            </div>
          </div>
        )}

        {filteredProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground text-lg">
              No projects found.
              {searchTerm && ' Try adjusting your search criteria.'}
              {statusFilter !== 'all' && ' Try a different status filter.'}
              {!searchTerm && statusFilter === 'all' && isAdmin && (
                <span> Why not <Link to="/project/new" className="text-primary hover:underline">create one</Link>?</span>
              )}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;
