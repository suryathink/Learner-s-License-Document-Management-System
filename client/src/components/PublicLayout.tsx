import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Car, FileText, Search, Shield } from 'lucide-react';
import { cn } from './utils';

const navigation = [
  { name: 'Apply for License', href: '/apply', icon: FileText },
  { name: 'Track Application', href: '/track', icon: Search },
];

export const PublicLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/apply" className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Learner's License
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Online Application System
                  </p>
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                               location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'text-primary-700 bg-primary-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Admin Link */}
            <Link
              to="/admin/login"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <Shield className="w-4 h-4 mr-1" />
              Admin
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <div className="flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || 
                               location.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors flex-1 justify-center',
                      isActive
                        ? 'text-primary-700 bg-primary-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Learner's License
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Simplifying the learner's license application process with our digital platform.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/apply" className="text-sm text-gray-600 hover:text-primary-600">
                    Apply for License
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="text-sm text-gray-600 hover:text-primary-600">
                    Track Application
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                    Requirements
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-primary-600">
                    Help & Support
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: support@learnerlicense.com</p>
                <p>Phone: +91 1800-XXX-XXXX</p>
                <p>Hours: Mon-Fri 9AM-6PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 Learner's License Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};