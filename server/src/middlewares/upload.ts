import multer from 'multer';
import { Request } from 'express';

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'));
  }
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 3 // Maximum 3 files (aadhaar, photograph, signature)
  },
  fileFilter
});

// Middleware for handling multiple file uploads
export const uploadDocuments = upload.fields([
  { name: 'aadhaar', maxCount: 1 },
  { name: 'photograph', maxCount: 1 },
  { name: 'signature', maxCount: 1 }
]);

// Single file upload middleware (for admin updates)
export const uploadSingle = upload.single('document');

export default upload;