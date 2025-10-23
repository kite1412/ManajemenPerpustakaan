import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// If a token was stored (from API login), set Authorization header for axios
const token = localStorage.getItem('api_token');
if (token) {
	window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
