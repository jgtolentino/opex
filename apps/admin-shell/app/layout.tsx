// app/layout.tsx
import "./../styles/globals.css";
import { ReactNode } from "react";
import { ConfigProvider, theme } from "antd";
import AppLayout from "@components/layout/AppLayout";

export const metadata = {
  title: "InsightPulse Admin Shell",
  description: "Unified admin console for InsightPulse AI stack"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: "#ff9900", // adjust to your house color
              borderRadius: 6
            }
          }}
        >
          <AppLayout>{children}</AppLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}
