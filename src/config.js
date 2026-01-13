const API_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:5000'
    : 'https://my-project-backend-wqyy.onrender.com';

export default API_URL;
