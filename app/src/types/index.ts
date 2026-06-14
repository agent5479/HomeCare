export type UserRole = 'master_admin' | 'admin' | 'demo_admin' | 'employee';

export interface User {
  username: string;
  role: UserRole;
  tenantId: string;
  employeeId?: string;
  createdAt?: string;
}

export interface Site {
  id: string | number;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  siteType?: string;
  careLevel?: string;
  status?: string;
  archived?: boolean;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  specialInstructions?: string;
  services?: Record<string, boolean>;
  specialNeeds?: Record<string, boolean>;
  lastVisit?: string;
  nextVisit?: string;
  hiveCount?: number;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Client {
  id: string | number;
  siteId: string | number;
  clientName?: string;
  hiveName?: string;
  status?: string;
  careLevel?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface CareAction {
  id: string;
  siteId: string | number;
  individualHiveId?: string | number | null;
  taskId?: string | number;
  taskName?: string;
  taskCategory?: string;
  date: string;
  notes?: string;
  flag?: string;
  loggedBy?: string;
  createdAt?: string;
  deleted?: boolean;
  [key: string]: unknown;
}

export interface ScheduledTask {
  id: string;
  siteId: string | number;
  taskId?: string | number;
  taskName?: string;
  scheduledDate: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  notes?: string;
  overdue?: boolean;
  [key: string]: unknown;
}

export interface TaskTemplate {
  id: string | number;
  name: string;
  category: string;
  description?: string;
  common?: boolean;
  [key: string]: unknown;
}

export interface Employee {
  id: string;
  username: string;
  passwordHash?: string;
  role?: UserRole;
  tenantId?: string;
  active?: boolean;
  tempPassword?: string;
  tempPasswordExpiry?: string;
  skills?: string;
  certifications?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface Visit {
  id: string;
  siteId: string | number;
  scheduledDate: string;
  tasks?: string[];
  status?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface TaskGroup {
  id: string;
  name: string;
  tasks: string[];
  [key: string]: unknown;
}

export type TenantCollection =
  | 'sites'
  | 'actions'
  | 'scheduledTasks'
  | 'individualHives'
  | 'tasks'
  | 'employees'
  | 'visits'
  | 'taskGroups'
  | 'deletedTasks';

export interface TenantData {
  sites: Site[];
  actions: CareAction[];
  scheduledTasks: ScheduledTask[];
  individualHives: Client[];
  tasks: TaskTemplate[];
  employees: Employee[];
  visits: Visit[];
  taskGroups: TaskGroup[];
  deletedTasks: Record<string, unknown>;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface PendingChange {
  id: number;
  timestamp: string;
  type: string;
  path: string;
  data: unknown;
  method?: 'set' | 'update' | 'remove';
}

export interface AdminAccount {
  username: string;
  passwordHash: string;
  tenantId: string;
  role: UserRole;
}
