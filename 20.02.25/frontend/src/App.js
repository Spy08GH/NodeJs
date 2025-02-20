import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Сделаем запрос к бэкенду, используя URL Flask API
    fetch('http://localhost:5000/api/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data: ', error));
  }, []);

  return (
    <div className="App">
      <h1>Data from Flask API</h1>
      <ul>
        {data.length > 0 ? (
          data.map(item => (
            <li key={item.id}>{item.name}</li>
          ))
        ) : (
          <p>Loading data...</p>
        )}
      </ul>
    </div>
  );
}

export default App;
