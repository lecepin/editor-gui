import Dexie, { Table } from "dexie";
import { DB_CONFIG } from "./constants";

// 文档接口
export interface Document {
  id?: number | null;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// 图片接口
export interface ImageData {
  id?: number;
  binary: Blob;
  createdAt: Date;
}

// 扩展 Dexie 数据库类
export class AppDatabase extends Dexie {
  documents!: Table<Document, number>;
  images!: Table<ImageData>;

  constructor() {
    super(DB_CONFIG.NAME);
    this.version(DB_CONFIG.VERSION).stores({
      documents: DB_CONFIG.STORES.DOCUMENTS,
      images: DB_CONFIG.STORES.IMAGES,
    });
  }

  async addDocument(doc: Omit<Document, "id">): Promise<number> {
    return await this.documents.add(doc);
  }

  async updateDocument(doc: Document): Promise<void> {
    await this.documents.put(doc);
  }

  async getAllDocuments(): Promise<Document[]> {
    const docs = await this.documents.toArray();
    // 应用层迁移：旧文档没有 createdAt，用 updatedAt 补填并持久化
    const needsMigration = docs.filter((d) => !d.createdAt);
    if (needsMigration.length > 0) {
      await Promise.all(
        needsMigration.map((d) =>
          this.documents.update(d.id as number, {
            createdAt: d.updatedAt ?? Date.now(),
          })
        )
      );
      return this.documents.toArray();
    }
    return docs;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return await this.documents.get(id);
  }

  async deleteDocument(id: number): Promise<void> {
    await this.documents.delete(id);
  }

  async saveImage(file: File): Promise<number> {
    const id = await this.images.add({
      binary: file,
      createdAt: new Date(),
    });
    return id as number;
  }

  async getImage(id: number): Promise<ImageData | undefined> {
    return await this.images.get(id);
  }

  async getAllImages(): Promise<ImageData[]> {
    return await this.images.toArray();
  }

  async deleteImage(id: number): Promise<void> {
    await this.images.delete(id);
  }

  async clearImages(): Promise<void> {
    await this.images.clear();
  }
}

export default new AppDatabase();
