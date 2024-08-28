// authService.js
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL +'/login/';


const login = (email: string, password: string) => {
  return axios.post(apiUrl + 'user-login', { email, password })
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
  login,
  logout,
};
