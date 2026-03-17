export const DB_CONFIG = {
  NAME: "AppDB",
  VERSION: 10,
  STORES: {
    DOCUMENTS: "++id, updatedAt",
    IMAGES: "++id, createdAt"
  }
} as const;

export const MODEL_CONFIG_KEYS = {
  BASE_URL: "model_config_base_url",
  API_KEY: "model_config_api_key",
  MODEL_NAME: "model_config_model_name",
} as const;