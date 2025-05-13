import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
});

// Using an interceptor to handle response errors
// 401 - should redirect to login/clear current user context, etc.
api.interceptors.response.use(
	(res) => {
		return res;
	},
	(err) => {
		if (err.response?.status === 401) {
			// TODO: change to actual logic
			console.error("Unauthorized - 401", err.response?.data);
		}

		return Promise.reject(err);
	},
);

export default api;
