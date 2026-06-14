import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { get, ref } from 'firebase/database';
import type { User, Employee } from '@/types';
import { loadAdminAccounts, verifyPassword } from '@/services/config';
import { getDb, initFirebase } from '@/services/firebase';
import { clearTenantCache } from '@/services/offlineCache';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(username: string): { allowed: boolean; message: string } {
  const record = loginAttempts.get(username.toLowerCase());
  if (record && Date.now() < record.lockedUntil) {
    const mins = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { allowed: false, message: `Too many attempts. Try again in ${mins} minutes.` };
  }
  return { allowed: true, message: '' };
}

function recordAttempt(username: string, success: boolean) {
  const key = username.toLowerCase();
  if (success) {
    loginAttempts.delete(key);
    return;
  }
  const record = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
    record.count = 0;
  }
  loginAttempts.set(key, record);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initFirebase();
    const savedUser = localStorage.getItem('currentUser');
    const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAdmin(savedIsAdmin);
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((u: User, admin: boolean) => {
    localStorage.setItem('currentUser', JSON.stringify(u));
    localStorage.setItem('isAdmin', String(admin));
    localStorage.setItem('currentTenantId', u.tenantId);
    setUser(u);
    setIsAdmin(admin);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const rateCheck = checkRateLimit(username);
    if (!rateCheck.allowed) return { success: false, message: rateCheck.message };

    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { success: false, message: 'Please enter both username and password' };
    }

    const adminAccounts = loadAdminAccounts();
    const adminAccount = Object.values(adminAccounts).find(
      (a) => a.username.toLowerCase() === trimmed.toLowerCase() && verifyPassword(password, a.passwordHash)
    );

    if (adminAccount) {
      recordAttempt(trimmed, true);
      const u: User = {
        username: adminAccount.username,
        role: adminAccount.role,
        tenantId: adminAccount.tenantId,
        createdAt: new Date().toISOString(),
      };
      persistSession(u, true);
      return { success: true, message: `Welcome ${adminAccount.username}!` };
    }

    const db = getDb();
    if (!db) {
      recordAttempt(trimmed, false);
      return { success: false, message: 'Database not available' };
    }

    const storedTenant = localStorage.getItem('currentTenantId');
    const tenantsToSearch = storedTenant ? [storedTenant] : ['default', 'lars', 'gbtech', 'demo'];

    for (const tenantId of tenantsToSearch) {
      const snap = await get(ref(db, `tenants/${tenantId}/employees`));
      const employees = snap.val() as Record<string, Employee> | null;
      if (!employees) continue;

      const employee = Object.values(employees).find(
        (e) => e.username?.toLowerCase() === trimmed.toLowerCase() && e.active !== false
      );

      if (employee) {
        const hash = employee.passwordHash || '';
        const valid =
          (hash && verifyPassword(password, hash)) ||
          (employee.tempPassword && employee.tempPassword === password &&
            employee.tempPasswordExpiry && new Date(employee.tempPasswordExpiry) > new Date());

        if (valid) {
          recordAttempt(trimmed, true);
          const u: User = {
            username: employee.username,
            role: (employee.role as User['role']) || 'employee',
            tenantId: employee.tenantId || tenantId,
            employeeId: employee.id,
            createdAt: employee.createdAt,
          };
          persistSession(u, false);
          return { success: true, message: `Welcome ${employee.username}!` };
        }
      }
    }

    recordAttempt(trimmed, false);
    return { success: false, message: 'Invalid username or password' };
  }, [persistSession]);

  const logout = useCallback(() => {
    const tenantId = user?.tenantId;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentTenantId');
    setUser(null);
    setIsAdmin(false);
    if (tenantId) clearTenantCache(tenantId);
  }, [user?.tenantId]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
