import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authAPI } from '../../services/auth.js';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    if (showAllUsers) {
      loadAllUsers();
    }
  }, [showAllUsers]);

  const loadAllUsers = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getAllUsers();
      if (response.success) {
        setAllUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Ошибка загрузки списка пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleAllUsers = () => {
    setShowAllUsers(!showAllUsers);
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
            <div className="info-item">
              <span className="info-label">Пол:</span>
              <span className="info-value">
                {user.gender === 'male' ? 'Мужской' : 'Женский'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Возраст:</span>
              <span className="info-value">
                {user.age_group === 'over18' ? '18 лет и больше' : 'Меньше 18 лет'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Дата регистрации:</span>
              <span className="info-value">
                {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        {/* Секция всех пользователей */}
        <div className="profile-card">
          <div className="users-section-header">
            <h3>Все пользователи системы</h3>
            <button
              onClick={toggleAllUsers}
              className="toggle-users-btn"
            >
              {showAllUsers ? 'Скрыть' : 'Показать'} список
            </button>
          </div>

          {showAllUsers && (
            <div className="users-list">
              {loading ? (
                <div className="loading">Загрузка пользователей...</div>
              ) : (
                <>
                  <div className="users-stats">
                    Всего пользователей: <strong>{allUsers.length}</strong>
                  </div>
                  
                  {allUsers.length > 0 ? (
                    <div className="users-table">
                      <div className="users-table-header">
                        <div>Имя</div>
                        <div>Фамилия</div>
                        <div>Email</div>
                        <div>Логин</div>
                        <div>Дата регистрации</div>
                      </div>
                      
                      {allUsers.map(userItem => (
                        <div 
                          key={userItem.id} 
                          className={`users-table-row ${userItem.id === user.id ? 'current-user' : ''}`}
                        >
                          <div>
                            {userItem.first_name}
                            {userItem.id === user.id && ' (Вы)'}
                          </div>
                          <div>{userItem.last_name}</div>
                          <div>{userItem.email}</div>
                          <div>{userItem.login}</div>
                          <div>
                            {new Date(userItem.created_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-users">Пользователи не найдены</div>
                  )}
                </>
              )}
            </div>
          )}
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