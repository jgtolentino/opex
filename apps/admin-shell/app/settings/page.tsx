// app/settings/page.tsx
"use client";

import { Card, Space, Typography, Switch, Divider, Descriptions, Tag } from "antd";
import { MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import ProtectedRoute from "@components/common/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const { Title, Text } = Typography;

export default function SettingsPage() {
  const { mode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Settings</Title>
          <Text type="secondary">Manage your preferences and account settings</Text>
        </div>

        {/* User Profile */}
        <Card title="Profile Information">
          <Descriptions column={1}>
            <Descriptions.Item label="Email">
              {user?.email || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              <Text code copyable>
                {user?.id || "—"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Account Status">
              <Tag color="success" icon={<UserOutlined />}>
                Active
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email Verified">
              {user?.email_confirmed_at ? (
                <Tag color="success">Verified</Tag>
              ) : (
                <Tag color="warning">Not Verified</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Appearance Settings */}
        <Card title="Appearance">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div>
                  <Text strong>Theme</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Choose your preferred color scheme
                </Text>
              </div>
              <Space>
                <SunOutlined style={{ color: mode === "light" ? "#faad14" : "#8c8c8c" }} />
                <Switch
                  checked={mode === "dark"}
                  onChange={toggleTheme}
                  checkedChildren="Dark"
                  unCheckedChildren="Light"
                />
                <MoonOutlined style={{ color: mode === "dark" ? "#1890ff" : "#8c8c8c" }} />
              </Space>
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Current theme: <Tag>{mode === "dark" ? "Dark Mode" : "Light Mode"}</Tag>
              </Text>
            </div>
          </Space>
        </Card>

        {/* AI Features (Placeholder) */}
        <Card title="AI Features">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div>
                  <Text strong>Enable AI Insights</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Show AI-powered suggestions and analysis (coming soon)
                </Text>
              </div>
              <Switch disabled defaultChecked />
            </div>

            <Divider style={{ margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div>
                  <Text strong>Tax Validation Copilot</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Get real-time tax compliance recommendations (coming soon)
                </Text>
              </div>
              <Switch disabled />
            </div>
          </Space>
        </Card>

        {/* Admin Config Links (Placeholder) */}
        <Card title="Admin Configuration">
          <Text type="secondary">
            Advanced configuration options will be available here for administrators.
          </Text>
        </Card>
      </Space>
    </ProtectedRoute>
  );
}
