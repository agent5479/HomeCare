import bcrypt from 'bcryptjs';
import type { AdminAccount } from '@/types';
import { getEnv } from './env';

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
  const defaultTenantId = getEnv('DEFAULT_TENANT_ID') || 'default';

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

  addAccount('Admin', getEnv('ADMIN_PASSWORD'), 'master_admin');
  addAccount(getEnv('JESS_USERNAME'), getEnv('JESS_PASSWORD'), 'master_admin');
  addAccount(getEnv('GBTECH_USERNAME'), getEnv('GBTECH_PASSWORD'), 'master_admin');
  addAccount(getEnv('LARS_USERNAME'), getEnv('LARS_PASSWORD'), 'admin');

  return accounts;
}

export function getFirebaseConfig() {
  return {
    apiKey: getEnv('FIREBASE_API_KEY'),
    authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
    databaseURL: getEnv('FIREBASE_DATABASE_URL'),
    projectId: getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('FIREBASE_APP_ID'),
  };
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.databaseURL && config.projectId);
}

export const APP_VERSION = '0.8';
