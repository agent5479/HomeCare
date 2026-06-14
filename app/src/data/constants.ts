import type { TaskTemplate } from '@/types';

// Default care task library for NZ providers
export const DEFAULT_TASKS: TaskTemplate[] = [
  { id: 'task_100', name: 'Shower Assistance', category: 'Personal Care', description: 'Assist client with showering', common: true },
  { id: 'task_101', name: 'Bath Assistance', category: 'Personal Care', description: 'Assist client with bathing', common: true },
  { id: 'task_110', name: 'Oral Hygiene', category: 'Personal Care', description: 'Assist with teeth brushing and mouth care', common: true },
  { id: 'task_114', name: 'Dressing Assistance - Morning', category: 'Personal Care', description: 'Help client get dressed in morning', common: true },
  { id: 'task_117', name: 'Toileting Assistance', category: 'Personal Care', description: 'Assist with toilet use', common: true },
  { id: 'task_200', name: 'Medication Administration - Morning', category: 'Health', description: 'Administer morning medications', common: true },
  { id: 'task_202', name: 'Medication Administration - Evening', category: 'Health', description: 'Administer evening medications', common: true },
  { id: 'task_205', name: 'Medication Compliance Check', category: 'Health', description: 'Verify medications are taken correctly', common: true },
  { id: 'task_209', name: 'Blood Pressure Check', category: 'Health', description: 'Monitor and record blood pressure', common: true },
  { id: 'task_210', name: 'Blood Glucose Monitoring', category: 'Health', description: 'Test and record blood sugar levels', common: true },
  { id: 'task_225', name: 'Vital Signs - Full Check', category: 'Health', description: 'Complete vital signs assessment', common: true },
  { id: 'task_300', name: 'Breakfast Preparation', category: 'Meal Prep', description: 'Prepare morning meal', common: true },
  { id: 'task_301', name: 'Lunch Preparation', category: 'Meal Prep', description: 'Prepare midday meal', common: true },
  { id: 'task_302', name: 'Dinner Preparation', category: 'Meal Prep', description: 'Prepare evening meal', common: true },
  { id: 'task_400', name: 'Kitchen Cleaning', category: 'Housekeeping', description: 'Clean kitchen surfaces and appliances', common: true },
  { id: 'task_401', name: 'Bathroom Cleaning', category: 'Housekeeping', description: 'Clean bathroom fixtures and surfaces', common: true },
  { id: 'task_500', name: 'Transfer Assistance - Bed to Chair', category: 'Mobility', description: 'Assist with transfer from bed to chair', common: true },
  { id: 'task_501', name: 'Transfer Assistance - Chair to Bed', category: 'Mobility', description: 'Assist with transfer from chair to bed', common: true },
  { id: 'task_503', name: 'Walking Assistance', category: 'Mobility', description: 'Assist client with walking', common: true },
  { id: 'task_600', name: 'Companionship Visit', category: 'Social Support', description: 'Provide social interaction and company', common: true },
  { id: 'task_700', name: 'Medical Appointment Transport', category: 'Transportation', description: 'Transport to medical appointments', common: true },
  { id: 'task_801', name: 'Client Assessment', category: 'Administration', description: 'Complete client assessment', common: true },
  { id: 'task_804', name: 'Family Communication', category: 'Administration', description: 'Communicate with family members', common: true },
  { id: 'task_900', name: 'Home Safety Inspection', category: 'Safety', description: 'Inspect home for safety hazards', common: true },
];

export const SITE_TYPES: Record<string, { name: string; color: string; icon: string }> = {
  home_care: { name: 'Home Care', color: '#0d6efd', icon: 'bi-house-heart-fill' },
  residential_care: { name: 'Residential Care', color: '#28a745', icon: 'bi-building' },
  assisted_living: { name: 'Assisted Living', color: '#20c997', icon: 'bi-house-check-fill' },
  dementia_care: { name: 'Dementia Care', color: '#6f42c1', icon: 'bi-heart-pulse-fill' },
  hospice: { name: 'Hospice', color: '#6c757d', icon: 'bi-heart-pulse' },
  respite_care: { name: 'Respite Care', color: '#e83e8c', icon: 'bi-moon-stars-fill' },
  other: { name: 'Other/Custom', color: '#adb5bd', icon: 'bi-gear-fill' },
};

export const COMPLIANCE_DEADLINES = [
  { key: 'annualRegistration', date: '31 March', label: 'Annual Registration Renewal', description: 'Renew Health and Disability Services registration' },
  { key: 'insuranceRenewal', date: '1 April', label: 'Professional Indemnity Insurance Renewal', description: 'Renew professional indemnity and public liability insurance' },
  { key: 'privacyAudit', date: '1 June', label: 'Privacy Act Compliance Review', description: 'Annual review of privacy policies and data protection measures' },
  { key: 'recordKeepingAudit', date: '30 June', label: 'Record Keeping Compliance Audit', description: 'Annual audit of client records and documentation compliance' },
  { key: 'healthSafetyReview', date: '1 September', label: 'Health & Safety Policy Review', description: 'Review and update health and safety policies and procedures' },
  { key: 'trainingCompliance', date: '31 December', label: 'Annual Training Compliance Review', description: 'Verify all staff training and certifications are current' },
];
