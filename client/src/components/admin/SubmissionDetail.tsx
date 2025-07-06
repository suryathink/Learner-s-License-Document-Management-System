import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { submissionService } from '../services/submissionService';
import { useForm } from '../hooks';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Badge, 
  Select, 
  Textarea, 
  Modal 
} from '@/components/ui';
import { Submission, StatusUpdateFormData, SubmissionStatus } from '../types';
import { formatDate, formatDateTime, calculateAge, copyToClipboard } from '../utils';
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  Edit, 
  Save, 
  X, 
  Copy, 
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const initialFormValues: StatusUpdateFormData = {
    status: 'pending',
    internalNotes: '',
  };

  const { values, setValue, handleSubmit, isSubmitting } = useForm(initialFormValues);

  useEffect(() => {
    if (!id) return;

    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const data = await submissionService.getSubmissionById(id);
        setSubmission(data);
        setValue('status', data.status);
        setValue('internalNotes', data.internalNotes || '');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch submission');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, setValue]);

  const handleStatusUpdate = async (formData: StatusUpdateFormData) => {
    if (!submission) return;

    try {
      const updatedSubmission = await submissionService.updateSubmissionStatus(
        submission._id,
        formData
      );
      setSubmission(updatedSubmission);
      setIsEditing(false);
      toast.success('Status updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!submission) return;

    try {
      await submissionService.deleteSubmission(submission._id);
      toast.success('Submission deleted successfully');
      navigate('/admin/submissions');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete submission');
    }
  };

  const handleCopyId = () => {
    if (submission) {
      copyToClipboard(submission.submissionId);
      setCopiedId(true);
      toast.success('Submission ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Submission not found'}
          </h3>
          <Link to="/admin/submissions">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Submissions
            </Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/submissions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{submission.fullName}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">ID: {submission.submissionId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyId}
                className="p-1"
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-success-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant={
              submission.status === 'approved' ? 'success' :
              submission.status === 'rejected' ? 'danger' : 'warning'
            }
            size="lg"
          >
            {submission.status.toUpperCase()}
          </Badge>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'outline' : 'primary'}
            size="sm"
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Update Status
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <User className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{submission.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {formatDate(submission.dateOfBirth)} 
                      <span className="text-gray-500 ml-2">
                        (Age: {calculateAge(submission.dateOfBirth)})
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{submission.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{submission.phoneNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {submission.address.street}, {submission.address.city}, {submission.address.state} - {submission.address.pincode}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold">Documents</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {Object.entries(submission.documents).map(([key, doc]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium capitalize">{key}</p>
                      <p className="text-sm text-gray-500">{doc.originalName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc.url, doc.originalName)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-semibold">Status History</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {submission.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            history.status === 'approved' ? 'success' :
                            history.status === 'rejected' ? 'danger' : 'warning'
                          }
                          size="sm"
                        >
                          {history.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(history.changedAt)}
                        </span>
                        {history.changedBy && (
                          <span className="text-sm text-gray-500">
                            by {history.changedBy}
                          </span>
                        )}
                      </div>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update Form */}
          {isEditing && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Update Status</h3>
              </CardHeader>
              <CardBody>
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleStatusUpdate); }}>
                  <div className="space-y-4">
                    <Select
                      label="Status"
                      options={statusOptions}
                      value={values.status}
                      onChange={(e) => setValue('status', e.target.value as SubmissionStatus)}
                      required
                    />
                    <Textarea
                      label="Internal Notes"
                      placeholder="Add notes about this status change..."
                      value={values.internalNotes || ''}
                      onChange={(e) => setValue('internalNotes', e.target.value)}
                      rows={3}
                    />
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Update Status
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Submission Info</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium">{formatDateTime(submission.submittedAt)}</p>
              </div>
              {submission.reviewedAt && (
                <div>
                  <p className="text-sm text-gray-500">Last Reviewed</p>
                  <p className="font-medium">{formatDateTime(submission.reviewedAt)}</p>
                </div>
              )}
              {submission.reviewedBy && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed By</p>
                  <p className="font-medium">{submission.reviewedBy}</p>
                </div>
              )}
              {submission.internalNotes && (
                <div>
                  <p className="text-sm text-gray-500">Internal Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{submission.internalNotes}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Actions</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(`/track/${submission.submissionId}`, '_blank')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Status
              </Button>
              <Button
                variant="danger"
                className="w-full justify-start"
                onClick={() => setShowDeleteModal(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Delete Submission
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Submission"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this submission? This action cannot be undone.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};