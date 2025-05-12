
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  
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
