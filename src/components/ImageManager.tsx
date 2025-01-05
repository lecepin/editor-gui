import { useEffect, useState } from "react";
import { Modal, List, Button, Popconfirm, message, Card } from "antd";
import { DeleteOutlined, LinkOutlined } from "@ant-design/icons";
import db from "../utils/db";
import type { ImageData } from "../utils/db";

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ImageManager: React.FC<Props> = ({ open, onClose }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadImages = async () => {
    setLoading(true);
    try {
      const allImages = await db.getAllImages();
      setImages(allImages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  const handleDelete = async (id: number) => {
    await db.deleteImage(id);
    message.success("图片已删除");
    loadImages();
  };

  const handleCopyLink = (id: number) => {
    navigator.clipboard.writeText(`/${id}.privateimg`);
    message.success("链接已复制");
  };

  const handleClearAll = async () => {
    await db.clearImages();
    message.success("所有图片已清空");
    loadImages();
  };

  return (
    <Modal
      title="图片管理"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Popconfirm
          key="clear"
          title="确认清空所有图片？"
          description="此操作不可恢复"
          onConfirm={handleClearAll}
        >
          <Button danger>清空所有图片</Button>
        </Popconfirm>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <List
        loading={loading}
        grid={{ gutter: 16, column: 3 }}
        dataSource={images}
        renderItem={(image) => (
          <List.Item>
            <Card
              size="small"
              bodyStyle={{ padding: 0 }}
              style={{
                overflow: "hidden",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={`/${image.id}.privateimg`}
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    display: "block",
                  }}
                  alt=""
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    padding: 8,
                    display: "flex",
                    gap: 8,
                    background:
                      "linear-gradient(to left, rgba(0,0,0,0.5), transparent)",
                    borderRadius: "0 0 0 8px",
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<LinkOutlined />}
                    onClick={() => handleCopyLink(image.id!)}
                    style={{ color: "#fff" }}
                  />
                  <Popconfirm
                    title="确认删除此图片？"
                    description="此操作不可恢复"
                    onConfirm={() => handleDelete(image.id!)}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ color: "#fff" }}
                    />
                  </Popconfirm>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "4px 8px",
                    background: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    fontSize: 12,
                  }}
                >
                  {new Date(image.createdAt).toLocaleString()}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </Modal>
  );
};
