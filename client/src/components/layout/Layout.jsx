import React from 'react';
import Navbar from './Navbar.jsx';
import { useAuth } from "../../context/AuthContext.jsx";

const Layout = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
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