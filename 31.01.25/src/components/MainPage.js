import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function MainPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('https://json-placeholder.mock.beeceptor.com/users')
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  return (
    <div>
      <h1>Список пользователей</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MainPage;
