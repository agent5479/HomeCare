const VITE_ENV: Record<string, string | undefined> = {
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD,
  JESS_USERNAME: import.meta.env.VITE_JESS_USERNAME,
  JESS_PASSWORD: import.meta.env.VITE_JESS_PASSWORD,
  GBTECH_USERNAME: import.meta.env.VITE_GBTECH_USERNAME,
  GBTECH_PASSWORD: import.meta.env.VITE_GBTECH_PASSWORD,
  LARS_USERNAME: import.meta.env.VITE_LARS_USERNAME,
  LARS_PASSWORD: import.meta.env.VITE_LARS_PASSWORD,
  DEFAULT_TENANT_ID: import.meta.env.VITE_DEFAULT_TENANT_ID,
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  OPENWEATHER_API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY,
};

export function getEnv(name: string): string | undefined {
  const windowKey = `ENV_${name}` as keyof Window;
  const fromWindow = window[windowKey];
  if (typeof fromWindow === 'string' && fromWindow.length > 0) return fromWindow;

  const fromVite = VITE_ENV[name];
  return typeof fromVite === 'string' && fromVite.length > 0 ? fromVite : undefined;
}
