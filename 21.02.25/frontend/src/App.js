// frontend/src/App.js

import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fio, setFio] = useState('');
  const [phone, setPhone] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Функция для получения всех пользователей
  const fetchUsers = () => {
    fetch('http://localhost:5000/api/users')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.log(error));
  };

  // Загружаем пользователей при монтировании компонента
  useEffect(() => {
    fetchUsers();
  }, []);

  // Обработчик отправки формы для добавления пользователя
  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = {
      username,
      password,
      FIO: fio,
      phone,
    };

    // Отправляем запрос на добавление нового пользователя
    fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser),
    })
      .then(response => response.json())
      .then(data => {
        console.log('User added:', data);
        // После добавления нового пользователя обновляем список
        fetchUsers();

        // Очистка формы
        setUsername('');
        setPassword('');
        setFio('');
        setPhone('');
      })
      .catch(error => console.log('Error:', error));
  };

  // Обработчик отправки формы для логина
  const handleLogin = (event) => {
    event.preventDefault();

    const loginData = {
      username: loginUsername,
      password: loginPassword,
    };

    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          alert('Login successful');
        } else {
          alert(data.error || 'Login failed');
        }
      })
      .catch(error => console.log('Error:', error));
  };

  return (
    <div className="App">
      <h1>API Data</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            {item.username} - {item.FIO} - {item.phone}
          </li>
        ))}
      </ul>

      <h2>Add User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="FIO"
          value={fio}
          onChange={e => setFio(e.target.value)}
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button type="submit">Add User</button>
      </form>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={e => setLoginUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;
