// app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Form, Input, Button, Typography, message, Space } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(values.email, values.password)
      : await signIn(values.email, values.password);

    setLoading(false);

    if (error) {
      message.error(error.message);
    } else if (isSignUp) {
      message.success("Account created! Please check your email to verify.");
      setIsSignUp(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
      }}
    >
      <Card style={{ width: 400, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              InsightPulse Admin
            </Title>
            <Text type="secondary">
              {isSignUp ? "Create your account" : "Sign in to continue"}
            </Text>
          </div>

          <Form name="auth" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="you@example.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: "center" }}>
            <Button type="link" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
}
