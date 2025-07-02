import Joi from 'joi';

// Submission validation schema
export const submissionValidationSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Full name can only contain letters and spaces',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name cannot exceed 100 characters'
    }),

  phoneNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid Indian mobile number'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .required()
    .custom((value, helpers) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18) {
        return helpers.error('date.min');
      }
      return value;
    })
    .messages({
      'date.max': 'Date of birth cannot be in the future',
      'date.min': 'You must be at least 18 years old to apply'
    }),

  address: Joi.object({
    street: Joi.string().trim().min(5).max(200).required(),
    city: Joi.string().trim().min(2).max(50).required(),
    state: Joi.string().trim().min(2).max(50).required(),
    pincode: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'Pincode must be exactly 6 digits'
    })
  }).required()
});

// Admin login validation schema
export const adminLoginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).required()
});

// Status update validation schema
export const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
  internalNotes: Joi.string().max(1000).optional().allow('')
});

// Query parameters validation for submissions list
export const submissionQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
  sortBy: Joi.string().valid('submittedAt', 'fullName', 'status').default('submittedAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().trim().max(100).optional()
});

// Validate file types and sizes
export const validateFileUpload = (files: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredFiles = ['aadhaar', 'photograph', 'signature'];
  
  // Check if all required files are present
  for (const fileType of requiredFiles) {
    if (!files[fileType] || files[fileType].length === 0) {
      errors.push(`${fileType} file is required`);
    }
  }

  // Validate file types and sizes
  Object.keys(files).forEach(fileType => {
    const file = files[fileType][0];
    if (file) {
      // File size validation (2MB)
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`${fileType} file size must be less than 2MB`);
      }

      // File type validation
      const allowedTypes = {
        aadhaar: ['application/pdf', 'image/jpeg', 'image/png'],
        photograph: ['image/jpeg', 'image/png'],
        signature: ['image/jpeg', 'image/png']
      };

      if (!allowedTypes[fileType as keyof typeof allowedTypes]?.includes(file.mimetype)) {
        const allowedStr = fileType === 'aadhaar' ? 'PDF, JPEG, or PNG' : 'JPEG or PNG';
        errors.push(`${fileType} must be a ${allowedStr} file`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};