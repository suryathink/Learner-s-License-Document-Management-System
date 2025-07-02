import Submission ,{ISubmission} from '../models/Submission';
import { cloudinaryService } from './cloudinaryService';
import { emailService } from './emailService';
import { generateSubmissionId } from '../helpers/utils';

export interface CreateSubmissionData {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: Date;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface SubmissionFilters {
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class SubmissionService {
  async createSubmission(
    data: CreateSubmissionData,
    files: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<ISubmission> {
    try {
      // Generate unique submission ID
      const submissionId = generateSubmissionId();

      // Upload files to Cloudinary
      const documentUploads = await Promise.all([
        cloudinaryService.uploadFile(files.aadhaar[0], 'aadhaar', submissionId),
        cloudinaryService.uploadFile(files.photograph[0], 'photograph', submissionId),
        cloudinaryService.uploadFile(files.signature[0], 'signature', submissionId)
      ]);

      // Create submission document
      const submission = new Submission({
        submissionId,
        ...data,
        documents: {
          aadhaar: documentUploads[0],
          photograph: documentUploads[1],
          signature: documentUploads[2]
        }
      });

      await submission.save();

      // Send notifications
      await Promise.all([
        emailService.sendAdminNotification(submission),
        emailService.sendApplicantConfirmation(submission)
      ]);

      return submission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  async getSubmissions(filters: SubmissionFilters = {}) {
    try {
      const {
        status,
        search,
        sortBy = 'submittedAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
      } = filters;

      // Build query
      const query: any = {};
      
      if (status) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { submissionId: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const [submissions, total] = await Promise.all([
        Submission.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select('-documents.aadhaar.publicId -documents.photograph.publicId -documents.signature.publicId'),
        Submission.countDocuments(query)
      ]);

      return {
        submissions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions');
    }
  }

  async getSubmissionById(id: string): Promise<ISubmission | null> {
    try {
      return await Submission.findById(id);
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw new Error('Failed to fetch submission');
    }
  }

  async getSubmissionBySubmissionId(submissionId: string): Promise<ISubmission | null> {
    try {
      return await Submission.findOne({ submissionId });
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw new Error('Failed to fetch submission');
    }
  }

  async updateSubmissionStatus(
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    adminId: string,
    internalNotes?: string
  ): Promise<ISubmission | null> {
    try {
      const submission = await Submission.findById(id);
      
      if (!submission) {
        throw new Error('Submission not found');
      }

      // Update submission
      submission.status = status;
      submission.reviewedAt = new Date();
      submission.reviewedBy = adminId;
      if (internalNotes) {
        submission.internalNotes = internalNotes;
      }

      // Add to status history
      submission.statusHistory.push({
        status,
        changedAt: new Date(),
        changedBy: adminId,
        notes: internalNotes
      });

      await submission.save();

      // Send status update email to applicant
      await emailService.sendStatusUpdate(submission, status, internalNotes);

      return submission;
    } catch (error) {
      console.error('Error updating submission status:', error);
      throw new Error('Failed to update submission status');
    }
  }

  async getSubmissionStats() {
    try {
      const stats = await Submission.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalSubmissions = await Submission.countDocuments();
      
      const statusCounts = {
        pending: 0,
        approved: 0,
        rejected: 0
      };

      stats.forEach(stat => {
        statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
      });

      return {
        total: totalSubmissions,
        ...statusCounts
      };
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      throw new Error('Failed to fetch submission statistics');
    }
  }

  async deleteSubmission(id: string): Promise<boolean> {
    try {
      const submission = await Submission.findById(id);
      
      if (!submission) {
        throw new Error('Submission not found');
      }

      // Delete files from Cloudinary
      await Promise.all([
        cloudinaryService.deleteFile(submission.documents.aadhaar.publicId),
        cloudinaryService.deleteFile(submission.documents.photograph.publicId),
        cloudinaryService.deleteFile(submission.documents.signature.publicId)
      ]);

      // Delete submission from database
      await Submission.findByIdAndDelete(id);

      return true;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission');
    }
  }
}

export const submissionService = new SubmissionService();