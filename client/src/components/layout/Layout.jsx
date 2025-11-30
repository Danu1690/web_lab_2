import React from 'react';
import Navbar from './Navbar.jsx';
import { useAuth } from "../../context/AuthContext.jsx";

const Layout = ({ children }) => {
  const { loading, authChecked } = useAuth();

  // Показываем загрузку только до первой проверки
  if (loading && !authChecked) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="loading">Загрузка приложения...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      <main className="container">
        {children}
      </main>
    </div>
  );
};

export default Layout;