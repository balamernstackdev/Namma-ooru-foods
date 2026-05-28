export const API_URL = typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://api.nammaorrufoods.com')
    : (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.nammaorrufoods.com');

// export const API_URL = 'https://api.nammaorrufoods.com'
