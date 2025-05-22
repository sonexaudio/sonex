import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
	withCredentials: true,
});

let onSessionExpired: ((message: string) => void) | null = null;

export const setSessionExpiredHandler = (
	handler: (message: string) => void,
) => {
	onSessionExpired = handler;
};

// Using an interceptor to handle response errors
// 401 - should redirect to login/clear current user context, etc.
api.interceptors.response.use(
	(res) => {
		return res;
	},
	(err) => {
		const message = err.response?.data?.message;

		if (
			err.response?.status === 401 &&
			message === "Session expired or user no longer exists."
		) {
			if (onSessionExpired) {
				onSessionExpired(message);
			}
		}

		return Promise.reject(err);
	},
);

export default api;
