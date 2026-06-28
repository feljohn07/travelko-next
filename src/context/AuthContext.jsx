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
  });

  // Read from localStorage on mount (client-side only)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      setAuth({
        isLoggedIn: true,
        token,
        role: localStorage.getItem("auth_role"),
        user: (() => {
          try {
            return JSON.parse(localStorage.getItem("auth_user") || "null");
          } catch {
            return null;
          }
        })(),
        profilePicture: localStorage.getItem("profilePicture"),
      });
    }
  }, []);

  const login = (token, role, user, profilePicture = null) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_user", JSON.stringify(user));
    if (profilePicture) localStorage.setItem("profilePicture", profilePicture);
    setAuth({ isLoggedIn: true, token, role, user, profilePicture });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      isLoggedIn: false,
      token: null,
      role: null,
      user: null,
      profilePicture: null,
    });
  };

  const updateProfilePicture = (url) => {
    localStorage.setItem("profilePicture", url);
    setAuth((prev) => ({ ...prev, profilePicture: url }));
  };

  return (
    <AuthContext.Provider
      value={{ ...auth, login, logout, updateProfilePicture }}
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
