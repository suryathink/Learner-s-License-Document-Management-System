import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Badge, Button } from '@/components/ui';
import { adminService } from '../services/adminService';
import { DashboardStats, Submission } from '../types';
import { formatDate } from '../utils';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp,
  Eye,
  ArrowRight
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <Card>
    <CardBody className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-center">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`ml-2 flex items-center text-sm ${
              trend.isPositive ? 'text-success-600' : 'text-danger-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
              {trend.value}%
            </div>
          )}
        </div>
      </div>
    </CardBody>
  </Card>
);

export const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    recentSubmissions: Submission[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboard();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardBody className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <XCircle className="w-12 h-12 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  if (!dashboardData) return null;

  const { stats, recentSubmissions } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of learner's license applications and system statistics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Submissions"
          value={stats.submissions.total}
          icon={FileText}
          color="bg-primary-600"
        />
        <StatsCard
          title="Pending Review"
          value={stats.submissions.pending}
          icon={Clock}
          color="bg-warning-600"
        />
        <StatsCard
          title="Approved"
          value={stats.submissions.approved}
          icon={CheckCircle}
          color="bg-success-600"
        />
        <StatsCard
          title="Rejected"
          value={stats.submissions.rejected}
          icon={XCircle}
          color="bg-danger-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
              <Link to="/admin/submissions">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              {recentSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent submissions</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentSubmissions.map((submission) => (
                    <div key={submission._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {submission.fullName}
                            </h4>
                            <Badge 
                              variant={
                                submission.status === 'approved' ? 'success' :
                                submission.status === 'rejected' ? 'danger' : 'warning'
                              }
                              size="sm"
                            >
                              {submission.status}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                            <span>ID: {submission.submissionId}</span>
                            <span>{formatDate(submission.submittedAt)}</span>
                          </div>
                        </div>
                        <Link to={`/admin/submissions/${submission._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Admin Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">System Stats</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Total Admins</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.admins.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-success-500 mr-3" />
                  <span className="text-sm text-gray-600">Active Admins</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.admins.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-primary-500 mr-3" />
                  <span className="text-sm text-gray-600">Recent Logins</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.admins.recentLogins}</span>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <Link to="/admin/submissions?status=pending" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Review Pending ({stats.submissions.pending})
                </Button>
              </Link>
              <Link to="/admin/submissions" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  All Submissions
                </Button>
              </Link>
              {stats.admins.total > 0 && (
                <Link to="/admin/admins" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Admins
                  </Button>
                </Link>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};