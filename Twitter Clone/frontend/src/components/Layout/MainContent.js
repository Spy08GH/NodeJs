import React, { useState, useEffect } from 'react';
import TweetForm from '../Feed/TweetForm';
import TweetList from '../Feed/TweetList';
import { getTweets, getFollowingTweets } from '../../services/api';

function MainContent({ activeTab, setActiveTab }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTweets = async () => {
      setLoading(true);
      try {
        let response;
        if (activeTab === 'for-you') {
          response = await getTweets();
        } else {
          response = await getFollowingTweets();
        }
        setTweets(response);
      } catch (error) {
        console.error('Error fetching tweets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTweets();
  }, [activeTab]);
  
  const handleAddTweet = (newTweet) => {
    setTweets([newTweet, ...tweets]);
  };
  
  return (
    <div className="main-content">
      <header>
        <h1>Home</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'for-you' ? 'active' : ''}
            onClick={() => setActiveTab('for-you')}
          >
            For you
          </button>
          <button 
            className={activeTab === 'following' ? 'active' : ''}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>
      </header>
      
      <TweetForm onAddTweet={handleAddTweet} />
      
      {loading ? (
        <div className="loading">Loading tweets...</div>
      ) : (
        <TweetList tweets={tweets} />
      )}
    </div>
  );
}

export default MainContent;
