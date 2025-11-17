// components/navigation/MainMenu.tsx
"use client";

import { Menu } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  CalculatorOutlined,
  CalendarOutlined,
  ContactsOutlined,
  ClusterOutlined,
  SettingOutlined
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { useMemo } from "react";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode
): MenuItem {
  return {
    key,
    icon,
    label
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Dashboard", "/", <AppstoreOutlined />),
  getItem("T&E & Tax", "/te-tax", <CalculatorOutlined />),
  getItem("OpEx Tasks", "/opex-tasks", <CalendarOutlined />),
  getItem("Contacts", "/contacts", <ContactsOutlined />),
  getItem("Integrations", "/integrations", <ClusterOutlined />),
  getItem("Settings", "/settings", <SettingOutlined />)
];

export default function MainMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const selectedKeys = useMemo(() => {
    if (!pathname) return ["/"];
    // Map dynamic routes if needed later
    if (pathname.startsWith("/te-tax")) return ["/te-tax"];
    if (pathname.startsWith("/opex-tasks")) return ["/opex-tasks"];
    if (pathname.startsWith("/contacts")) return ["/contacts"];
    if (pathname.startsWith("/integrations")) return ["/integrations"];
    if (pathname.startsWith("/settings")) return ["/settings"];
    return ["/"];
  }, [pathname]);

  const onClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
  };

  return (
    <Menu
      mode="inline"
      items={items}
      theme="dark"
      selectedKeys={selectedKeys}
      onClick={onClick}
    />
  );
}
