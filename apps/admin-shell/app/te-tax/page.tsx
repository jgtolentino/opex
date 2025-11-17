// app/te-tax/page.tsx
"use client";

import { useState } from "react";
import { Space, Tag, Typography, Select, DatePicker, Button, Statistic, Row, Col, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import DataTable from "@components/common/DataTable";
import ProtectedRoute from "@components/common/ProtectedRoute";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense } from "@/types/database";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function TeTaxPage() {
  const [employeeFilter, setEmployeeFilter] = useState<string | undefined>();
  const [taxStatusFilter, setTaxStatusFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string?, string?]>([undefined, undefined]);

  const { data, loading, refetch } = useExpenses({
    employeeId: employeeFilter,
    taxStatus: taxStatusFilter,
    dateFrom: dateRange[0],
    dateTo: dateRange[1],
  });

  // Calculate summary stats
  const stats = {
    total: data.length,
    totalAmount: data.reduce((sum, exp) => sum + Number(exp.amount), 0),
    validated: data.filter((e) => e.tax_status === "validated").length,
    highRisk: data.filter((e) => e.tax_status === "high_risk").length,
    pending: data.filter((e) => e.tax_status === "pending").length,
  };

  const columns: ColumnsType<Expense> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: "Employee",
      dataIndex: "employee_name",
      key: "employee_name",
      width: 150,
      sorter: (a, b) => a.employee_name.localeCompare(b.employee_name),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 130,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount: number) => (
        <Text strong>₱{amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</Text>
      ),
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
    },
    {
      title: "Tax Status",
      dataIndex: "tax_status",
      key: "tax_status",
      width: 130,
      render: (status: string) => {
        const statusConfig = {
          validated: { color: "success", icon: <CheckCircleOutlined />, text: "Validated" },
          high_risk: { color: "error", icon: <WarningOutlined />, text: "High Risk" },
          pending: { color: "warning", icon: <ClockCircleOutlined />, text: "Pending" },
          exempt: { color: "default", icon: <SafetyOutlined />, text: "Exempt" },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Validated", value: "validated" },
        { text: "High Risk", value: "high_risk" },
        { text: "Pending", value: "pending" },
        { text: "Exempt", value: "exempt" },
      ],
      onFilter: (value, record) => record.tax_status === value,
    },
    {
      title: "Tax Summary",
      dataIndex: "last_tax_summary",
      key: "last_tax_summary",
      ellipsis: true,
      render: (summary: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {summary || "—"}
        </Text>
      ),
    },
  ];

  const uniqueEmployees = Array.from(new Set(data.map((e) => e.employee_name))).sort();

  return (
    <ProtectedRoute>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>T&E & Tax Console</Title>
          <Text type="secondary">
            Review expense reports with PH BIR tax validation status
          </Text>
        </div>

        {/* Summary Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Expenses"
                value={stats.total}
                suffix="items"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Amount"
                value={stats.totalAmount}
                prefix="₱"
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Validated"
                value={stats.validated}
                valueStyle={{ color: "#52c41a" }}
                suffix={`/ ${stats.total}`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="High Risk"
                value={stats.highRisk}
                valueStyle={{ color: stats.highRisk > 0 ? "#ff4d4f" : undefined }}
                suffix={stats.highRisk > 0 ? "⚠️" : ""}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card>
          <Space wrap>
            <Select
              placeholder="Filter by Employee"
              style={{ width: 200 }}
              allowClear
              value={employeeFilter}
              onChange={setEmployeeFilter}
            >
              {uniqueEmployees.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Filter by Tax Status"
              style={{ width: 180 }}
              allowClear
              value={taxStatusFilter}
              onChange={setTaxStatusFilter}
            >
              <Select.Option value="validated">Validated</Select.Option>
              <Select.Option value="high_risk">High Risk</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="exempt">Exempt</Select.Option>
            </Select>

            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD"),
                    dates[1]?.format("YYYY-MM-DD"),
                  ]);
                } else {
                  setDateRange([undefined, undefined]);
                }
              }}
            />

            <Button
              onClick={() => {
                setEmployeeFilter(undefined);
                setTaxStatusFilter(undefined);
                setDateRange([undefined, undefined]);
              }}
            >
              Clear Filters
            </Button>
          </Space>
        </Card>

        {/* Data Table */}
        <DataTable
          title={`Expenses (${data.length})`}
          columns={columns}
          data={data}
          loading={loading}
          onRefresh={refetch}
        />
      </Space>
    </ProtectedRoute>
  );
}
