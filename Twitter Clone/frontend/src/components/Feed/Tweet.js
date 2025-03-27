import React from 'react';

function Tweet({ tweet }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  return (
    <div className="tweet">
      <div className="tweet-avatar">
        <div className="avatar-placeholder"></div>
      </div>
      <div className="tweet-content">
        <div className="tweet-header">
          <span className="tweet-author">{tweet.username}</span>
          <span className="tweet-date">{formatDate(tweet.created_at)}</span>
        </div>
        <div className="tweet-text">{tweet.content}</div>
        <div className="tweet-actions">
          <button><i className="far fa-comment"></i></button>
          <button><i className="fas fa-retweet"></i></button>
          <button><i className="far fa-heart"></i></button>
          <button><i className="far fa-share-square"></i></button>
        </div>
      </div>
    </div>
  );
}

export default Tweet;