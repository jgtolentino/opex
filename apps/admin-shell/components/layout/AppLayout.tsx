// components/layout/AppLayout.tsx
"use client";

import { Layout, Typography, Space } from "antd";
import MainMenu from "@components/navigation/MainMenu";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: 16
          }}
        >
          IP Admin
        </div>
        <MainMenu />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px"
          }}
        >
          <Text strong>InsightPulse Admin Shell</Text>
          <Space size="middle">
            {/* Placeholder for user menu / theme toggle / status indicator */}
            <Text type="secondary">v0.1</Text>
          </Space>
        </Header>
        <Content style={{ margin: 16 }}>
          <div
            style={{
              background: "#fff",
              padding: 16,
              minHeight: "calc(100vh - 64px - 32px)",
              borderRadius: 8
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
