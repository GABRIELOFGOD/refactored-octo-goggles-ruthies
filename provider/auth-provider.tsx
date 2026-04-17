"use client";

import { IUser } from "@/types";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { ReactNode } from "react";

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getUser = async () => {
    try {
      const request = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const response = await request.json();
      if (!request.ok) throw new Error(response.error);
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  const logOut = () => {
    localStorage.removeItem("token");
    location.reload();
  }

  useEffect(() => {
    getUser();
  }, []);
  
  return (
    <AuthContext.Provider
      value={{ user, isLoading, logOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}