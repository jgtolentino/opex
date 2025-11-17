// components/layout/AppLayout.tsx
"use client";

import { Layout, Typography, Space, Dropdown, Avatar, Button } from "antd";
import type { MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import MainMenu from "@components/navigation/MainMenu";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Don't show layout on auth pages
  const isAuthPage = pathname?.startsWith("/auth");

  const userMenuItems: MenuProps["items"] = [
    {
      key: "email",
      label: user?.email || "Not signed in",
      disabled: true,
      icon: <UserOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      onClick: () => router.push("/settings"),
    },
    {
      key: "logout",
      label: "Sign Out",
      icon: <LogoutOutlined />,
      onClick: signOut,
      danger: true,
    },
  ];

  if (isAuthPage) {
    return <>{children}</>;
  }

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
            <Text type="secondary">v0.1</Text>
            {user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button type="text" icon={<Avatar size="small" icon={<UserOutlined />} />}>
                  {user.email?.split("@")[0]}
                </Button>
              </Dropdown>
            ) : (
              <Button type="link" onClick={() => router.push("/auth/login")}>
                Sign In
              </Button>
            )}
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
