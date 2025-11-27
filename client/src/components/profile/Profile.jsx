import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import Button from '../ui/Button.jsx';

const Profile = () => {
  const { user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGenderText = (gender) => {
    return gender === 'male' ? 'Мужской' : 'Женский';
  };

  const getAgeGroupText = (ageGroup) => {
    return ageGroup === 'over18' ? '18 лет или больше' : 'Меньше 18 лет';
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
        {/* Приветствие */}
        <div className="welcome-section">
          <h2>
            👋 Привет, {user.first_name} {user.last_name}!
          </h2>
          <p>Рады видеть вас в вашем личном кабинете</p>
        </div>

        {/* Основная информация */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div className="profile-info">
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
              <div className="info-item">
                <span className="info-label">Пол:</span>
                <span className="info-value">{getGenderText(user.gender)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Возраст:</span>
                <span className="info-value">{getAgeGroupText(user.age_group)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">ID:</span>
                <span className="info-value">{user.id}</span>
              </div>
              {user.created_at && (
                <div className="info-item">
                  <span className="info-label">Зарегистрирован:</span>
                  <span className="info-value">{formatDate(user.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Настройки */}
        <div className="settings-section">
          <h3>Настройки</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <span>Текущая тема:</span>
              <span className="setting-value">
                {isDarkTheme ? 'Тёмная' : 'Светлая'}
              </span>
            </div>
            <div className="setting-item">
              <span>Статус аккаунта:</span>
              <span className="setting-value active">Активен</span>
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className="profile-actions">
          <Button
            variant="danger"
            onClick={handleLogout}
            className="logout-btn"
          >
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;