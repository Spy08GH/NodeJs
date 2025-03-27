import { getAuthToken } from './auth';

const API_URL = 'http://localhost:5000/api';

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'An unknown error occurred',
    }));
    throw new Error(error.error || 'An unknown error occurred');
  }
  
  return response.json();
};

export const getTweets = () => {
  return fetchWithAuth('/tweets');
};

export const getFollowingTweets = () => {
  return fetchWithAuth('/tweets/following');
};

export const createTweet = (data) => {
  return fetchWithAuth('/tweets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};