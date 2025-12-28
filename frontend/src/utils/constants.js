// Constants
// src/utils/constants.js

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician',
  EMPLOYEE: 'employee'
};

export const REQUEST_TYPES = {
  CORRECTIVE: 'corrective',
  PREVENTIVE: 'preventive'
};

export const REQUEST_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in-progress',
  REPAIRED: 'repaired',
  SCRAP: 'scrap'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const EQUIPMENT_CATEGORIES = [
  'Production',
  'IT Equipment',
  'Logistics',
  'HVAC',
  'Electrical',
  'Other'
];

export const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  repaired: 'bg-green-100 text-green-700',
  scrap: 'bg-red-100 text-red-700'
};

export const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};