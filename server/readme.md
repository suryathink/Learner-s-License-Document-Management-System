server/
├── src/
│   ├── configs/
│   │   ├── database.ts          # MongoDB connection configuration
│   │   ├── cloudinary.ts        # Cloudinary setup and configuration
│   │   ├── email.ts             # Email service configuration (Resend)
│   │   └── seed.ts              # Database seeding script (create default admin)
│   │
│   ├── controllers/
│   │   ├── authController.ts    # Authentication controller (login, register, etc.)
│   │   ├── submissionController.ts  # Submission controller (create, check status)
│   │   └── adminController.ts   # Admin controller (dashboard, manage submissions)
│   │
│   ├── helpers/
│   │   ├── validation.ts        # Joi validation schemas
│   │   ├── utils.ts             # Utility functions (generate IDs, tokens, etc.)
│   │   └── emailTemplates.ts    # HTML email templates
│   │
│   ├── middlewares/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   ├── upload.ts            # Multer file upload middleware
│   │   ├── errorHandler.ts      # Global error handling middleware
│   │   └── notFound.ts          # 404 not found middleware
│   │
│   ├── models/
│   │   ├── Submission.ts        # Mongoose submission model
│   │   └── Admin.ts             # Mongoose admin model
│   │
│   ├── routes/
│   │   ├── authRoutes.ts        # Authentication routes
│   │   ├── submissionRoutes.ts  # Submission routes (public)
│   │   └── adminRoutes.ts       # Admin routes (protected)
│   │
│   ├── services/
│   │   ├── submissionService.ts # Submission business logic
│   │   ├── cloudinaryService.ts # File upload/management service
│   │   ├── emailService.ts      # Email sending service
│   │   └── adminService.ts      # Admin management service
│   │
│   ├── index.ts                 # Main server entry point
│   └── healthcheck.ts           # Health check script for Docker
│
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── Dockerfile                  # Docker container configuration
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
└── .dockerignore                # Docker ignore rules