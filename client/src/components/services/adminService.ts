import { apiClient } from './api';
import { DashboardStats, Admin, Submission } from '../types';

export const adminService = {
  // Get dashboard data
  async getDashboard(): Promise<{
    stats: DashboardStats;
    recentSubmissions: Submission[];
  }> {
    const response = await apiClient.get<{
      stats: DashboardStats;
      recentSubmissions: Submission[];
    }>('/api/admin/dashboard');
    return response.data!;
  },

  // Get statistics
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/api/admin/stats');
    return response.data!;
  },

  // Admin management (Super Admin only)
  async getAllAdmins(): Promise<Admin[]> {
    const response = await apiClient.get<{ admins: Admin[] }>('/api/admin/admins');
    return response.data!.admins;
  },

  async createAdmin(data: {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'super_admin';
  }): Promise<Admin> {
    const response = await apiClient.post<{ admin: Admin }>('/api/admin/admins', data);
    return response.data!.admin;
  },

  async updateAdmin(id: string, data: Partial<Admin>): Promise<Admin> {
    const response = await apiClient.put<{ admin: Admin }>(`/api/admin/admins/${id}`, data);
    return response.data!.admin;
  },

  async deactivateAdmin(id: string): Promise<void> {
    await apiClient.delete(`/apij/admin/admins/${id}`);
  },
};