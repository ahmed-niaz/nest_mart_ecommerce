"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authApi, User, LoginResponse } from "./api";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function checkAuth() {
    try {
      const token = Cookies.get("accessToken");
      if (token) {
        const response = await authApi.me();
        setUser(response.data);
      }
    } catch {
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const handleAuthResponse = (data: LoginResponse) => {
    Cookies.set("accessToken", data.data.accessToken, {
      expires: 15 / (24 * 60),
      path: "/",
    }); // 15 min
    Cookies.set("refreshToken", data.data.refreshToken, {
      expires: 7,
      path: "/",
    });
    setUser(data.data.user);
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    handleAuthResponse(response);
  };

  const register = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ) => {
    const response = await authApi.register({
      email,
      password,
      firstName,
      lastName,
    });
    handleAuthResponse(response);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      setUser(null);
      window.location.href = "/login";
    }
  };

  const googleLogin = async (credential: string) => {
    const response = await authApi.googleLogin(credential);
    handleAuthResponse(response);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, googleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
