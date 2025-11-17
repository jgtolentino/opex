// components/jenny/JennyPanel.tsx
import React, { useMemo, useState } from "react";
import {
  Layout,
  Typography,
  List,
  Avatar,
  Space,
  Button,
  Input,
  Tabs,
  Tag,
  Card,
  Spin,
  Table,
  Empty,
  Tooltip,
} from "antd";
import {
  MessageOutlined,
  RobotOutlined,
  UserOutlined,
  SendOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  CodeOutlined,
  InfoCircleOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
// Optional: if you use ECharts
// npm install echarts echarts-for-react
// import ReactECharts from "echarts-for-react";

const { Sider, Content, Header } = Layout;
const { Title, Text, Paragraph } = Typography;

export type JennyRole = "user" | "assistant";

export interface JennyMessage {
  id: string;
  role: JennyRole;
  content: string;
  createdAt: string; // ISO string or formatted label
  status?: "pending" | "complete" | "error";
  summary?: string; // short title like "Sales by region last 30 days"
}

export interface JennyResult {
  id: string;
  title: string;
  description?: string;
  // For charts – pass an ECharts option object if you use ECharts
  chartOption?: any;
  // For tables
  tableColumns?: ColumnsType<any>;
  tableData?: any[];
  // SQL Jenny ran
  sql?: string;
  // Explanation: how Jenny answered
  explanation?: string;
  // Meta
  spaceName?: string;
  metricsUsed?: string[];
  tablesUsed?: string[];
  lastRefreshedAt?: string;
}

export interface JennyPanelProps {
  spaceName: string;
  spaceDescription: string;
  exampleQuestions?: string[];
  messages: JennyMessage[];
  selectedResult?: JennyResult | null;
  isThinking?: boolean;
  // Callbacks
  onSendQuestion?: (question: string) => void;
  onSelectMessage?: (messageId: string) => void;
  onFeedback?: (messageId: string, positive: boolean) => void;
}

export const JennyPanel: React.FC<JennyPanelProps> = ({
  spaceName,
  spaceDescription,
  exampleQuestions = [],
  messages,
  selectedResult,
  isThinking = false,
  onSendQuestion,
  onSelectMessage,
  onFeedback,
}) => {
  const [draft, setDraft] = useState("");

  const latestMessage = messages[messages.length - 1];

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !onSendQuestion) return;
    onSendQuestion(trimmed);
    setDraft("");
  };

  const handleExampleClick = (q: string) => {
    setDraft(q);
  };

  const resultMeta = useMemo(() => {
    if (!selectedResult) return null;
    return {
      title: selectedResult.title,
      description: selectedResult.description,
      spaceLabel: selectedResult.spaceName || spaceName,
      lastRefreshed: selectedResult.lastRefreshedAt,
    };
  }, [selectedResult, spaceName]);

  const activeTabs = useMemo(() => {
    if (!selectedResult) return [];
    const tabs: { key: string; label: React.ReactNode }[] = [
      {
        key: "insight",
        label: (
          <Space size={4}>
            <MessageOutlined />
            <span>Insight</span>
          </Space>
        ),
      },
    ];

    if (selectedResult.chartOption) {
      tabs.push({
        key: "chart",
        label: (
          <Space size={4}>
            <BarChartOutlined />
            <span>Chart</span>
          </Space>
        ),
      });
    }

    if (selectedResult.tableColumns && selectedResult.tableData) {
      tabs.push({
        key: "data",
        label: (
          <Space size={4}>
            <DatabaseOutlined />
            <span>Data</span>
          </Space>
        ),
      });
    }

    if (selectedResult.sql) {
      tabs.push({
        key: "sql",
        label: (
          <Space size={4}>
            <CodeOutlined />
            <span>SQL</span>
          </Space>
        ),
      });
    }

    if (selectedResult.explanation) {
      tabs.push({
        key: "explain",
        label: (
          <Space size={4}>
            <InfoCircleOutlined />
            <span>Explain</span>
          </Space>
        ),
      });
    }

    return tabs;
  }, [selectedResult]);

  const [activeTabKey, setActiveTabKey] = useState<string>("insight");

  return (
    <Layout
      style={{
        height: "100%",
        minHeight: 640,
        background: "var(--md-sys-color-surface, #f5f5f5)",
      }}
    >
      {/* Top bar */}
      <Header
        style={{
          paddingInline: 24,
          background: "var(--md-sys-color-surface-container-low, #ffffff)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar
              size={32}
              icon={<RobotOutlined />}
              style={{
                backgroundColor: "var(--md-sys-color-primary, #6750A4)",
              }}
            />
            <div>
              <Title level={5} style={{ margin: 0 }}>
                Jenny — AI BI Assistant
              </Title>
              <Text type="secondary">
                Space: {spaceName} · Ask Jenny anything about this data.
              </Text>
            </div>
          </Space>
        </Space>

        <Space size={16}>
          <Tag color="processing">Connected</Tag>
          <Tag>Gold views</Tag>
        </Space>
      </Header>

      {/* Main layout: left chat, right result */}
      <Layout>
        {/* Chat column */}
        <Sider
          width={360}
          theme="light"
          style={{
            borderRight: "1px solid rgba(0,0,0,0.06)",
            background: "var(--md-sys-color-surface, #fafafa)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: 16,
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Title level={5} style={{ marginBottom: 4 }}>
              Jenny for {spaceName}
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: 12, marginBottom: 8 }}
            >
              {spaceDescription}
            </Paragraph>
            {exampleQuestions.length > 0 && (
              <Space wrap>
                {exampleQuestions.map((q) => (
                  <Tag
                    key={q}
                    color="default"
                    onClick={() => handleExampleClick(q)}
                    style={{ cursor: "pointer" }}
                  >
                    {q}
                  </Tag>
                ))}
              </Space>
            )}
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {messages.length === 0 && (
              <Empty
                description={
                  <span>
                    Start by asking Jenny something like:
                    <br />
                    <Text italic>
                      "Top 5 brands by growth this month"
                    </Text>
                  </span>
                }
              />
            )}
            <List
              dataSource={messages}
              split={false}
              renderItem={(msg) => (
                <List.Item
                  key={msg.id}
                  style={{
                    padding: 0,
                    marginBottom: 8,
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    onClick={() =>
                      onSelectMessage && onSelectMessage(msg.id)
                    }
                    style={{
                      maxWidth: "90%",
                      cursor: "pointer",
                    }}
                  >
                    <Space
                      align="start"
                      style={{
                        flexDirection:
                          msg.role === "user" ? "row-reverse" : "row",
                        width: "100%",
                      }}
                    >
                      <Avatar
                        size={24}
                        icon={
                          msg.role === "assistant" ? (
                            <RobotOutlined />
                          ) : (
                            <UserOutlined />
                          )
                        }
                        style={{
                          backgroundColor:
                            msg.role === "assistant"
                              ? "var(--md-sys-color-primary, #6750A4)"
                              : "#d9d9d9",
                        }}
                      />
                      <Card
                        size="small"
                        bordered={false}
                        style={{
                          borderRadius: 16,
                          background:
                            msg.role === "assistant"
                              ? "var(--md-sys-color-surface-container-low, #ffffff)"
                              : "var(--md-sys-color-primary, #6750A4)",
                          color:
                            msg.role === "assistant" ? "inherit" : "#ffffff",
                          boxShadow:
                            msg.id === latestMessage?.id
                              ? "0 0 0 2px rgba(103,80,164,0.2)"
                              : "none",
                        }}
                      >
                        {msg.summary && (
                          <Text
                            strong
                            style={{
                              display: "block",
                              marginBottom: 4,
                              color:
                                msg.role === "assistant"
                                  ? "inherit"
                                  : "#ffffff",
                            }}
                          >
                            {msg.summary}
                          </Text>
                        )}
                        <Text
                          style={{
                            whiteSpace: "pre-wrap",
                            color:
                              msg.role === "assistant"
                                ? "inherit"
                                : "#ffffff",
                          }}
                        >
                          {msg.content}
                        </Text>
                        <div
                          style={{
                            marginTop: 4,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 10,
                              opacity: 0.8,
                              color:
                                msg.role === "assistant"
                                  ? undefined
                                  : "rgba(255,255,255,0.85)",
                            }}
                          >
                            {msg.createdAt}
                            {msg.status === "pending" && " · thinking…"}
                            {msg.status === "error" && " · error"}
                          </Text>

                          {msg.role === "assistant" && onFeedback && (
                            <Space size={4}>
                              <Tooltip title="Jenny did well">
                                <Button
                                  size="small"
                                  type="text"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFeedback(msg.id, true);
                                  }}
                                >
                                  👍
                                </Button>
                              </Tooltip>
                              <Tooltip title="Needs improvement">
                                <Button
                                  size="small"
                                  type="text"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onFeedback(msg.id, false);
                                  }}
                                >
                                  👎
                                </Button>
                              </Tooltip>
                            </Space>
                          )}
                        </div>
                      </Card>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
            {isThinking && (
              <div style={{ paddingTop: 8 }}>
                <Space>
                  <Spin size="small" />
                  <Text type="secondary">Jenny is thinking…</Text>
                </Space>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid rgba(0,0,0,0.06)",
              background: "var(--md-sys-color-surface-container-low, #ffffff)",
            }}
          >
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder="Ask Jenny a question about this space…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Tip: be specific — mention time range, metric, and dimension.
              </Text>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!draft.trim()}
              >
                Ask Jenny
              </Button>
            </div>
          </div>
        </Sider>

        {/* Result workspace */}
        <Layout>
          <Content
            style={{
              padding: 24,
              background: "var(--md-sys-color-surface, #f5f5f5)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {!selectedResult ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      Ask Jenny a question on the left to see insights here.
                    </span>
                  }
                />
              </div>
            ) : (
              <>
                {/* Result header */}
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 24,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    marginBottom: 4,
                  }}
                >
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: "100%" }}
                  >
                    <Space align="center">
                      <Avatar
                        size={32}
                        icon={<RobotOutlined />}
                        style={{
                          backgroundColor:
                            "var(--md-sys-color-primary, #6750A4)",
                        }}
                      />
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          {resultMeta?.title}
                        </Title>
                        <Space wrap size={4}>
                          <Tag icon={<AreaChartOutlined />}>
                            Answered by Jenny
                          </Tag>
                          <Tag>{resultMeta?.spaceLabel}</Tag>
                          {selectedResult.metricsUsed?.map((m) => (
                            <Tag key={m} color="default">
                              {m}
                            </Tag>
                          ))}
                          {selectedResult.tablesUsed?.map((t) => (
                            <Tag key={t} color="default">
                              {t}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    </Space>
                    {resultMeta?.description && (
                      <Paragraph type="secondary" style={{ marginTop: 8 }}>
                        {resultMeta.description}
                      </Paragraph>
                    )}
                    {resultMeta?.lastRefreshed && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Last refreshed: {resultMeta.lastRefreshed}
                      </Text>
                    )}
                  </Space>
                </Card>

                {/* Tabs: Insight / Chart / Data / SQL / Explain */}
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 24,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  bodyStyle={{ padding: 0, height: "100%" }}
                >
                  <Tabs
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    items={activeTabs.map((t) => ({
                      key: t.key,
                      label: t.label,
                    }))}
                    style={{ paddingInline: 24, paddingTop: 16 }}
                  />
                  <div
                    style={{
                      padding: 24,
                      paddingTop: 8,
                      borderTop: "1px solid rgba(0,0,0,0.04)",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 320,
                    }}
                  >
                    {activeTabKey === "insight" && (
                      <InsightView result={selectedResult} />
                    )}
                    {activeTabKey === "chart" && (
                      <ChartView result={selectedResult} />
                    )}
                    {activeTabKey === "data" && (
                      <DataView result={selectedResult} />
                    )}
                    {activeTabKey === "sql" && (
                      <SqlView result={selectedResult} />
                    )}
                    {activeTabKey === "explain" && (
                      <ExplainView result={selectedResult} />
                    )}
                  </div>
                </Card>
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

/** Subviews **/

const InsightView: React.FC<{ result: JennyResult }> = ({ result }) => {
  return (
    <div
      style={{
        maxWidth: 800,
        lineHeight: 1.6,
      }}
    >
      {result.description ? (
        <Paragraph>{result.description}</Paragraph>
      ) : (
        <Paragraph type="secondary">
          This is where Jenny&apos;s natural-language summary of the result
          should go. You can populate this field from your backend.
        </Paragraph>
      )}

      <Space direction="vertical" style={{ marginTop: 16 }} size={8}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Tip: let Jenny explain how she built this by switching to the
          &quot;Explain&quot; tab.
        </Text>
      </Space>
    </div>
  );
};

const ChartView: React.FC<{ result: JennyResult }> = ({ result }) => {
  if (!result.chartOption) {
    return (
      <Empty description="No chart available for this answer yet. Attach an ECharts option to result.chartOption to render a visualization." />
    );
  }

  // Note: Uncomment when echarts-for-react is installed
  // return (
  //   <ReactECharts
  //     option={result.chartOption}
  //     style={{ height: 360, width: "100%" }}
  //   />
  // );

  return (
    <Empty description="ECharts visualization will render here. Install echarts-for-react and uncomment the code." />
  );
};

const DataView: React.FC<{ result: JennyResult }> = ({ result }) => {
  if (!result.tableColumns || !result.tableData) {
    return (
      <Empty description="No tabular data for this answer yet. Attach tableColumns and tableData to see rows here." />
    );
  }

  return (
    <Table
      columns={result.tableColumns}
      dataSource={result.tableData}
      size="small"
      pagination={{ pageSize: 10 }}
      scroll={{ y: 260 }}
      rowKey={(row: any) => row.id ?? JSON.stringify(row)}
    />
  );
};

const SqlView: React.FC<{ result: JennyResult }> = ({ result }) => {
  if (!result.sql) {
    return (
      <Empty description="Jenny did not expose SQL for this answer. Supply result.sql to show the generated query." />
    );
  }

  return (
    <pre
      style={{
        background: "#0d1117",
        color: "#c9d1d9",
        borderRadius: 12,
        padding: 16,
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 12,
        overflowX: "auto",
        maxHeight: 320,
      }}
    >
      {result.sql}
    </pre>
  );
};

const ExplainView: React.FC<{ result: JennyResult }> = ({ result }) => {
  if (!result.explanation) {
    return (
      <Empty description="No explanation yet. Supply result.explanation to show Jenny's reasoning." />
    );
  }

  return (
    <Paragraph style={{ maxWidth: 800, whiteSpace: "pre-wrap" }}>
      {result.explanation}
    </Paragraph>
  );
};

export default JennyPanel;
