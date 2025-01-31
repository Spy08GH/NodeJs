import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`https://json-placeholder.mock.beeceptor.com/users/${userId}`)
      .then(response => response.json())
      .then(data => setUser(data))
      .catch(error => console.error('Error fetching user details:', error));
  }, [userId]);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <p>Website: {user.website}</p>
      <img src={user.photo} alt={user.name} />
    </div>
  );
}

export default UserDetail;
