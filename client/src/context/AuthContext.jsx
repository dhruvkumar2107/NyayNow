'use client'

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

import { API_BASE, API_HOST } from "../config";
axios.defaults.baseURL = API_HOST;
axios.defaults.timeout = 60000;
axios.defaults.withCredentials = true;
// Required by the server's CSRF middleware — browsers cannot set this on
// cross-origin requests without CORS approval, blocking CSRF attacks.
axios.defaults.headers.common['X-CSRF-Protection'] = '1';

const AuthContext = createContext({
  user: null,
  login: () => { },
  logout: () => { },
  register: () => { },
});

// Module-level state for the refresh queue (survives re-renders)
let _isRefreshing = false;
let _refreshQueue = [];

function _processQueue(error) {
  _refreshQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
  _refreshQueue = [];
}

// Paths where a 401 means bad credentials, not an expired token
const SKIP_REFRESH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

axios.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    const isAuthError = error.response?.status === 401;
    const alreadyRetried = original._retry;
    const isSkipped = SKIP_REFRESH_PATHS.some(p => original.url?.includes(p));

    if (!isAuthError || alreadyRetried || isSkipped) return Promise.reject(error);

    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject });
      }).then(() => axios(original)).catch(e => Promise.reject(e));
    }

    original._retry = true;
    _isRefreshing = true;

    try {
      await axios.post('/api/auth/refresh');
      _processQueue(null);
      return axios(original);
    } catch (refreshErr) {
      _processQueue(refreshErr);
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      _isRefreshing = false;
    }
  }
);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore UI state from localStorage; actual auth is via httpOnly cookie
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { user } = response.data;

      // Store only user metadata for UI; auth is via httpOnly cookie set by server
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true, user };
    } catch (error) {
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
    // token is set as httpOnly cookie by server; store only user metadata
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (e) {
      // Proceed with local logout even if server call fails
    }
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const updateUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loginWithToken, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
