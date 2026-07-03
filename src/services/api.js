import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelko.site/",
});

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
      : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_role");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("profilePicture");

        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_role");
        sessionStorage.removeItem("auth_user");
        sessionStorage.removeItem("profilePicture");

        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
