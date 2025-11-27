import React from 'react';
import Navbar from './Navbar.jsx';

const Layout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <main style={{ padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;