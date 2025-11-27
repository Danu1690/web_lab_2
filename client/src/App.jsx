import React from 'react'
import './styles/globals.css'

function App() {
  return (
    <div style={{ 
      padding: '2rem',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>✅ React + Vite работает!</h1>
      <p>Фронтенд успешно запущен на localhost:3000</p>
      <div style={{ marginTop: '2rem' }}>
        <a 
          href="/login" 
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            margin: '0 1rem'
          }}
        >
          Вход
        </a>
        <a 
          href="/register"
          style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            margin: '0 1rem'
          }}
        >
          Регистрация
        </a>
      </div>
    </div>
  )
}

export default App