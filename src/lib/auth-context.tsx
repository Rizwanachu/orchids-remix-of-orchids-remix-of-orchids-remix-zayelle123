"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface StoredUser {
  email: string;
  name: string;
  password: string;
  isAdmin: boolean;
}

const USERS_KEY = "zayelle-users";
const SESSION_KEY = "zayelle-session";

// Default admin account
const DEFAULT_ADMIN: StoredUser = {
  email: "rizwanachoo123@gmail.com",
  password: "rizU@1212",
  name: "Admin",
  isAdmin: true,
};

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN];
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (data) return JSON.parse(data);
  } catch {}
  return [DEFAULT_ADMIN];
}

function saveStoredUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        setUser(JSON.parse(session));
      }
      // Ensure admin account exists
      const users = getStoredUsers();
      if (!users.find((u) => u.email === DEFAULT_ADMIN.email)) {
        saveStoredUsers([DEFAULT_ADMIN, ...users]);
      }
    } catch {}
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) {
      return { success: false, error: "Invalid email or password" };
    }
    const sessionUser: User = { email: found.email, name: found.name, isAdmin: found.isAdmin };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true };
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    const users = getStoredUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists" };
    }
    const newUser: StoredUser = { email, name, password, isAdmin: false };
    saveStoredUsers([...users, newUser]);
    const sessionUser: User = { email, name, isAdmin: false };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
