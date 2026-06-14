import bcrypt from 'bcryptjs';
import type { AdminAccount } from '@/types';

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function secureHash(password: string): string {
  return hashPassword(password);
}

export function loadAdminAccounts(): Record<string, AdminAccount> {
  const accounts: Record<string, AdminAccount> = {};
  const defaultTenantId = import.meta.env.VITE_DEFAULT_TENANT_ID || 'default';

  const addAccount = (
    username: string | undefined,
    password: string | undefined,
    role: AdminAccount['role']
  ) => {
    if (username && password && !password.startsWith('[SET_')) {
      accounts[username] = {
        username,
        passwordHash: hashPassword(password),
        tenantId: defaultTenantId,
        role,
      };
    }
  };

  addAccount('Admin', import.meta.env.VITE_ADMIN_PASSWORD, 'master_admin');
  addAccount(import.meta.env.VITE_JESS_USERNAME, import.meta.env.VITE_JESS_PASSWORD, 'master_admin');
  addAccount(import.meta.env.VITE_GBTECH_USERNAME, import.meta.env.VITE_GBTECH_PASSWORD, 'master_admin');
  addAccount(import.meta.env.VITE_LARS_USERNAME, import.meta.env.VITE_LARS_PASSWORD, 'admin');

  return accounts;
}

export function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.databaseURL && config.projectId);
}

export const APP_VERSION = '0.8';
