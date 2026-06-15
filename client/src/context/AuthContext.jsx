'use client'

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

import { API_BASE, API_HOST } from "../config";
axios.defaults.baseURL = API_HOST;
axios.defaults.timeout = 60000; // Increased to 60s for heavy AI tasks
axios.defaults.withCredentials = true; // Support httpOnly cookies across origins
console.log("🔌 AUTH CONTEXT INITIALIZED. API BASE URL:", axios.defaults.baseURL);

const AuthContext = createContext({
  user: null,
  login: () => { },
  logout: () => { },
  register: () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error("Login failed:", error);
      let msg = error.response?.data?.message || "Login failed";
      if (error.code === "ECONNABORTED") msg = "Server timeout. Please try again.";
      else if (!error.response) msg = "Network error. Please check your connection.";
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      console.log("Registration response:", response.data);
      return { success: true };
    } catch (error) {
      console.error("Registration full error object:", error);
      if (error.response) {
        console.error("Registration error response data:", error.response.data);
        console.error("Registration error response status:", error.response.status);
      } else if (error.request) {
        console.error("Registration error request:", error.request);
      } else {
        console.error("Registration error message:", error.message);
      }
      let msg = error.response?.data?.message || "Registration failed";
      if (error.code === "ECONNABORTED") msg = "Server timeout. Please try again.";
      else if (!error.response) msg = "Network error. Please check your connection or backend status.";
      
      return { success: false, message: msg };
    }
  };
  const loginWithToken = (user, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (e) {
      console.error("Logout request failed:", e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loginWithToken, updateUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
