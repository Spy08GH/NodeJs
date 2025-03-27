import React, { useState } from 'react';
import Sidebar from './Layout/Sidebar';
import MainContent from './Layout/MainContent';

function Home() {
  const [activeTab, setActiveTab] = useState('for-you');
  
  return (
    <div className="home-container">
      <Sidebar />
      <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default Home;