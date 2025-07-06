import React, { useState } from 'react';
import { useForm } from './hooks';
import { Input, Button, Card, CardHeader, CardBody } from '@/components/ui';
import { FileUpload } from "../components/FileUpload";
import { submissionService } from "./services/submissionService";
import { SubmissionFormData } from "./types";
import { validateEmail, validatePhoneNumber, validatePincode, calculateAge } from './utils';
import { CheckCircle, FileText, User, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface ApplicationFormProps {
  onSuccess?: (submissionId: string) => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSuccess }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>('');

  const initialValues: SubmissionFormData = {
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    aadhaar: null,
    photograph: null,
    signature: null,
  };

  const validateForm = (values: SubmissionFormData): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Personal Information
    if (!values.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (values.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(values.fullName.trim())) {
      errors.fullName = 'Full name can only contain letters and spaces';
    }

    if (!values.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(values.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid Indian mobile number';
    }

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!values.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(values.dateOfBirth);
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old to apply';
      }
    }

    // Address
    if (!values.address.street.trim()) {
      errors['address.street'] = 'Street address is required';
    }

    if (!values.address.city.trim()) {
      errors['address.city'] = 'City is required';
    }

    if (!values.address.state.trim()) {
      errors['address.state'] = 'State is required';
    }

    if (!values.address.pincode) {
      errors['address.pincode'] = 'Pincode is required';
    } else if (!validatePincode(values.address.pincode)) {
      errors['address.pincode'] = 'Please enter a valid 6-digit pincode';
    }

    // Documents
    if (!values.aadhaar) {
      errors.aadhaar = 'Aadhaar document is required';
    }

    if (!values.photograph) {
      errors.photograph = 'Photograph is required';
    }

    if (!values.signature) {
      errors.signature = 'Signature is required';
    }

    return errors;
  };

  const { values, errors, touched, isSubmitting, setValue, setFieldTouched, handleSubmit } = useForm(
    initialValues,
    validateForm
  );

  const onSubmit = async (formData: SubmissionFormData) => {
    try {
      const result = await submissionService.createSubmission(
        formData,
        (progress) => setUploadProgress(progress)
      );

      setSubmissionId(result.submissionId);
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
      
      if (onSuccess) {
        onSuccess(result.submissionId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardBody className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your learner's license application has been received and is being processed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Submission ID:</p>
            <p className="text-lg font-mono font-bold text-primary-600">
              {submissionId}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Please save this ID for tracking your application status
            </p>
          </div>
          <Button
            onClick={() => window.location.href = `/track/${submissionId}`}
            variant="outline"
          >
            Track Application Status
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={values.fullName}
                onChange={(e) => setValue('fullName', e.target.value)}
                onBlur={() => setFieldTouched('fullName')}
                error={touched.fullName ? errors.fullName : ''}
                required
                leftIcon={<User className="w-4 h-4" />}
              />
              
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter your mobile number"
                value={values.phoneNumber}
                onChange={(e) => setValue('phoneNumber', e.target.value)}
                onBlur={() => setFieldTouched('phoneNumber')}
                error={touched.phoneNumber ? errors.phoneNumber : ''}
                required
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                value={values.email}
                onChange={(e) => setValue('email', e.target.value)}
                onBlur={() => setFieldTouched('email')}
                error={touched.email ? errors.email : ''}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />
              
              <Input
                label="Date of Birth"
                type="date"
                value={values.dateOfBirth}
                onChange={(e) => setValue('dateOfBirth', e.target.value)}
                onBlur={() => setFieldTouched('dateOfBirth')}
                error={touched.dateOfBirth ? errors.dateOfBirth : ''}
                required
                leftIcon={<Calendar className="w-4 h-4" />}
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </CardBody>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <Input
              label="Street Address"
              placeholder="Enter your street address"
              value={values.address.street}
              onChange={(e) => setValue('address', { ...values.address, street: e.target.value })}
              onBlur={() => setFieldTouched('address.street')}
              error={touched['address.street'] ? errors['address.street'] : ''}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="City"
                placeholder="Enter your city"
                value={values.address.city}
                onChange={(e) => setValue('address', { ...values.address, city: e.target.value })}
                onBlur={() => setFieldTouched('address.city')}
                error={touched['address.city'] ? errors['address.city'] : ''}
                required
              />
              
              <Input
                label="State"
                placeholder="Enter your state"
                value={values.address.state}
                onChange={(e) => setValue('address', { ...values.address, state: e.target.value })}
                onBlur={() => setFieldTouched('address.state')}
                error={touched['address.state'] ? errors['address.state'] : ''}
                required
              />
              
              <Input
                label="Pincode"
                placeholder="Enter 6-digit pincode"
                value={values.address.pincode}
                onChange={(e) => setValue('address', { ...values.address, pincode: e.target.value })}
                onBlur={() => setFieldTouched('address.pincode')}
                error={touched['address.pincode'] ? errors['address.pincode'] : ''}
                required
                maxLength={6}
              />
            </div>
          </CardBody>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Document Upload</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Upload clear, high-quality images or PDF files. Maximum file size: 2MB each.
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            <FileUpload
              label="Aadhaar Card"
              accept=".pdf,.jpg,.jpeg,.png"
              maxSize={2 * 1024 * 1024}
              onFileSelect={(file) => setValue('aadhaar', file)}
              currentFile={values.aadhaar}
              error={touched.aadhaar ? errors.aadhaar : ''}
              required
              helperText="Upload your Aadhaar card (front side) in PDF, JPG, or PNG format"
            />
            
            <FileUpload
              label="Passport Size Photograph"
              accept=".jpg,.jpeg,.png"
              maxSize={2 * 1024 * 1024}
              onFileSelect={(file) => setValue('photograph', file)}
              currentFile={values.photograph}
              error={touched.photograph ? errors.photograph : ''}
              required
              helperText="Upload a recent passport-size photograph in JPG or PNG format"
            />
            
            <FileUpload
              label="Signature"
              accept=".jpg,.jpeg,.png"
              maxSize={2 * 1024 * 1024}
              onFileSelect={(file) => setValue('signature', file)}
              currentFile={values.signature}
              error={touched.signature ? errors.signature : ''}
              required
              helperText="Upload your signature in JPG or PNG format"
            />
          </CardBody>
        </Card>

        {/* Progress Bar (shown during upload) */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Card>
            <CardBody>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Uploading documents...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            disabled={uploadProgress > 0 && uploadProgress < 100}
            className="px-8"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </form>
  );
};