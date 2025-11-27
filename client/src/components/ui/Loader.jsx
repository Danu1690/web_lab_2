import React from 'react';

const Loader = ({ size = 'medium', text = 'Загрузка...' }) => {
  const sizeClasses = {
    small: 'loader-sm',
    medium: 'loader-md',
    large: 'loader-lg'
  };

  return (
    <div className={`loader-container ${sizeClasses[size]}`}>
      <div className="loader-spinner"></div>
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
};

export default Loader;