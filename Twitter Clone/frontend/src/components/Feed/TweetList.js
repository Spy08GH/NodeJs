import React from 'react';
import Tweet from './Tweet';

function TweetList({ tweets }) {
  return (
    <div className="tweet-list">
      {tweets.length === 0 ? (
        <div className="no-tweets">No tweets to display</div>
      ) : (
        tweets.map(tweet => <Tweet key={tweet.id} tweet={tweet} />)
      )}
    </div>
  );
}

export default TweetList;