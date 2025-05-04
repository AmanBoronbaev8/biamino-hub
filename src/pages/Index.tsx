
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
          Welcome to the Biamino Project Hub
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12">
          Track and manage all Biamino projects, their statuses, and progress
        </p>

        {isAuthenticated ? (
          <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto">
            <Link
              to="/projects/present"
              className="flex flex-col items-center justify-center p-10 rounded-2xl bg-gradient-to-br from-biamino-500 to-biamino-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span className="text-6xl mb-4" role="img" aria-label="Present projects">
                🚀
              </span>
              <h2 className="text-2xl font-bold mb-2">Present</h2>
              <p className="opacity-80">Current active projects</p>
            </Link>
            
            <Link
              to="/projects/future"
              className="flex flex-col items-center justify-center p-10 rounded-2xl bg-gradient-to-br from-secondary to-blue-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span className="text-6xl mb-4" role="img" aria-label="Future projects">
                🔮
              </span>
              <h2 className="text-2xl font-bold mb-2">Future</h2>
              <p className="opacity-80">Upcoming and planned projects</p>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-lg mb-6">
              Please log in to access the project hub
            </p>
            <Link to="/login" className="biamino-btn-primary">
              Login
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
