import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, usersAPI, ApiError } from "./api-client";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "PLAYER" | "ADMIN";
  goldCoins: number;
  sweepstakesCoins: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedAccessToken && savedUser) {
      setAccessToken(savedAccessToken);
      setRefreshToken(savedRefreshToken);
      const parsedUser = JSON.parse(savedUser);
      // Ensure numeric fields are properly typed
      if (parsedUser) {
        parsedUser.goldCoins = typeof parsedUser.goldCoins === 'number' ? parsedUser.goldCoins : 0;
        parsedUser.sweepstakesCoins = typeof parsedUser.sweepstakesCoins === 'number' ? parsedUser.sweepstakesCoins : 0;
      }
      setUser(parsedUser);
    }

    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, username: string) => {
    try {
      setError(null);
      const response: any = await authAPI.signup(email, password, username);

      const user = {
        ...response.user,
        goldCoins: typeof response.user.goldCoins === 'number' ? response.user.goldCoins : 0,
        sweepstakesCoins: typeof response.user.sweepstakesCoins === 'number' ? response.user.sweepstakesCoins : 0,
      };

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(user);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Signup failed";
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response: any = await authAPI.login(email, password);

      const user = {
        ...response.user,
        goldCoins: typeof response.user.goldCoins === 'number' ? response.user.goldCoins : 0,
        sweepstakesCoins: typeof response.user.sweepstakesCoins === 'number' ? response.user.sweepstakesCoins : 0,
      };

      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setUser(user);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const refreshBalance = async () => {
    if (!accessToken) return;

    try {
      const response: any = await usersAPI.getBalance(accessToken);
      const goldCoins = typeof response.goldCoins === 'number' ? response.goldCoins : 0;
      const sweepstakesCoins = typeof response.sweepstakesCoins === 'number' ? response.sweepstakesCoins : 0;

      setUser((prev) =>
        prev
          ? {
              ...prev,
              goldCoins,
              sweepstakesCoins,
            }
          : null,
      );

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            goldCoins,
            sweepstakesCoins,
          }),
        );
      }
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isLoading,
        error,
        signup,
        login,
        logout,
        refreshBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
