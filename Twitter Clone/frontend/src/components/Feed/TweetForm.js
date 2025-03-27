import React, { useState } from 'react';
import { createTweet } from '../../services/api';

function TweetForm({ onAddTweet }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newTweet = await createTweet({ content });
      onAddTweet(newTweet);
      setContent('');
    } catch (error) {
      console.error('Error creating tweet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="tweet-form">
      <div className="tweet-form-avatar">
        <div className="avatar-placeholder"></div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={280}
        ></textarea>
        <div className="tweet-form-footer">
          <span className="character-count">{280 - content.length}</span>
          <button type="submit" disabled={!content.trim() || isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Tweet'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TweetForm;