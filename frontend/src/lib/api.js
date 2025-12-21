import axios from "axios";
import { BACKEND_API_URL, DEV_MODE, refreshToken } from "@/lib/utils";

const api = axios.create({baseURL: DEV_MODE ? BACKEND_API_URL : ""});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
				localStorage.removeItem("access");
				window.location.href = "/expired";
				return Promise.reject(error);
			}

			try {
				const newAccess = await refreshToken(refresh);
				if (newAccess) {
					originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
					return api(originalRequest);
				}
			} catch (err) {
				localStorage.removeItem("access");
				localStorage.removeItem("refresh");
				window.location.href = "/expired";
			}
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
