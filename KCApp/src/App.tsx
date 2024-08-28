import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import AddUser from './components/addUser';
import ListUsers from './components/listUsers';
import PrivateRoute from './components/privateRoute';
import Dashboard from './components/dashboard';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    axios.get(`${apiUrl}/api`)
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, [apiUrl]);

  return (
    <div>
      <h1>Welcome to KickConnect</h1>
      <p>{message}</p> {/* Use the message state variable here */}    
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/addUser" element={<AddUser />} />
        <Route path="/listUsers" element={<ListUsers />} />
        {/* <Route path="/protected" element={<PrivateRoute component={ProtectedComponent} />} /> */}
        <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
      </Routes>
    </Router>    
    </div>
  );
}

export default App;
