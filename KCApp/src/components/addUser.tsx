// register.tsx
import { useState, useEffect  } from 'react';
import userService from '../service/userService';
import { useNavigate } from 'react-router-dom';

const addUser = () => {
  const [accountcode, setAccountCode] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.accountcode) {
      setAccountCode(user.accountcode);
    }
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await userService.adduser(accountcode, username, email, phone, "", password);
      // Redirect to a protected route
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <form onSubmit={handleAdd}>
      <input type="text" value={accountcode} onChange={(e) => setAccountCode(e.target.value)} placeholder="accountcode" />
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
      <button type="submit">Add User</button>
    </form>
  );
};

export default addUser;
