import { apiClient } from './api';
import { 
  SubmissionFormData, 
  Submission, 
  SubmissionFilters, 
  PaginationResponse,
  StatusUpdateFormData 
} from '../types';

export const submissionService = {
  // Create new submission (public endpoint)
  async createSubmission(
    data: SubmissionFormData,
    onUploadProgress?: (progress: number) => void
  ): Promise<{ submissionId: string; status: string; submittedAt: string }> {
    const formData = new FormData();
    
    // Add form fields
    formData.append('fullName', data.fullName);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('email', data.email);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('address[street]', data.address.street);
    formData.append('address[city]', data.address.city);
    formData.append('address[state]', data.address.state);
    formData.append('address[pincode]', data.address.pincode);
    
    // Add files
    if (data.aadhaar) {
      formData.append('aadhaar', data.aadhaar);
    }
    if (data.photograph) {
      formData.append('photograph', data.photograph);
    }
    if (data.signature) {
      formData.append('signature', data.signature);
    }

    const response = await apiClient.uploadFiles(
      '/submissions',
      formData,
      (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      }
    );
    
    return response.data!;
  },

  // Check submission status (public endpoint)
  async checkSubmissionStatus(submissionId: string): Promise<{
    submissionId: string;
    status: string;
    submittedAt: string;
    reviewedAt?: string;
    applicantName: string;
  }> {
    const response = await apiClient.get(`/submissions/check/${submissionId}`);
    return response.data!;
  },

  // Admin endpoints
  async getSubmissions(filters: SubmissionFilters = {}): Promise<PaginationResponse<Submission>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get<PaginationResponse<Submission>>(
      `/admin/submissions?${params.toString()}`
    );
    return response.data!;
  },

  async getSubmissionById(id: string): Promise<Submission> {
    const response = await apiClient.get<{ submission: Submission }>(`/admin/submissions/${id}`);
    return response.data!.submission;
  },

  async updateSubmissionStatus(
    id: string,
    data: StatusUpdateFormData
  ): Promise<Submission> {
    const response = await apiClient.put<{ submission: Submission }>(
      `/admin/submissions/${id}/status`,
      data
    );
    return response.data!.submission;
  },

  async deleteSubmission(id: string): Promise<void> {
    await apiClient.delete(`/admin/submissions/${id}`);
  },
};