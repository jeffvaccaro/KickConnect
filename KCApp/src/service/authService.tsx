// authService.js
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL +'/auth/';

const register = (username, password) => {
  return axios.post(apiUrl + 'register', { username, password });
};

const login = (username, password) => {
  return axios.post(apiUrl + 'login', { username, password })
    .then(response => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('user');
};

export default {
  register,
  login,
  logout,
};
