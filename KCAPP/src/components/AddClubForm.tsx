// src/components/AddClubForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

const AddClubForm = () => {
  const [clubName, setClubName] = useState('');
  const [clubAddress, setAddress] = useState('');
  const [clubPhoneNumber, setPhoneNumber] = useState('');
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: []
  });

  const handleAddClass = (day) => {
    const className = prompt(`Enter class name for ${day}:`);
    const time = prompt(`Enter class time for ${day}:`);
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: [...prevSchedule[day], { className, time }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newClub = { clubName, clubAddress, clubPhoneNumber, schedule };

    try {
      const response = await axios.post('http://localhost:5000/clubs', newClub);
      console.log('Club added:', response.data);
    } catch (error) {
      console.error('Error adding club:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Club Name:</label>
        <input type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} required />
      </div>
      <div>
        <label>Club Address:</label>
        <input type="text" value={clubAddress} onChange={(e) => setAddress(e.target.value)} required />
      </div>
      <div>
        <label>Phone Number:</label>
        <input type="text" value={clubPhoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
      </div>
      <div>
        <label>Schedule:</label>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
          <div key={day}>
            <h4>{day}</h4>
            <button type="button" onClick={() => handleAddClass(day)}>Add Class</button>
            <ul>
              {schedule[day].map((cls, index) => (
                <li key={index}>{cls.className} at {cls.time}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button type="submit">Add Club</button>
    </form>
  );
};

export default AddClubForm;
