// contexts/ThemeContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { theme as antTheme } from "antd";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  algorithm: typeof antTheme.defaultAlgorithm;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    // Load theme preference from localStorage on mount
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme === "dark" || savedTheme === "light") {
      setMode(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  const algorithm =
    mode === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, algorithm }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
