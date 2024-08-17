import { useEffect, useState } from 'react';
import './App.css';
import AddClubForm from './components/AddClubForm';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/clubs') // Update the URL to match your backend endpoint
      .then((response) => response.json())
      .then((data) => setData(data));
  }, []);

  return (
    <div>
      <h1>Add a New Club</h1>
      <AddClubForm />
      <h1>Data from API:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
