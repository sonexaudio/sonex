import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
});

// Check for a client token in the cookies and set it as bearer token if it exists
api.interceptors.request.use((config) => {
	const clientToken = localStorage.getItem("clientAccess");
	if (clientToken) {
		console.log("Setting client token for API requests");
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${clientToken}`;
	}
	return config;
});

// Handle logout and clear client token
api.interceptors.response.use((response) => {
	if (response.data?.logout) {
		localStorage.removeItem("clientAccess");
	}
	return response;
});

export default api;
