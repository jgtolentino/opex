// components/Providers.tsx
"use client";

import { ReactNode } from "react";
import { ConfigProvider } from "antd";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import AppLayout from "@components/layout/AppLayout";

function AntdConfigProvider({ children }: { children: ReactNode }) {
  const { algorithm } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm,
        token: {
          colorPrimary: "#ff9900",
          borderRadius: 6,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AntdConfigProvider>
          <AppLayout>{children}</AppLayout>
        </AntdConfigProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
