"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface Candidate {
  id: string;
  candidate_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
  linkedin_url?: string;
  portfolio_url?: string;
  experience_years?: number;
  current_company?: string;
  current_position?: string;
  skills?: string;
  summary?: string;
}

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department: string;
  position: string;
  hire_date: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  role?: string;
  userType: "CANDIDATE" | "EMPLOYEE";
  status: string;
  candidate?: Candidate;
  employee?: Employee;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = () => {
      try {
        const candidateAuth = localStorage.getItem("candidateAuth");
        const employeeAuth = localStorage.getItem("employeeAuth");
        const legacyToken = localStorage.getItem("hr-auth-token");

        if (candidateAuth) {
          const { user: candidateUser } = JSON.parse(candidateAuth);
          setUser(candidateUser);
        } else if (employeeAuth) {
          const { user: employeeUser } = JSON.parse(employeeAuth);
          setUser(employeeUser);
        } else if (legacyToken) {
          // For legacy tokens, create a basic user object
          // This is a fallback for existing sessions
          const legacyUser = {
            id: "legacy-user",
            email: "legacy@user.com",
            userType: "EMPLOYEE" as const,
            role: "EMPLOYEE",
            status: "ACTIVE"
          };
          setUser(legacyUser);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);
    // Store based on user type
    if (user.userType === "CANDIDATE") {
      localStorage.setItem(
        "candidateAuth",
        JSON.stringify({
          user,
          token,
          authenticated: true,
          loginTime: new Date().toISOString(),
        })
      );
    } else {
      localStorage.setItem(
        "employeeAuth",
        JSON.stringify({
          user,
          token,
          authenticated: true,
          loginTime: new Date().toISOString(),
        })
      );
      // Also store in legacy format for backward compatibility
      localStorage.setItem("hr-auth-token", token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("candidateAuth");
    localStorage.removeItem("employeeAuth");
    localStorage.removeItem("hr-auth-token");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
