import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Личный кабинет</h1>
        <p>Добро пожаловать в ваш профиль</p>
      </div>

      <div className="profile-content">
        <div className="welcome-section">
          <h2>👋 Привет, {user.first_name} {user.last_name}!</h2>
          <p>Рады видеть вас в вашем личном кабинете</p>
        </div>

        <div className="profile-card">
          <h3>Основная информация</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Имя:</span>
              <span className="info-value">{user.first_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Фамилия:</span>
              <span className="info-value">{user.last_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Логин:</span>
              <span className="info-value">{user.login}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;