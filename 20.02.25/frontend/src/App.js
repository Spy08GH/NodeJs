import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [FIO, setFIO] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/users')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newUser = {
      username,
      password,
      FIO,
      phone,
    };

    fetch('http://127.0.0.1:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        setUsername('');
        setPassword('');
        setFIO('');
        setPhone('');
        // Обновляем список пользователей после добавления
        fetch('http://127.0.0.1:5000/api/users')
          .then(response => response.json())
          .then(data => setData(data));
      })
      .catch(error => console.error('Error:', error));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Users from Flask API</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.username} - {item.FIO} - {item.phone}</li>
        ))}
      </ul>

      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="FIO"
          value={FIO}
          onChange={(e) => setFIO(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default App;
