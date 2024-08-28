// Dashboard.js
import { Navigate  } from 'react-router-dom';
import authService from '../service/loginService';

const Dashboard = () => {

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('user');
  //return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    isAuthenticated ? (
    <div>
      <h1>Welcome, {user.name ? user.name : 'User'}!</h1>
      <p>You are now logged in as an Authenticated USER!</p>
      <p>Your AccountCode is {user.accountcode}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
    ) : (
      <Navigate to="/login" />
    )
  )};

export default Dashboard;
