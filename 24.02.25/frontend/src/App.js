// frontend/src/App.js

import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000'); // Подключаемся к серверу

function App() {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fio, setFio] = useState('');
  const [phone, setPhone] = useState('');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Для проверки, авторизован ли пользователь

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

    // Получаем сообщения в реальном времени
    socket.on('receive_message', (data) => {
      setMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Обработчик отправки сообщения
  const handleSendMessage = () => {
    if (message.trim() === '') return;

    const messageData = {
      username: loginUsername,
      message: message
    };

    // Отправляем сообщение на сервер
    socket.emit('send_message', messageData);
    setMessage(''); // Очищаем поле ввода
  };

  // Обработчик отправки формы для добавления пользователя
  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = {
      username,
      password,
      FIO: fio,
      phone,
    };

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
        fetchUsers();
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
          setIsLoggedIn(true);  // После успешного логина показываем чат
        } else {
          alert(data.error || 'Login failed');
        }
      })
      .catch(error => console.log('Error:', error));
  };

  return (
    <div className="App">
      <h1>Chat App</h1>

      {/* Форма для логина */}
      {!isLoggedIn && (
        <div className="login-form">
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
      )}

      {/* Чат, если пользователь авторизован */}
      {isLoggedIn && (
        <div className="chat-container">
          <div className="chat-window">
            <div className="messages">
              <ul>
                {messages.map((msg, index) => (
                  <li key={index}>
                    <strong>{msg.username}: </strong> {msg.message}
                  </li>
                ))}
              </ul>
            </div>

            <div className="input-container">
              <input
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default App;
