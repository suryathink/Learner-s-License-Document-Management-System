import { apiClient } from './api';
import { LoginFormData, AuthResponse, ChangePasswordFormData, Admin } from '../types';

export const authService = {
  // Admin login
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);
    return response.data!;
  },

  // Get current admin info
  async getMe(): Promise<Admin> {
    const response = await apiClient.get<{ admin: Admin }>('/api/auth/me');
    return response.data!.admin;
  },

  // Change password
  async changePassword(data: ChangePasswordFormData): Promise<void> {
    await apiClient.put('/api/auth/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', { token, newPassword });
  },
};