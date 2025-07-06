import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { submissionService } from './services/submissionService';
import { Input, Button, Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { formatDate } from './utils';
import { Search, CheckCircle, Clock, XCircle, User, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubmissionStatus {
  submissionId: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  applicantName: string;
}

export const StatusTracker: React.FC = () => {
  const { submissionId: urlSubmissionId } = useParams<{ submissionId: string }>();
  const [searchId, setSearchId] = useState(urlSubmissionId || '');
  const [submissionData, setSubmissionData] = useState<SubmissionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSearch = async (id: string = searchId) => {
    if (!id.trim()) {
      toast.error('Please enter a submission ID');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await submissionService.checkSubmissionStatus(id.trim());
      setSubmissionData(data);
    } catch (err: any) {
      setError(err.message || 'Submission not found');
      setSubmissionData(null);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if submission ID is in URL
  useEffect(() => {
    if (urlSubmissionId) {
      handleSearch(urlSubmissionId);
    }
  }, [urlSubmissionId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-danger-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-warning-600" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return {
          title: 'Application Approved! 🎉',
          message: 'Congratulations! Your learner\'s license application has been approved. You can now proceed to book your driving test.',
          className: 'bg-success-50 border-success-200',
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          message: 'Unfortunately, your application has been rejected. Please check the requirements and submit a new application.',
          className: 'bg-danger-50 border-danger-200',
        };
      case 'pending':
      default:
        return {
          title: 'Application Under Review',
          message: 'Your application is currently being reviewed. We\'ll notify you once the review is complete.',
          className: 'bg-warning-50 border-warning-200',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Application
          </h1>
          <p className="text-gray-600">
            Enter your submission ID to check the status of your learner's license application
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter your submission ID (e.g., LL12345678)"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                loading={loading}
                className="sm:w-auto w-full"
              >
                Track Status
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardBody className="text-center py-8">
              <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Submission Not Found
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                Please check your submission ID and try again. If you continue to have issues, contact support.
              </p>
            </CardBody>
          </Card>
        )}

        {/* Results */}
        {submissionData && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className={getStatusMessage(submissionData.status).className}>
              <CardBody className="text-center py-8">
                <div className="flex justify-center mb-4">
                  {getStatusIcon(submissionData.status)}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {getStatusMessage(submissionData.status).title}
                </h2>
                <p className="text-gray-700 mb-4">
                  {getStatusMessage(submissionData.status).message}
                </p>
                <Badge
                  variant={
                    submissionData.status === 'approved' ? 'success' :
                    submissionData.status === 'rejected' ? 'danger' : 'warning'
                  }
                  size="lg"
                >
                  {submissionData.status.toUpperCase()}
                </Badge>
              </CardBody>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Applicant Name</p>
                      <p className="font-medium text-gray-900">{submissionData.applicantName}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Submission ID</p>
                      <p className="font-mono font-medium text-gray-900">{submissionData.submissionId}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Submitted On</p>
                      <p className="font-medium text-gray-900">{formatDate(submissionData.submittedAt)}</p>
                    </div>
                  </div>

                  {submissionData.reviewedAt && (
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Reviewed On</p>
                        <p className="font-medium text-gray-900">{formatDate(submissionData.reviewedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Next Steps */}
            {submissionData.status === 'approved' && (
              <Card className="bg-primary-50 border-primary-200">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-primary-900">Next Steps</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        1
                      </div>
                      <p className="text-primary-800">Visit your nearest RTO office with required documents</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        2
                      </div>
                      <p className="text-primary-800">Book your driving test appointment</p>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        3
                      </div>
                      <p className="text-primary-800">Carry this approval confirmation with you</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardBody className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your application or need assistance, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>+91 1800-XXX-XXXX</span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span>support@learnerlicense.com</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};