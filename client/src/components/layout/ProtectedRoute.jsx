import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, authChecked } = useAuth();

  // Показываем загрузку только до первой проверки аутентификации
  if (loading && !authChecked) {
    return <div className="loading">Проверка авторизации...</div>;
  }

  // Если проверка завершена и пользователь не аутентифицирован - редирект
  if (!isAuthenticated && authChecked) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;