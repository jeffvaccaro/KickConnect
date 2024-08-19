// Dashboard.js
import React from 'react';
import authService from '../service/authService';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <div>
      <h1>Welcome, {user ? user.id : 'User'}!</h1>
      <p>You are now logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
