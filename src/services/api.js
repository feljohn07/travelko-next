import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.travelkoph.com/",
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

// Auto-redirect on 401 (excluding login / auth endpoints)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const url = error.config?.url || "";
        const isAuthRequest =
          url.includes("/auth/coordinator/login") ||
          url.includes("/auth/admin/login") ||
          url.includes("/auth/login");

        if (!isAuthRequest) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_role");
          localStorage.removeItem("auth_user");
          localStorage.removeItem("profilePicture");

          sessionStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_role");
          sessionStorage.removeItem("auth_user");
          sessionStorage.removeItem("profilePicture");

          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
