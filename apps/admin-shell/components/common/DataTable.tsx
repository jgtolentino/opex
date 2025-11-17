// components/common/DataTable.tsx
"use client";

import { Table, Card, Space, Button, Input } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState } from "react";

interface DataTableProps<T> {
  title?: string;
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey?: string | ((record: T) => string);
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onRefresh?: () => void;
  extraActions?: React.ReactNode;
  pagination?: false | TablePaginationConfig;
}

export default function DataTable<T extends object>({
  title,
  columns,
  data,
  loading = false,
  rowKey = "id",
  searchPlaceholder = "Search...",
  onSearch,
  onRefresh,
  extraActions,
  pagination,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <Card
      title={title}
      extra={
        <Space>
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          )}
          {onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          )}
          {extraActions}
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey={rowKey}
        pagination={
          pagination === false
            ? false
            : {
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} items`,
                pageSize: 20,
                ...pagination,
              }
        }
        scroll={{ x: true }}
      />
    </Card>
  );
}
