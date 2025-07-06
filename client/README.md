# Learner's License Frontend

A modern React application for the Learner's License Management System, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

### Public Features

- **Online Application Form**: Multi-step form with validation and file uploads
- **Application Status Tracking**: Check application status using submission ID
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **File Upload**: Drag & drop file upload with preview for Aadhaar, photo, and signature

### Admin Features

- **Admin Dashboard**: Overview of submissions and statistics
- **Submission Management**: View, filter, and manage all applications
- **Status Updates**: Update application status with internal notes
- **Document Preview**: View uploaded documents directly in the browser
- **User Management**: Admin authentication and session management

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Utilities**: date-fns

## 📦 Installation

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running on port 5000

### Setup Steps

1. **Clone and Navigate**

   ```bash
   git clone <repository-url>
   cd learners-license-frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:

   ```bash
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Learner's License Management System
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Public Site: http://localhost:3000
   - Admin Login: http://localhost:3000/admin/login

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── admin/          # Admin-specific components
│   └── ...             # Feature components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── App.tsx            # Main app component
```

## 🎯 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🔐 Authentication

### Admin Login

- **Default Credentials**: `admin` / `admin123`
- **JWT Token**: Stored in localStorage
- **Auto-logout**: On token expiry
- **Protected Routes**: Admin routes require authentication

### Route Protection

- Public routes: `/`, `/apply`, `/track`
- Protected routes: `/admin/*`
- Auto-redirect to login for unauthenticated users

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Enhanced layout for tablets (768px+)
- **Desktop**: Full-featured desktop experience (1024px+)

## 🎨 UI Components

### Core Components

- **Button**: Multiple variants and sizes
- **Input**: Form inputs with validation states
- **Card**: Flexible content containers
- **Modal**: Reusable dialog boxes
- **Badge**: Status indicators
- **Spinner**: Loading indicators

### Form Components

- **FileUpload**: Drag & drop file upload
- **Select**: Dropdown selections
- **Textarea**: Multi-line text input

## 🔄 State Management

### Context API

- **AuthContext**: Global authentication state
- **useAuth**: Hook for accessing auth state

### Custom Hooks

- **useApi**: Generic API call hook
- **useForm**: Form state management
- **usePagination**: Pagination logic
- **useDebounce**: Debounced values

## 🌐 API Integration

### Services

- **authService**: Authentication operations
- **submissionService**: Application management
- **adminService**: Admin operations

### Error Handling

- Global error interceptors
- Toast notifications for errors
- Graceful fallbacks

## 📊 Features Overview

### Public Application Form

```typescript
// Multi-step form with validation
const ApplicationForm = () => {
  // Form validation
  // File upload handling
  // Progress tracking
  // Success confirmation
};
```

### Admin Dashboard

```typescript
// Statistics and recent submissions
const Dashboard = () => {
  // Stats cards
  // Recent submissions list
  // Quick actions
};
```

### Status Tracker

```typescript
// Public status checking
const StatusTracker = () => {
  // Submission ID lookup
  // Status display
  // Timeline view
};
```

## 🔒 Security Features

- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based authentication
- **Route Protection**: Authentication guards
- **Secure Headers**: Security-first configuration

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### Environment Variables for Production

```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Learner's License Management System
```

## 🧪 Testing

### Component Testing

```bash
# Add testing dependencies
npm install -D @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

## 📈 Performance

### Optimization Features

- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and bundle optimization
- **Caching**: Browser caching strategies

### Bundle Analysis

```bash
npm run build -- --analyze
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**

   - Check VITE_API_URL in .env
   - Ensure backend is running on port 5000

2. **Build Errors**

   - Clear node_modules and reinstall
   - Check TypeScript errors

3. **Authentication Issues**
   - Clear localStorage
   - Check JWT token expiry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Email: suryaprakashsingh110@gmail.com
- Create an issue in the repository
- Check the documentation

---

Built with ❤️ using React, TypeScript, and Vite
