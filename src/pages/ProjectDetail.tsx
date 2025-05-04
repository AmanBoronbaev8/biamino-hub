
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CommentSection from '../components/CommentSection';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Project, ProjectStatus, Department, CustomField, SecondaryStatus, ImportantLink } from '../lib/types';
import { ArrowLeft, Edit, Trash, Save, X, Plus, ExternalLink, LinkIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Available emojis for selection
const EMOJIS = [
  '📊', '🚀', '🌐', '📱', '📈', '🔄', '🧠', '💻', '🛠️', '📝', 
  '🔍', '🎯', '📢', '🤖', '🎨', '🔒', '📦', '⚙️', '🔔', '📡',
  '🌈', '🔥', '💎', '🏆', '🎁', '🎉', '💡', '📌', '🎮', '🎓',
  '🌱', '🌟', '⭐', '🌍', '🚩', '📱', '🔮', '🚧', '🎭', '🎬'
];

// Status options
const STATUS_OPTIONS: { value: ProjectStatus; label: string; }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'income', label: 'Income' },
  { value: 'no-income', label: 'No Income' },
  { value: 'on-hold', label: 'On Hold' }
];

// Secondary status options
const SECONDARY_STATUS_OPTIONS: { value: SecondaryStatus; label: string; }[] = [
  { value: 'in-development', label: 'In Development' },
  { value: 'planning', label: 'Planning Phase' },
  { value: 'completed', label: 'Completed' },
  { value: 'testing', label: 'Testing' },
  { value: 'review', label: 'Under Review' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'none', label: 'Not Specified' }
];

// Department options
const DEPARTMENT_OPTIONS: { value: Department; label: string; }[] = [
  { value: 'present', label: 'Present' },
  { value: 'future', label: 'Future' }
];

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, updateProject, deleteProject, addProject } = useProjects();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const isNewProject = projectId === 'new';
  
  // Get the project if it exists
  const existingProject = projectId && projectId !== 'new' ? 
    projects.find(p => p.id === projectId) : null;
  
  // State for the project data
  const [project, setProject] = useState<Project>(() => {
    if (isNewProject) {
      return {
        id: 'new',
        title: '',
        emoji: '📊',
        description: '',
        department: 'present',
        status: 'active',
        secondaryStatus: 'planning',
        goal: '',
        customFields: [],
        importantLinks: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    return existingProject || {
      id: '',
      title: '',
      emoji: '',
      description: '',
      department: 'present',
      status: 'active',
      secondaryStatus: 'none',
      customFields: [],
      importantLinks: [],
      comments: [],
      createdAt: '',
      updatedAt: ''
    };
  });
  
  // State for editing mode
  const [isEditing, setIsEditing] = useState(isNewProject);
  
  // State for new custom field
  const [newCustomField, setNewCustomField] = useState<{ name: string; value: string }>({
    name: '',
    value: ''
  });
  
  // State for new important link
  const [newImportantLink, setNewImportantLink] = useState<{ title: string; url: string; description: string }>({
    title: '',
    url: '',
    description: ''
  });
  
  // State for showing emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // State for inventory items
  const [inventoryItem, setInventoryItem] = useState('');
  
  useEffect(() => {
    // If project ID doesn't exist and it's not a new project, navigate back
    if (!isNewProject && !existingProject) {
      navigate('/');
    }
  }, [existingProject, isNewProject, navigate]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle emoji selection
  const handleSelectEmoji = (emoji: string) => {
    setProject(prev => ({ ...prev, emoji }));
    setShowEmojiPicker(false);
  };
  
  // Handle custom field changes
  const handleCustomFieldChange = (id: string, field: 'name' | 'value', value: string) => {
    setProject(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, [field]: value } : cf
      )
    }));
  };
  
  // Add a new custom field
  const handleAddCustomField = () => {
    if (!newCustomField.name || !newCustomField.value) return;
    
    setProject(prev => ({
      ...prev,
      customFields: [
        ...prev.customFields,
        { ...newCustomField, id: uuidv4() }
      ]
    }));
    
    setNewCustomField({ name: '', value: '' });
  };
  
  // Delete a custom field
  const handleDeleteCustomField = (id: string) => {
    setProject(prev => ({
      ...prev,
      customFields: prev.customFields.filter(cf => cf.id !== id)
    }));
  };
  
  // Handle important link changes
  const handleImportantLinkChange = (id: string, field: keyof ImportantLink, value: string) => {
    setProject(prev => ({
      ...prev,
      importantLinks: prev.importantLinks?.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      ) || []
    }));
  };
  
  // Add a new important link
  const handleAddImportantLink = () => {
    if (!newImportantLink.title || !newImportantLink.url) return;
    
    setProject(prev => ({
      ...prev,
      importantLinks: [
        ...(prev.importantLinks || []),
        { ...newImportantLink, id: uuidv4() }
      ]
    }));
    
    setNewImportantLink({ title: '', url: '', description: '' });
  };
  
  // Delete an important link
  const handleDeleteImportantLink = (id: string) => {
    setProject(prev => ({
      ...prev,
      importantLinks: prev.importantLinks?.filter(link => link.id !== id) || []
    }));
  };
  
  // Add inventory item
  const handleAddInventoryItem = () => {
    if (!inventoryItem.trim()) return;
    
    setProject(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), inventoryItem]
    }));
    
    setInventoryItem('');
  };
  
  // Remove inventory item
  const handleRemoveInventoryItem = (index: number) => {
    setProject(prev => ({
      ...prev,
      inventory: prev.inventory?.filter((_, i) => i !== index)
    }));
  };
  
  // Handle save
  const handleSave = () => {
    if (!project.title) {
      alert('Project title is required');
      return;
    }
    
    if (isNewProject) {
      const { id, ...newProject } = project;
      addProject(newProject);
      navigate('/');
    } else {
      updateProject(project.id, project);
      setIsEditing(false);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(project.id);
      navigate('/');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!project && !isNewProject) {
    return (
      <Layout requireAuth>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Go back to home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link 
          to={`/projects/${project.department}`}
          className="biamino-btn-ghost inline-flex items-center mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to {project.department} projects
        </Link>
        
        {/* Project header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-4xl bg-muted rounded-md hover:bg-accent transition-colors w-12 h-12 flex items-center justify-center"
              >
                {project.emoji || '📊'}
              </button>
            ) : (
              <span className="text-4xl">{project.emoji}</span>
            )}
            
            <div>
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={project.title}
                  onChange={handleChange}
                  placeholder="Project Title"
                  className="biamino-input text-2xl font-bold"
                  required
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          {isAdmin && !isEditing && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="biamino-btn-outline"
              >
                <Edit size={18} className="mr-2" />
                Edit
              </button>
              <button 
                onClick={handleDelete}
                className="biamino-btn bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                <Trash size={18} className="mr-2" />
                Delete
              </button>
            </div>
          )}
          
          {isEditing && (
            <div className="flex space-x-2">
              <button 
                onClick={isNewProject ? () => navigate(-1) : () => setIsEditing(false)}
                className="biamino-btn-outline"
              >
                <X size={18} className="mr-2" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="biamino-btn-primary"
              >
                <Save size={18} className="mr-2" />
                Save
              </button>
            </div>
          )}
        </div>
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <div className="mb-6 p-4 border rounded-md bg-card">
            <h3 className="text-sm font-medium mb-2">Select Emoji</h3>
            <div className="grid grid-cols-10 gap-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-md ${
                    project.emoji === emoji ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Project details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Description */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={project.description}
                  onChange={handleChange}
                  placeholder="Project description..."
                  className="biamino-input resize-none h-40 w-full"
                />
              ) : (
                <p className="whitespace-pre-wrap">{project.description}</p>
              )}
            </div>

            {/* Goal */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">🎯 Project Goal</h2>
              {isEditing ? (
                <textarea
                  name="goal"
                  value={project.goal || ''}
                  onChange={handleChange}
                  placeholder="What is the main goal of this project? (optional)"
                  className="biamino-input resize-none h-24 w-full"
                />
              ) : (
                <p className="whitespace-pre-wrap">{project.goal || 'No specific goal defined'}</p>
              )}
            </div>
            
            {/* Requirements */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              {isEditing ? (
                <textarea
                  name="requirements"
                  value={project.requirements || ''}
                  onChange={handleChange}
                  placeholder="Project requirements..."
                  className="biamino-input resize-none h-24 w-full"
                />
              ) : (
                <p className="whitespace-pre-wrap">{project.requirements || 'No requirements specified'}</p>
              )}
            </div>
            
            {/* Important Links */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Important Links</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newImportantLink.title}
                      onChange={e => setNewImportantLink({...newImportantLink, title: e.target.value})}
                      placeholder="Link Title"
                      className="biamino-input w-full"
                    />
                    <input
                      type="url"
                      value={newImportantLink.url}
                      onChange={e => setNewImportantLink({...newImportantLink, url: e.target.value})}
                      placeholder="URL (https://...)"
                      className="biamino-input w-full"
                    />
                    <input
                      type="text"
                      value={newImportantLink.description}
                      onChange={e => setNewImportantLink({...newImportantLink, description: e.target.value})}
                      placeholder="Description (optional)"
                      className="biamino-input w-full"
                    />
                    <button 
                      onClick={handleAddImportantLink}
                      disabled={!newImportantLink.title || !newImportantLink.url}
                      className="biamino-btn-outline w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Link
                    </button>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {project.importantLinks?.map((link) => (
                      <div key={link.id} className="p-3 border rounded-md bg-muted">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <LinkIcon size={16} />
                            <input
                              type="text"
                              value={link.title}
                              onChange={e => handleImportantLinkChange(link.id, 'title', e.target.value)}
                              className="biamino-input"
                              placeholder="Link Title"
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteImportantLink(link.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                        <input
                          type="url"
                          value={link.url}
                          onChange={e => handleImportantLinkChange(link.id, 'url', e.target.value)}
                          className="biamino-input w-full mb-2"
                          placeholder="URL"
                        />
                        <input
                          type="text"
                          value={link.description || ''}
                          onChange={e => handleImportantLinkChange(link.id, 'description', e.target.value)}
                          className="biamino-input w-full"
                          placeholder="Description (optional)"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {(!project.importantLinks || project.importantLinks.length === 0) && (
                    <p className="text-muted-foreground text-center pt-2">No important links added yet</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {project.importantLinks && project.importantLinks.length > 0 ? (
                    project.importantLinks.map((link) => (
                      <Card key={link.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base flex items-center">
                            <LinkIcon size={16} className="mr-2" />
                            {link.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center mb-1"
                          >
                            <ExternalLink size={14} className="mr-1" />
                            {link.url}
                          </a>
                          {link.description && (
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No important links added</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Inventory */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Inventory</h2>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inventoryItem}
                      onChange={e => setInventoryItem(e.target.value)}
                      placeholder="Add inventory item..."
                      className="biamino-input flex-grow"
                    />
                    <button 
                      onClick={handleAddInventoryItem}
                      className="biamino-btn-outline"
                    >
                      Add
                    </button>
                  </div>
                  
                  <ul className="space-y-2">
                    {project.inventory?.map((item, index) => (
                      <li key={index} className="flex justify-between items-center p-2 rounded bg-muted">
                        <span>{item}</span>
                        <button 
                          onClick={() => handleRemoveInventoryItem(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  
                  {(project.inventory?.length === 0 || !project.inventory) && (
                    <p className="text-muted-foreground">No inventory items added yet</p>
                  )}
                </div>
              ) : (
                <>
                  {project.inventory && project.inventory.length > 0 ? (
                    <ul className="space-y-1 list-disc list-inside">
                      {project.inventory.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No inventory items</p>
                  )}
                </>
              )}
            </div>
            
            {/* Comments */}
            {!isNewProject && (
              <CommentSection projectId={project.id} comments={project.comments} />
            )}
          </div>
          
          {/* Sidebar */}
          <div>
            {/* Status and metadata */}
            <div className="biamino-card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Details</h3>
              
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  {isEditing ? (
                    <select
                      name="status"
                      value={project.status}
                      onChange={handleChange}
                      className="biamino-input"
                    >
                      {STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                      ${project.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                      ${project.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                      ${project.status === 'income' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : ''}
                      ${project.status === 'no-income' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                      ${project.status === 'on-hold' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : ''}
                    `}>
                      {project.status.replace('-', ' ')}
                    </div>
                  )}
                </div>
                
                {/* Secondary Status */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Secondary Status</div>
                  {isEditing ? (
                    <select
                      name="secondaryStatus"
                      value={project.secondaryStatus || 'none'}
                      onChange={handleChange}
                      className="biamino-input"
                    >
                      {SECONDARY_STATUS_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      {project.secondaryStatus && project.secondaryStatus !== 'none' ? (
                        <Badge className={`
                          ${project.secondaryStatus === 'in-development' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' : ''}
                          ${project.secondaryStatus === 'planning' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' : ''}
                          ${project.secondaryStatus === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : ''}
                          ${project.secondaryStatus === 'testing' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' : ''}
                          ${project.secondaryStatus === 'review' ? 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300' : ''}
                          ${project.secondaryStatus === 'maintenance' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300' : ''}
                          border-transparent
                        `}>
                          {project.secondaryStatus.replace('-', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Department */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Department</div>
                  {isEditing ? (
                    <select
                      name="department"
                      value={project.department}
                      onChange={handleChange}
                      className="biamino-input"
                    >
                      {DEPARTMENT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="capitalize">{project.department}</div>
                  )}
                </div>
                
                {/* GitHub URL */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">GitHub URL</div>
                  {isEditing ? (
                    <input
                      type="url"
                      name="githubUrl"
                      value={project.githubUrl || ''}
                      onChange={handleChange}
                      placeholder="https://github.com/username/repo"
                      className="biamino-input"
                    />
                  ) : (
                    <>
                      {project.githubUrl ? (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          {project.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                        </a>
                      ) : (
                        <div className="text-muted-foreground">No GitHub URL</div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Dates */}
                {!isNewProject && (
                  <>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Created</div>
                      <div>{formatDate(project.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                      <div>{formatDate(project.updatedAt)}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Custom Fields */}
            <div className="biamino-card p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Custom Fields</h3>
                {isEditing && (
                  <button 
                    onClick={() => document.getElementById('custom-field-name')?.focus()}
                    className="text-primary hover:text-primary/90"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  {/* Add new custom field */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        id="custom-field-name"
                        type="text"
                        value={newCustomField.name}
                        onChange={e => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Field name"
                        className="biamino-input w-1/2"
                      />
                      <input
                        type="text"
                        value={newCustomField.value}
                        onChange={e => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Field value"
                        className="biamino-input w-1/2"
                      />
                    </div>
                    <button 
                      onClick={handleAddCustomField}
                      disabled={!newCustomField.name || !newCustomField.value}
                      className="biamino-btn-outline w-full text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Field
                    </button>
                  </div>
                  
                  {/* Existing custom fields */}
                  {project.customFields.map(field => (
                    <div key={field.id} className="space-y-2 pb-2 border-b last:border-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={e => handleCustomFieldChange(field.id, 'name', e.target.value)}
                          placeholder="Field name"
                          className="biamino-input w-1/2"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={e => handleCustomFieldChange(field.id, 'value', e.target.value)}
                          placeholder="Field value"
                          className="biamino-input w-1/2"
                        />
                      </div>
                      <button 
                        onClick={() => handleDeleteCustomField(field.id)}
                        className="text-sm text-destructive hover:text-destructive/90"
                      >
                        <Trash size={14} className="mr-1 inline-block" />
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {project.customFields.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No custom fields. Add fields to store additional information.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {project.customFields.length > 0 ? (
                    <div className="space-y-3">
                      {project.customFields.map(field => (
                        <div key={field.id} className="flex flex-col">
                          <div className="text-sm text-muted-foreground">{field.name}</div>
                          <div>{field.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No custom fields</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
