"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    token: null,
    role: null,
    user: null,
    profilePicture: null,
    isLoading: true,
  });

  // Read from localStorage or sessionStorage on mount (client-side only)
  useEffect(() => {
    let storage = null;
    if (typeof window !== "undefined") {
      if (localStorage.getItem("auth_token")) {
        storage = localStorage;
      } else if (sessionStorage.getItem("auth_token")) {
        storage = sessionStorage;
      }
    }

    if (storage) {
      const token = storage.getItem("auth_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuth({
        isLoggedIn: true,
        token,
        role: storage.getItem("auth_role"),
        user: (() => {
          try {
            return JSON.parse(storage.getItem("auth_user") || "null");
          } catch {
            return null;
          }
        })(),
        profilePicture: storage.getItem("profilePicture"),
        isLoading: false,
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuth((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const login = (token, role, user, profilePicture = null, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    // Clear the other storage to avoid conflict
    otherStorage.removeItem("auth_token");
    otherStorage.removeItem("auth_role");
    otherStorage.removeItem("auth_user");
    otherStorage.removeItem("profilePicture");

    storage.setItem("auth_token", token);
    storage.setItem("auth_role", role);
    storage.setItem("auth_user", JSON.stringify(user));
    if (profilePicture) {
      storage.setItem("profilePicture", profilePicture);
    }
    setAuth({ isLoggedIn: true, token, role, user, profilePicture, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("profilePicture");

    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_role");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("profilePicture");

    setAuth({
      isLoggedIn: false,
      token: null,
      role: null,
      user: null,
      profilePicture: null,
      isLoading: false,
    });
  };

  const updateProfilePicture = (url) => {
    if (localStorage.getItem("profilePicture") !== null) {
      localStorage.setItem("profilePicture", url);
    }
    if (sessionStorage.getItem("profilePicture") !== null) {
      sessionStorage.setItem("profilePicture", url);
    }
    setAuth((prev) => ({
      ...prev,
      profilePicture: url,
      user: prev.user ? { ...prev.user, profileImageUrl: url, profilePicture: url } : prev.user,
    }));
  };

  const updateUser = (userData) => {
    let storage = null;
    if (typeof window !== "undefined") {
      if (localStorage.getItem("auth_token")) {
        storage = localStorage;
      } else if (sessionStorage.getItem("auth_token")) {
        storage = sessionStorage;
      }
    }
    setAuth((prev) => {
      const newUser = typeof userData === "function" ? userData(prev.user) : { ...(prev.user || {}), ...userData };
      if (storage) {
        storage.setItem("auth_user", JSON.stringify(newUser));
      }
      return { ...prev, user: newUser };
    });
  };

  return (
    <AuthContext.Provider
      value={{ ...auth, login, logout, updateProfilePicture, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
