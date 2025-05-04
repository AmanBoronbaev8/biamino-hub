
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import CommentSection from '../components/CommentSection';
import { useProjects } from '../contexts/ProjectContext';
import { useAuth } from '../contexts/AuthContext';
import { Project, ProjectStatus, Department, CustomField, ImportantLink } from '../lib/types';
import { ArrowLeft, Edit, Trash, Save, X, Plus, ExternalLink, LinkIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Расширенный список эмодзи для выбора
const EMOJIS = [
  '📊', '🚀', '🌐', '📱', '📈', '🔄', '🧠', '💻', '🛠️', '📝', 
  '🔍', '🎯', '📢', '🤖', '🎨', '🔒', '📦', '⚙️', '🔔', '📡',
  '🌈', '🔥', '💎', '🏆', '🎁', '🎉', '💡', '📌', '🎮', '🎓',
  '🌱', '🌟', '⭐', '🌍', '🚩', '📱', '🔮', '🚧', '🎭', '🎬',
  '🏠', '🏢', '🏗️', '📚', '💰', '💸', '💼', '🔋', '♻️', '🔬',
  '🔭', '🧪', '🧬', '🧲', '🔑', '🔐', '🔎', '💯', '✅', '⚠️',
  '⛔', '⏱️', '⏰', '🧩', '🧮', '🔧', '🔨', '🪓', '🔩', '⚡',
  '🚦', '🚥', '🚫', '✨', '🌊', '🧿', '💫', '📊', '📅', '📋'
];

// Варианты статуса
const STATUS_OPTIONS: { value: ProjectStatus; label: string; }[] = [
  { value: 'active', label: 'Активный' },
  { value: 'completed', label: 'Завершен' },
  { value: 'archived', label: 'Архивирован' },
  { value: 'income', label: 'Доходный' },
  { value: 'no-income', label: 'Не доходный' },
  { value: 'on-hold', label: 'Приостановлен' }
];

// Варианты отдела
const DEPARTMENT_OPTIONS: { value: Department; label: string; }[] = [
  { value: 'present', label: 'Настоящее' },
  { value: 'future', label: 'Будущее' }
];

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, updateProject, deleteProject, addProject } = useProjects();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const isNewProject = projectId === 'new';
  
  // Получаем проект, если он существует
  const existingProject = projectId && projectId !== 'new' ? 
    projects.find(p => p.id === projectId) : null;
  
  // Состояние для данных проекта
  const [project, setProject] = useState<Project>(() => {
    if (isNewProject) {
      return {
        id: 'new',
        title: '',
        emoji: '📊',
        description: '',
        department: 'present',
        status: 'active',
        secondaryStatus: 'В разработке',
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
      secondaryStatus: '',
      customFields: [],
      importantLinks: [],
      comments: [],
      createdAt: '',
      updatedAt: ''
    };
  });
  
  // Состояние для режима редактирования
  const [isEditing, setIsEditing] = useState(isNewProject);
  
  // Состояние для нового пользовательского поля
  const [newCustomField, setNewCustomField] = useState<{ name: string; value: string }>({
    name: '',
    value: ''
  });
  
  // Состояние для новой важной ссылки
  const [newImportantLink, setNewImportantLink] = useState<{ title: string; url: string; description: string }>({
    title: '',
    url: '',
    description: ''
  });
  
  // Состояние для отображения выбора эмодзи
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Состояние для элементов инвентаря
  const [inventoryItem, setInventoryItem] = useState('');
  
  useEffect(() => {
    // Если ID проекта не существует и это не новый проект, вернуться назад
    if (!isNewProject && !existingProject) {
      navigate('/');
    }
  }, [existingProject, isNewProject, navigate]);
  
  // Обработка изменений в форме
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработка выбора эмодзи
  const handleSelectEmoji = (emoji: string) => {
    setProject(prev => ({ ...prev, emoji }));
    setShowEmojiPicker(false);
  };
  
  // Обработка изменений пользовательских полей
  const handleCustomFieldChange = (id: string, field: 'name' | 'value', value: string) => {
    setProject(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => 
        cf.id === id ? { ...cf, [field]: value } : cf
      )
    }));
  };
  
  // Добавление нового пользовательского поля
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
  
  // Удаление пользовательского поля
  const handleDeleteCustomField = (id: string) => {
    setProject(prev => ({
      ...prev,
      customFields: prev.customFields.filter(cf => cf.id !== id)
    }));
  };
  
  // Обработка изменений важной ссылки
  const handleImportantLinkChange = (id: string, field: keyof ImportantLink, value: string) => {
    setProject(prev => ({
      ...prev,
      importantLinks: prev.importantLinks?.map(link => 
        link.id === id ? { ...link, [field]: value } : link
      ) || []
    }));
  };
  
  // Добавление новой важной ссылки
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
  
  // Удаление важной ссылки
  const handleDeleteImportantLink = (id: string) => {
    setProject(prev => ({
      ...prev,
      importantLinks: prev.importantLinks?.filter(link => link.id !== id) || []
    }));
  };
  
  // Добавление элемента инвентаря
  const handleAddInventoryItem = () => {
    if (!inventoryItem.trim()) return;
    
    setProject(prev => ({
      ...prev,
      inventory: [...(prev.inventory || []), inventoryItem]
    }));
    
    setInventoryItem('');
  };
  
  // Удаление элемента инвентаря
  const handleRemoveInventoryItem = (index: number) => {
    setProject(prev => ({
      ...prev,
      inventory: prev.inventory?.filter((_, i) => i !== index)
    }));
  };
  
  // Обработка сохранения
  const handleSave = () => {
    if (!project.title) {
      alert('Название проекта обязательно');
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
  
  // Обработка удаления
  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      deleteProject(project.id);
      navigate('/');
    }
  };
  
  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Перевод статуса
  const getStatusTranslation = (status: string): string => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      case 'archived': return 'Архивирован';
      case 'income': return 'Доходный';
      case 'no-income': return 'Не доходный';
      case 'on-hold': return 'Приостановлен';
      default: return status;
    }
  };

  if (!project && !isNewProject) {
    return (
      <Layout requireAuth>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Проект не найден</h1>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Вернуться на главную
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="max-w-4xl mx-auto">
        {/* Кнопка назад */}
        <Link 
          to={`/projects/${project.department}`}
          className="biamino-btn-ghost inline-flex items-center mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} className="mr-2" />
          Назад к проектам ({project.department === 'present' ? 'настоящее' : 'будущее'})
        </Link>
        
        {/* Заголовок проекта */}
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
                  placeholder="Название проекта"
                  className="biamino-input text-2xl font-bold"
                  required
                />
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
              )}
            </div>
          </div>
          
          {/* Кнопки действий */}
          {isAdmin && !isEditing && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="biamino-btn-outline"
              >
                <Edit size={18} className="mr-2" />
                Редактировать
              </button>
              <button 
                onClick={handleDelete}
                className="biamino-btn bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
              >
                <Trash size={18} className="mr-2" />
                Удалить
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
                Отмена
              </button>
              <button 
                onClick={handleSave}
                className="biamino-btn-primary"
              >
                <Save size={18} className="mr-2" />
                Сохранить
              </button>
            </div>
          )}
        </div>
        
        {/* Выбор эмодзи */}
        {showEmojiPicker && (
          <div className="mb-6 p-4 border rounded-md bg-card">
            <h3 className="text-sm font-medium mb-2">Выберите эмодзи</h3>
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
        
        {/* Детали проекта */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Описание */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Описание</h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={project.description}
                  onChange={handleChange}
                  placeholder="Описание проекта..."
                  className="biamino-input resize-none h-40 w-full"
                />
              ) : (
                <p className="whitespace-pre-wrap">{project.description}</p>
              )}
            </div>

            {/* Цель */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">🎯 Цель проекта</h2>
              {isEditing ? (
                <textarea
                  name="goal"
                  value={project.goal || ''}
                  onChange={handleChange}
                  placeholder="Какова основная цель этого проекта? (необязательно)"
                  className="biamino-input resize-none h-24 w-full"
                />
              ) : (
                <p className="whitespace-pre-wrap">{project.goal || 'Конкретная цель не определена'}</p>
              )}
            </div>
            
            {/* Требования */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Требования</h2>
              {isEditing ? (
                <textarea
                  name="requirements"
                  value={project.requirements || ''}
                  onChange={handleChange}
                  placeholder="Требования проекта..."
                  className="biamino-input resize-none h-24 w-full"
                />
              ) : (
                <p className="whitespace-pre-wrap">{project.requirements || 'Требования не указаны'}</p>
              )}
            </div>
            
            {/* Важные ссылки */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Важные ссылки</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newImportantLink.title}
                      onChange={e => setNewImportantLink({...newImportantLink, title: e.target.value})}
                      placeholder="Заголовок ссылки"
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
                      placeholder="Описание (необязательно)"
                      className="biamino-input w-full"
                    />
                    <button 
                      onClick={handleAddImportantLink}
                      disabled={!newImportantLink.title || !newImportantLink.url}
                      className="biamino-btn-outline w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Добавить ссылку
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
                              placeholder="Заголовок ссылки"
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
                          placeholder="Описание (необязательно)"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {(!project.importantLinks || project.importantLinks.length === 0) && (
                    <p className="text-muted-foreground text-center pt-2">Важные ссылки пока не добавлены</p>
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
                    <p className="text-muted-foreground">Важные ссылки не добавлены</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Инвентарь */}
            <div className="biamino-card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-3">Инвентарь</h2>
              
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inventoryItem}
                      onChange={e => setInventoryItem(e.target.value)}
                      placeholder="Добавить элемент инвентаря..."
                      className="biamino-input flex-grow"
                    />
                    <button 
                      onClick={handleAddInventoryItem}
                      className="biamino-btn-outline"
                    >
                      Добавить
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
                    <p className="text-muted-foreground">Элементы инвентаря еще не добавлены</p>
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
                    <p className="text-muted-foreground">Нет элементов инвентаря</p>
                  )}
                </>
              )}
            </div>
            
            {/* Комментарии */}
            {!isNewProject && (
              <CommentSection projectId={project.id} comments={project.comments} />
            )}
          </div>
          
          {/* Боковая панель */}
          <div>
            {/* Статус и метаданные */}
            <div className="biamino-card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-3">Детали</h3>
              
              <div className="space-y-4">
                {/* Статус */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Статус</div>
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
                      {getStatusTranslation(project.status)}
                    </div>
                  )}
                </div>
                
                {/* Вторичный статус - теперь можно ввести любой текст */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Вторичный статус</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="secondaryStatus"
                      value={project.secondaryStatus || ''}
                      onChange={handleChange}
                      placeholder="Введите любой статус"
                      className="biamino-input"
                    />
                  ) : (
                    <>
                      {project.secondaryStatus ? (
                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border-transparent">
                          {project.secondaryStatus}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Не указан</span>
                      )}
                    </>
                  )}
                </div>
                
                {/* Отдел */}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Отдел</div>
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
                    <div>{project.department === 'present' ? 'Настоящее' : 'Будущее'}</div>
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
                        <div className="text-muted-foreground">Нет GitHub URL</div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Даты */}
                {!isNewProject && (
                  <>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Создан</div>
                      <div>{formatDate(project.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Последнее обновление</div>
                      <div>{formatDate(project.updatedAt)}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Пользовательские поля */}
            <div className="biamino-card p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Пользовательские поля</h3>
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
                  {/* Добавление нового пользовательского поля */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        id="custom-field-name"
                        type="text"
                        value={newCustomField.name}
                        onChange={e => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Название поля"
                        className="biamino-input w-1/2"
                      />
                      <input
                        type="text"
                        value={newCustomField.value}
                        onChange={e => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Значение поля"
                        className="biamino-input w-1/2"
                      />
                    </div>
                    <button 
                      onClick={handleAddCustomField}
                      disabled={!newCustomField.name || !newCustomField.value}
                      className="biamino-btn-outline w-full text-sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Добавить поле
                    </button>
                  </div>
                  
                  {/* Существующие пользовательские поля */}
                  {project.customFields.map(field => (
                    <div key={field.id} className="space-y-2 pb-2 border-b last:border-0">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={field.name}
                          onChange={e => handleCustomFieldChange(field.id, 'name', e.target.value)}
                          placeholder="Название поля"
                          className="biamino-input w-1/2"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={e => handleCustomFieldChange(field.id, 'value', e.target.value)}
                          placeholder="Значение поля"
                          className="biamino-input w-1/2"
                        />
                      </div>
                      <button 
                        onClick={() => handleDeleteCustomField(field.id)}
                        className="text-sm text-destructive hover:text-destructive/90"
                      >
                        <Trash size={14} className="mr-1 inline-block" />
                        Удалить
                      </button>
                    </div>
                  ))}
                  
                  {project.customFields.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Нет пользовательских полей. Добавьте поля для хранения дополнительной информации.
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
                    <p className="text-muted-foreground">Нет пользовательских полей</p>
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
