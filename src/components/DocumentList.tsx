import { useEffect, useState } from "react";
import { Button, List, Typography, Popconfirm, Modal, Form, Input, message } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  GithubOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { Document } from "../utils/db";
import db from "../utils/db";
import { open } from "@tauri-apps/plugin-shell";
import { MODEL_CONFIG_KEYS } from "../utils/constants";

interface DocumentListProps {
  currentDocId: number | null;
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: () => void;
  lastUpdate?: number;
}

export interface ModelConfig {
  baseUrl: string;
  apiKey: string;
  modelName: string;
}

export function loadModelConfig(): ModelConfig {
  return {
    baseUrl: localStorage.getItem(MODEL_CONFIG_KEYS.BASE_URL) || "",
    apiKey: localStorage.getItem(MODEL_CONFIG_KEYS.API_KEY) || "",
    modelName: localStorage.getItem(MODEL_CONFIG_KEYS.MODEL_NAME) || "",
  };
}

export function DocumentList({
  currentDocId,
  onSelectDocument,
  onCreateDocument,
  lastUpdate,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [settingOpen, setSettingOpen] = useState(false);
  const [form] = Form.useForm<ModelConfig>();

  const loadDocuments = async () => {
    const docs = await db.getAllDocuments();
    const sortedDocs = docs.sort((a, b) => b.updatedAt - a.updatedAt);
    setDocuments(sortedDocs);
  };

  useEffect(() => {
    loadDocuments();
  }, [lastUpdate]);

  const handleDelete = async (doc: Document) => {
    if (doc.id) {
      await db.deleteDocument(doc.id);
      await loadDocuments();

      // 如果删除的是当前文档
      if (doc.id === currentDocId) {
        // 获取剩余的文档
        const remainingDocs = documents.filter((d) => d.id !== doc.id);
        if (remainingDocs.length > 0) {
          // 如果还有其他文档，选择第一个
          onSelectDocument(remainingDocs[0]);
        } else {
          // 如果没有文档了，清空当前选中状态
          onSelectDocument({ id: null, title: "", content: "", createdAt: 0, updatedAt: 0 });
        }
      }
    }
  };

  const handleOpenSetting = () => {
    const config = loadModelConfig();
    form.setFieldsValue(config);
    setSettingOpen(true);
  };

  const handleSaveSetting = () => {
    form.validateFields().then((values) => {
      localStorage.setItem(MODEL_CONFIG_KEYS.BASE_URL, values.baseUrl || "");
      localStorage.setItem(MODEL_CONFIG_KEYS.API_KEY, values.apiKey || "");
      localStorage.setItem(MODEL_CONFIG_KEYS.MODEL_NAME, values.modelName || "");
      setSettingOpen(false);
      message.success("模型配置已保存");
    });
  };

  return (
    <div className="document-list">
      <div style={{ padding: "12px", display: "flex", gap: "8px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateDocument}
          style={{ flex: 1 }}
        >
          新建文档
        </Button>
        <Button
          icon={<GithubOutlined />}
          onClick={() => open("https://github.com/lecepin")}
        />
        <Button
          icon={<SettingOutlined />}
          onClick={handleOpenSetting}
          title="模型设置"
        />
      </div>
      <List
        className="document-items"
        dataSource={documents}
        renderItem={(doc) => (
          <List.Item
            key={doc.id}
            onClick={() => onSelectDocument(doc)}
            className={`document-item ${doc.id === currentDocId ? "active" : ""}`}
          >
            <div className="document-item-content">
              <FileTextOutlined className="document-icon" />
              <div className="document-info">
                <div className="document-title">
                  {doc.title || "无标题文档"}
                </div>
                <Typography.Text type="secondary" className="document-date">
                  {new Date(doc.updatedAt).toLocaleString()}
                </Typography.Text>
              </div>
            </div>
            <Popconfirm
              title="删除文档"
              description="确定要删除这个文档吗？"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(doc);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="删除"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                className="delete-btn"
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </List.Item>
        )}
      />

      <Modal
        title="模型设置"
        open={settingOpen}
        onOk={handleSaveSetting}
        onCancel={() => setSettingOpen(false)}
        okText="保存"
        cancelText="取消"
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Base URL"
            name="baseUrl"
            rules={[{ required: true, message: "请输入 Base URL" }]}
          >
            <Input placeholder="https://api.openai.com/v1" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: "请输入 API Key" }]}
          >
            <Input.Password placeholder="sk-..." autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="模型名称"
            name="modelName"
            rules={[{ required: true, message: "请输入模型名称" }]}
          >
            <Input placeholder="gpt-4o-mini" autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
