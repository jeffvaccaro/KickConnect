// userService.js
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL +'/user/';

const addUser = (accountcode: string, name: string,  email: string, phone: string, phone2: string, password: string) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = user.token;

    return axios.post(apiUrl + 'add-user', { accountcode, name, email, phone, phone2, password, roleId: 4  }, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
    })
    .then(response => {
        if (response.data.token) {
        console.log(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        }
      return response.data;
    });
};

const getUsers = () => {
    const accessToken = sessionStorage.getItem('jwt_access_token');
    const accountCode = sessionStorage.getItem('account_code');

    return axios.get(`${apiUrl}get-users`, {
      params: { accountCode }, // Include accountCode as a query parameter
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      console.log(response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      throw error;
    });
  };

const getUserById = (userId : number) => {

    const accessToken = sessionStorage.getItem('jwt_access_token');
    // const accountCode = sessionStorage.getItem('account_code');

    return axios.get(`${apiUrl}get-user-by-id`, {
      params: { userId }, // Include accountCode as a query parameter
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      // console.log(response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching user:', error);
      throw error;
    });
  };


export default {
  addUser,
  getUsers,
  getUserById
};
