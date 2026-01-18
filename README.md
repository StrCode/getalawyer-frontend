# GetALawyer Frontend

A modern, full-featured legal services platform frontend built with React, TypeScript, and TanStack technologies. This application provides a comprehensive onboarding system for lawyers, an admin dashboard for platform management, and a client interface for finding and connecting with legal professionals.

## 🎯 Project Overview

GetALawyer is a lawyer-client matching platform that streamlines the process of connecting clients with qualified legal professionals. The frontend handles:

- **Lawyer Onboarding**: A sophisticated 3-step registration process with document verification and specialization selection
- **Admin Dashboard**: Comprehensive management tools for reviewing applications, managing users, and monitoring platform analytics
- **Client Portal**: Interface for clients to find lawyers, manage their profiles, and track their legal needs
- **Real-time Synchronization**: Draft management and offline-first capabilities for seamless user experience

## 🏗️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) - Full-stack React framework with SSR support
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - High-quality, accessible React components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Form Management**: [React Hook Form](https://react-hook-form.com/) + [TanStack Form](https://tanstack.com/form)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) - Powerful server state management
- **Routing**: [TanStack Router](https://tanstack.com/router) - Type-safe routing
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- **Authentication**: [Better Auth](https://better-auth.com/) - Modern authentication solution
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Tables**: [TanStack Table](https://tanstack.com/table) - Headless table library
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **File Upload**: [Cloudinary](https://cloudinary.com/) - Cloud-based file management
- **Testing**: [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/              # Admin dashboard components
│   │   ├── AdminLayout.tsx
│   │   ├── ApplicationManagement.tsx
│   │   ├── UserManagement.tsx
│   │   ├── DashboardOverview.tsx
│   │   └── ...
│   ├── auth/               # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ...
│   ├── onboarding/         # Lawyer onboarding flow
│   │   ├── step-navigator.tsx
│   │   ├── progress-tracker.tsx
│   │   ├── photo-uploader.tsx
│   │   ├── specializations.tsx
│   │   └── ...
│   ├── dashboard/          # User dashboard components
│   ├── settings/           # Settings components
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── hooks/                  # Custom React hooks
│   ├── use-draft-manager.ts
│   ├── use-onboarding-status.ts
│   ├── use-admin-queries.ts
│   └── ...
├── lib/
│   ├── api/
│   │   └── client.ts       # API client configuration
│   ├── auth-client.ts      # Better Auth client
│   ├── onboarding-sync.ts  # Sync utilities
│   └── utils.ts
├── services/               # Business logic services
│   ├── nin-verification.ts
│   ├── photo-upload.ts
│   └── ...
├── stores/                 # Zustand state stores
│   ├── enhanced-onboarding-store.ts
│   ├── onBoardingClient.ts
│   └── onBoardingLawyer.ts
├── utils/                  # Utility functions
│   ├── draft-manager.ts
│   ├── validation-engine.ts
│   ├── step-validator.ts
│   ├── progress-tracker.ts
│   └── ...
├── routes/                 # TanStack Router routes
├── router.tsx              # Router configuration
└── styles.css              # Global styles
```

## 🚀 Key Features

### Lawyer Onboarding System
- **Step 1: Practice Information** - Collect professional details, bar license info, and experience
- **Step 2: Document Upload** - Secure document verification with cloud storage
- **Step 3: Specializations** - Select practice areas and years of experience
- **Draft Management** - Auto-save functionality with offline support
- **Progress Tracking** - Visual progress indicators and step validation
- **Application Status** - Real-time status updates and notifications

### Admin Dashboard
- **Application Management** - Review, approve, or reject lawyer applications
- **User Management** - Manage lawyers and clients with advanced filtering
- **Analytics & Statistics** - Platform metrics, trends, and performance data
- **Bulk Operations** - Perform actions on multiple users/applications
- **Filter Presets** - Save and reuse custom filter configurations
- **Data Export** - Export data in multiple formats (CSV, Excel, PDF)
- **Communication Tools** - Send notifications and manage communications

### Client Portal
- **Profile Management** - Update personal and company information
- **Specialization Selection** - Find lawyers by practice areas
- **Lawyer Discovery** - Search and filter available lawyers
- **Application Tracking** - Monitor lawyer application status
- **Avatar Upload** - Profile image management with optimization

### Technical Features
- **Offline-First Architecture** - Works seamlessly with limited connectivity
- **Real-time Sync** - Automatic synchronization with backend
- **Type Safety** - Full TypeScript support throughout
- **Responsive Design** - Mobile-first, works on all devices
- **Accessibility** - WCAG compliant components and interactions
- **Error Handling** - Comprehensive error recovery and user feedback
- **Performance Optimized** - Lazy loading, code splitting, and caching

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd getalawyer-front

# Install dependencies
npm install
# or
bun install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your API endpoints and service credentials
```

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_APP_URL=https://your-frontend-domain.com

# File Upload (Cloudinary)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Authentication
VITE_BETTER_AUTH_URL=https://your-backend-domain.com/api/auth
```

## 📦 Available Scripts

```bash
# Development server (runs on port 3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Preview production build
npm run serve

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint

# Check code quality
npm run check
```

## 🔌 API Integration

The frontend integrates with a comprehensive backend API. Key endpoints include:

### Lawyer Onboarding
- `GET /api/lawyers/onboarding/status` - Get current onboarding progress
- `PATCH /api/lawyers/onboarding/practice-info` - Save practice information
- `PATCH /api/lawyers/onboarding/documents` - Save documents
- `POST /api/lawyers/onboarding/complete` - Complete onboarding

### Admin Routes
- `GET /api/admin/applications` - List applications with filtering
- `GET /api/admin/users` - List users with advanced search
- `PATCH /api/admin/applications/:id/approve` - Approve application
- `PATCH /api/admin/applications/:id/reject` - Reject application
- `GET /api/admin/statistics` - Platform analytics

### Client Routes
- `GET /api/clients/me` - Get current user profile
- `PATCH /api/clients/me` - Update profile
- `POST /api/clients/upload-avatar` - Upload profile image
- `POST /api/clients/onboarding/complete` - Complete client onboarding

### Specializations
- `GET /api/specializations` - Get all specializations
- `GET /api/specializations/:id` - Get specialization details

For complete API documentation, see [API_ROUTES_DOCUMENTATION.md](./API_ROUTES_DOCUMENTATION.md)

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

### Test Structure
- Unit tests for utilities and services
- Component tests for UI components
- Integration tests for complex features
- Property-based tests for validation logic

Test files are co-located with source files using `.test.ts` or `.test.tsx` suffix.

## 📊 State Management

### Zustand Stores
- `enhanced-onboarding-store.ts` - Lawyer onboarding state
- `onBoardingClient.ts` - Client onboarding state
- `onBoardingLawyer.ts` - Lawyer profile state

### TanStack Query
- Server state management for API data
- Automatic caching and synchronization
- Devtools for debugging

## 🎨 UI Components

The project uses shadcn/ui components with Tailwind CSS:

- Form components (Input, Select, Checkbox, etc.)
- Layout components (Card, Dialog, Sheet, etc.)
- Data display (Table, Badge, Progress, etc.)
- Navigation (Sidebar, Breadcrumb, etc.)
- Feedback (Toast, Alert, Skeleton, etc.)

All components are fully customizable and accessible.

## 🔐 Authentication

Built with Better Auth:
- Email/password authentication
- Social login (Google, Facebook)
- Session management
- Role-based access control (User, Reviewer, Admin, Super Admin)
- Automatic token refresh

## 📱 Responsive Design

The application is fully responsive:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚀 Performance

- Code splitting with route-based lazy loading
- Image optimization with Cloudinary
- CSS-in-JS with Tailwind for minimal bundle size
- React Query caching for reduced API calls
- Service worker support for offline functionality

## 🐛 Debugging

### Development Tools
- React DevTools
- TanStack Router DevTools
- TanStack Query DevTools
- Browser DevTools

Enable devtools in development:
```typescript
// Automatically enabled in development mode
// Check src/integrations/tanstack-query/devtools.tsx
```

## 📚 Documentation

- [API Routes Documentation](./API_ROUTES_DOCUMENTATION.md) - Complete API reference
- [Lawyer Onboarding Requirements](./lawyer-onboarding-frontend-requirements.md) - Detailed requirements
- [Draft Management System](./src/docs/draft-management-system.md) - Draft system documentation

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 Code Style

- ESLint for code quality
- Prettier for code formatting
- Biome for linting and formatting
- TypeScript for type safety

Run checks before committing:
```bash
npm run lint
npm run format
npm run check
```

## 🔄 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Production
```bash
npm start
```

The application is configured for deployment on:
- Vercel
- Railway
- Any Node.js hosting platform

### Environment Setup for Deployment
Ensure all environment variables are set in your deployment platform:
- `VITE_API_BASE_URL`
- `VITE_APP_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_BETTER_AUTH_URL`

## 📞 Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review API documentation
3. Check test files for usage examples
4. Open an issue with detailed information

## 📄 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- [TanStack](https://tanstack.com/) - Router, Query, Form, Table, Start
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Better Auth](https://better-auth.com/) - Authentication
- [Cloudinary](https://cloudinary.com/) - File management

---

**Last Updated**: January 2026
**Version**: 1.0.0
