import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import { cn, formatFileSize, isImageFile, isPdfFile } from './utils';

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File | null) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  currentFile?: File | null;
  helperText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 2 * 1024 * 1024, // 2MB default
  onFileSelect,
  error,
  required = false,
  disabled = false,
  currentFile,
  helperText,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${formatFileSize(maxSize)}`;
    }

    // Check file type based on accept prop
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;

    const isValidType = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return mimeType.startsWith(type.replace('/*', ''));
    });

    if (!isValidType) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError('');
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(event.dataTransfer.files);
    const file = files[0];
    
    if (file && files.length === 1) {
      handleFileSelect(file);
    } else if (files.length > 1) {
      setUploadError('Please select only one file');
    }
  }, [disabled, handleFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setUploadError('');
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const getFileIcon = (file: File) => {
    if (isImageFile(file)) {
      return <Image className="w-8 h-8 text-blue-500" />;
    } else if (isPdfFile(file)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const displayError = error || uploadError;

  return (
    <div className="w-full">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      {!currentFile ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 transition-all duration-200',
            'hover:border-primary-400 hover:bg-primary-50',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'cursor-pointer',
            isDragOver && 'border-primary-400 bg-primary-50',
            displayError ? 'border-danger-300 bg-danger-50' : 'border-gray-300 bg-gray-50'
          )}
        >
          <div className="text-center">
            <Upload className={cn(
              'mx-auto h-12 w-12 mb-4',
              displayError ? 'text-danger-400' : 'text-gray-400'
            )} />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary-600">Click to upload</span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {accept.replace(/\./g, '').toUpperCase()} up to {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      ) : (
        // File Preview
        <div className={cn(
          'flex items-center p-4 bg-gray-50 border rounded-lg',
          displayError ? 'border-danger-300' : 'border-gray-200'
        )}>
          {getFileIcon(currentFile)}
          <div className="flex-1 ml-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(currentFile.size)}
            </p>
          </div>
          {!disabled && (
            <button
              onClick={handleRemoveFile}
              className="ml-3 text-gray-400 hover:text-danger-600 transition-colors"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {displayError && (
        <div className="mt-2 flex items-center text-sm text-danger-600">
          <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !displayError && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};