// roleService.js
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL +'/role/';


const getRoles = () => {
    const accessToken = sessionStorage.getItem('jwt_access_token');
    //const accountCode = sessionStorage.getItem('account_code');

    return axios.get(`${apiUrl}get-roles`, {
      //params: { accountCode }, // Include accountCode as a query parameter
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      //console.log(response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Error fetching Roles:', error);
      throw error;
    });
  };

export default {
  getRoles
};
