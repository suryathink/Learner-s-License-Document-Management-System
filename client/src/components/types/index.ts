// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// User/Admin Types
export interface Admin {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  admin: Admin;
  token: string;
}

// Submission Types
export interface Document {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface StatusHistoryItem {
  status: SubmissionStatus;
  changedAt: string;
  changedBy?: string;
  notes?: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface Submission {
  _id: string;
  submissionId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  address: Address;
  documents: {
    aadhaar: Document;
    photograph: Document;
    signature: Document;
  };
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  internalNotes?: string;
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface SubmissionFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  address: Address;
  aadhaar: File | null;
  photograph: File | null;
  signature: File | null;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StatusUpdateFormData {
  status: SubmissionStatus;
  internalNotes?: string;
}

// Query/Filter Types
export interface SubmissionFilters {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  sortBy?: 'submittedAt' | 'fullName' | 'status';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Statistics Types
export interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminStats {
  total: number;
  active: number;
  recentLogins: number;
  inactive: number;
}

export interface DashboardStats {
  submissions: SubmissionStats;
  admins: AdminStats;
}

// UI Component Types
export interface TabItem {
  key: string;
  label: string;
  icon?: React.ComponentType<any>;
}

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ComponentType<any>;
  onClick: () => void;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  align?: 'left' | 'center' | 'right';
}

// File Upload Types
export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  multiple?: boolean;
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  disabled?: boolean;
  error?: string;
  files?: File[];
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Route Types
export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  protected?: boolean;
  adminOnly?: boolean;
  title?: string;
}

// Context Types
export interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Hook Types
export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

// Error Types
export interface ApiError {
  message: string;
  errors?: string[];
  status?: number;
}