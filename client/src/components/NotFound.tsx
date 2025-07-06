import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { Home, ArrowLeft, Search, FileText } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have mistyped the URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/apply">
              <Button className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Or try one of these:</p>
            <div className="space-y-2">
              <Link
                to="/apply"
                className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Apply for Learner's License
              </Link>
              <Link
                to="/track"
                className="block text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Search className="w-4 h-4 inline mr-2" />
                Track Your Application
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};