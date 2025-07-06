import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { submissionService } from '../services/submissionService';
import { useSubmissionFilters, useDebounce } from '../hooks';
import { Submission, SubmissionStatus } from '../types';
import {formatDate, formatRelativeTime }from "../utils";

import { Card, CardHeader, CardBody, Input, Select, Button, Badge } from '@/components/ui';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';

export const SubmissionList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const { filters, updateFilter, resetFilters, hasActiveFilters } = useSubmissionFilters();
  const debouncedSearch = useDebounce(filters.search || '', 500);

  // Sync filters with URL params
  useEffect(() => {
    const status = searchParams.get('status') as SubmissionStatus;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    
    if (status !== filters.status || search !== filters.search || page !== filters.page) {
      updateFilter('status', status || undefined);
      updateFilter('search', search || '');
      updateFilter('page', page);
    }
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.page && filters.page > 1) params.set('page', filters.page.toString());
    
    setSearchParams(params);
  }, [filters.status, filters.search, filters.page, setSearchParams]);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const searchTerm = debouncedSearch || filters.search;
        const result = await submissionService.getSubmissions({
          ...filters,
          search: searchTerm,
        });
        
        setSubmissions(result.submissions);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.totalItems);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [filters, debouncedSearch]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const limitOptions = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and review learner's license applications
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by name, email, or ID..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
            <Select
              options={statusOptions}
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value as SubmissionStatus)}
              placeholder="Filter by status"
            />
            <Select
              options={[
                { value: 'submittedAt', label: 'Sort by Date' },
                { value: 'fullName', label: 'Sort by Name' },
                { value: 'status', label: 'Sort by Status' },
              ]}
              value={filters.sortBy || 'submittedAt'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex-1"
              >
                {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium">
              {totalItems} {totalItems === 1 ? 'Submission' : 'Submissions'}
            </span>
          </div>
          <Select
            options={limitOptions}
            value={filters.limit?.toString() || '10'}
            onChange={(e) => updateFilter('limit', parseInt(e.target.value))}
          />
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-danger-600">{error}</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
              <p className="text-gray-600">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more results.' 
                  : 'No applications have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {submissions.map((submission) => (
                <div key={submission._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {submission.fullName}
                        </h3>
                        <Badge
                          variant={
                            submission.status === 'approved' ? 'success' :
                            submission.status === 'rejected' ? 'danger' : 'warning'
                          }
                        >
                          {submission.status}
                        </Badge>
                      </div>
                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">ID:</span> {submission.submissionId}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {submission.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {submission.phoneNumber}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {formatRelativeTime(submission.submittedAt)}
                        </div>
                      </div>
                      {submission.reviewedAt && (
                        <div className="mt-1 text-sm text-gray-500">
                          Reviewed: {formatDate(submission.reviewedAt)} by {submission.reviewedBy}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/admin/submissions/${submission._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.limit || 10), totalItems)} of{' '}
            {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('page', Math.max(1, (filters.page || 1) - 1))}
              disabled={!filters.page || filters.page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                const isActive = page === (filters.page || 1);
                return (
                  <Button
                    key={page}
                    variant={isActive ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => updateFilter('page', page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateFilter('page', totalPages)}
                    className="w-12"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('page', Math.min(totalPages, (filters.page || 1) + 1))}
              disabled={!filters.page || filters.page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};