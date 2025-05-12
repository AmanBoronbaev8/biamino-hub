
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { Download, Upload, RefreshCw } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { exportData, importData, refreshData } = useProjects();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setTimeout(() => setRefreshing(false), 500);
  };
  
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            importData(content);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <Layout>
      <section className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Добро пожаловать в Центр Проектов Biamino
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12">
          Отслеживайте и управляйте всеми проектами Biamino, их статусами и прогрессом
        </p>

        {isAuthenticated ? (
          <>
            <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto mb-10">
              <Link
                to="/projects/present"
                className="flex flex-col items-center justify-center p-10 rounded-2xl bg-gradient-to-br from-biamino-500 to-biamino-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="text-6xl mb-4" role="img" aria-label="Текущие проекты">
                  🚀
                </span>
                <h2 className="text-2xl font-bold mb-2">Текущие</h2>
                <p className="opacity-80">Активные проекты</p>
              </Link>
              
              <Link
                to="/projects/future"
                className="flex flex-col items-center justify-center p-10 rounded-2xl bg-gradient-to-br from-secondary to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="text-6xl mb-4" role="img" aria-label="Будущие проекты">
                  🔮
                </span>
                <h2 className="text-2xl font-bold mb-2">Будущие</h2>
                <p className="opacity-80">Запланированные проекты</p>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleRefresh} 
                className="biamino-btn-outline flex items-center gap-2"
                disabled={refreshing}
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Обновить данные
              </button>
              
              {isAdmin && (
                <>
                  <button 
                    onClick={exportData} 
                    className="biamino-btn-outline flex items-center gap-2"
                  >
                    <Download size={18} />
                    Экспортировать данные
                  </button>
                  <button 
                    onClick={handleImport} 
                    className="biamino-btn-outline flex items-center gap-2"
                  >
                    <Upload size={18} />
                    Импортировать данные
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-lg mb-6">
              Пожалуйста, войдите для доступа к центру проектов
            </p>
            <Link to="/login" className="biamino-btn-primary">
              Войти
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
