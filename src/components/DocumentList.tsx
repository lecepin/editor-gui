import { useEffect, useState } from "react";
import { Button, List, Typography, Popconfirm } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  DeleteOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import type { Document } from "../utils/db";
import db from "../utils/db";
import { open } from "@tauri-apps/plugin-shell";

interface DocumentListProps {
  currentDocId: number | null;
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: () => void;
  lastUpdate?: number;
}

export function DocumentList({
  currentDocId,
  onSelectDocument,
  onCreateDocument,
  lastUpdate,
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);

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
          onSelectDocument({ id: null, title: "", content: "", updatedAt: 0 });
        }
      }
    }
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
    </div>
  );
}
