import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface ISubmission extends Document {
  submissionId: string;
  
  // Personal Information
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
  
  // Documents
  documents: {
    aadhaar: IDocument;
    photograph: IDocument;
    signature: IDocument;
  };
  
  // System fields
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  internalNotes?: string;
  
  // Audit trail
  statusHistory: Array<{
    status: 'pending' | 'approved' | 'rejected';
    changedAt: Date;
    changedBy?: string;
    notes?: string;
  }>;
}

const documentSchema = new Schema<IDocument>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const submissionSchema = new Schema<ISubmission>({
  submissionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Personal Information
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^[6-9]\d{9}$/ // Indian mobile number pattern
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(date: Date) {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 18;
      },
      message: 'Applicant must be at least 18 years old'
    }
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { 
      type: String, 
      required: true, 
      match: /^\d{6}$/ // Indian pincode pattern
    }
  },
  
  // Documents
  documents: {
    aadhaar: { type: documentSchema, required: true },
    photograph: { type: documentSchema, required: true },
    signature: { type: documentSchema, required: true }
  },
  
  // System fields
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  },
  internalNotes: {
    type: String,
    maxlength: 1000
  },
  
  // Audit trail
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: String
    },
    notes: {
      type: String,
      maxlength: 500
    }
  }]
}, {
  timestamps: true
});

submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ email: 1 });
submissionSchema.index({ phoneNumber: 1 });

// Middleware to add initial status to history
submissionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory = [{
      status: 'pending',
      changedAt: new Date(),
      notes: 'Application submitted'
    }];
  }
  next();
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);