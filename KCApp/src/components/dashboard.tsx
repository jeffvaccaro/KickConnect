// Dashboard.js
import React from 'react';
import { Navigate  } from 'react-router-dom';
import authService from '../service/authService';

const Dashboard = () => {

  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = !!localStorage.getItem('user');
  //return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    isAuthenticated ? (
    <div>
      <h1>Welcome, {user ? user.id : 'User'}!</h1>
      <p>You are now logged in as an Authenticated USER!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
    ) : (
      <Navigate to="/login" />
    )
  )};

export default Dashboard;
