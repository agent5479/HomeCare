/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_ADMIN_PASSWORD: string;
  readonly VITE_JESS_USERNAME: string;
  readonly VITE_JESS_PASSWORD: string;
  readonly VITE_GBTECH_USERNAME: string;
  readonly VITE_GBTECH_PASSWORD: string;
  readonly VITE_LARS_USERNAME: string;
  readonly VITE_LARS_PASSWORD: string;
  readonly VITE_DEFAULT_TENANT_ID: string;
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_OPENWEATHER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ENV_FIREBASE_API_KEY?: string;
  ENV_FIREBASE_AUTH_DOMAIN?: string;
  ENV_FIREBASE_DATABASE_URL?: string;
  ENV_FIREBASE_PROJECT_ID?: string;
  ENV_FIREBASE_STORAGE_BUCKET?: string;
  ENV_FIREBASE_MESSAGING_SENDER_ID?: string;
  ENV_FIREBASE_APP_ID?: string;
  ENV_ADMIN_PASSWORD?: string;
  ENV_JESS_USERNAME?: string;
  ENV_JESS_PASSWORD?: string;
  ENV_GBTECH_USERNAME?: string;
  ENV_GBTECH_PASSWORD?: string;
  ENV_LARS_USERNAME?: string;
  ENV_LARS_PASSWORD?: string;
  ENV_DEFAULT_TENANT_ID?: string;
  ENV_GOOGLE_MAPS_API_KEY?: string;
  ENV_OPENWEATHER_API_KEY?: string;
}
