import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../services/auth';

function Sidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };
  
  return (
    <div className="sidebar">
      <div className="logo">
        <span>SocialX</span>
      </div>
      <nav>
        <ul>
          <li className="active"><a href="#"><i className="fas fa-home"></i> Home</a></li>
          <li><a href="#"><i className="fas fa-search"></i> Explore</a></li>
          <li><a href="#"><i className="fas fa-bell"></i> Notifications</a></li>
          <li><a href="#"><i className="fas fa-envelope"></i> Messages</a></li>
          <li><a href="#"><i className="fas fa-user"></i> Profile</a></li>
        </ul>
      </nav>
      <button className="tweet-button">Tweet</button>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Sidebar;