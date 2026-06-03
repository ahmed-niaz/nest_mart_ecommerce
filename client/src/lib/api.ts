import axios from "axios";

import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  address?: string;
  city?: string;
  postalCode?: string;
}

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  refresh: async () => {
    const response = await api.post<LoginResponse>("/auth/refresh");
    return response.data;
  },

  me: async () => {
    const response = await api.get<{ success: boolean; data: User }>(
      "/auth/me",
    );
    return response.data;
  },

  googleLogin: async (credential: string) => {
    const response = await api.post("/auth/google", { credential });
    return response.data;
  },
};
