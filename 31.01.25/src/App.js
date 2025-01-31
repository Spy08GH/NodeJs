import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage';
import UserDetail from './components/UserDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/users/:userId" element={<UserDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
