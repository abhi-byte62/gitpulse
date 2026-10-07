import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import { RepositoryDetailsPage } from './pages/RepositoryDetailsPage';

export const App: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary selection:bg-accent/20 selection:text-accent">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/u/:username" element={<DeveloperDashboard />} />
          <Route path="/u/:username/repo/:repo" element={<RepositoryDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};
