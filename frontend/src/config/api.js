const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://resume-analyzer-pro-zw6k.onrender.com"
).replace(/\/+$/, "");

export default API_BASE_URL;