# API Routes Documentation

This document provides comprehensive documentation for all API routes in the lawyer onboarding platform.

## Authentication

Most routes require authentication via the `authMiddleware`. Admin routes additionally require specific role permissions:
- `adminMiddleware`: Requires `role` in `['reviewer', 'admin', 'super_admin']`
- `superAdminMiddleware`: Requires `role` = `'super_admin'`

## Route Structure

All API routes are prefixed with `/api` and organized by feature:

- `/api/admin/*` - Admin management routes
- `/api/boards/*` - Onboarding status routes  
- `/api/checks/*` - Email validation routes
- `/api/clients/*` - Client management routes
- `/api/country/*` - Country/location data routes
- `/api/lawyers/*` - Lawyer onboarding routes
- `/api/specializations/*` - Legal specialization routes
- `/api/todos/*` - Todo management routes (currently disabled)

---

## Admin Routes (`/api/admin/*`)

### Dashboard & Overview

#### `GET /api/admin/dashboard`
**Purpose**: Retrieves comprehensive dashboard metrics and recent activity  
**Auth**: Admin required  
**Input**: None  
**Output**: 
```json
{
  "success": true,
  "data": {
    "totalUsers": number,
    "totalApplications": number,
    "pendingApplications": number,
    "approvedApplications": number,
    "rejectedApplications": number,
    "recentActivity": Array<ActivityItem>
  }
}
```

### Application Management

#### `GET /api/admin/applications`
**Purpose**: Retrieves applications with filtering, pagination, and advanced search  
**Auth**: Admin required  
**Input**: Query parameters:
- `query` (string): Search query
- `searchFields` (string): Comma-separated fields to search ('lawyerName', 'lawyerEmail', 'barLicenseNumber', 'barAssociation', 'experienceDescription')
- `status` (string): 'pending' | 'approved' | 'rejected'
- `country` (string): Filter by country
- `state` (string): Filter by state
- `reviewerId` (string): Filter by reviewer ID
- `dateFrom` (string): ISO date string
- `dateTo` (string): ISO date string
- `filters` (string): JSON object with additional filters
- `sortBy` (string): 'submittedAt' | 'lawyerName' | 'country' | 'yearsOfExperience' | 'applicationStatus'
- `sortOrder` (string): 'asc' | 'desc'
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `presetId` (string): Filter preset ID to load

**Output**:
```json
{
  "success": true,
  "data": {
    "applications": Array<Application>,
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number
    }
  },
  "searchType": "basic" | "advanced"
}
```

#### `GET /api/admin/applications/:id`
**Purpose**: Retrieves detailed information for a specific application  
**Auth**: Admin required  
**Input**: Path parameter `id` (application ID)  
**Output**:
```json
{
  "success": true,
  "data": {
    "id": string,
    "lawyerName": string,
    "lawyerEmail": string,
    "status": string,
    "submittedAt": string,
    "reviewedAt": string,
    "reviewerId": string,
    "reviewNotes": string,
    "documents": Array<Document>,
    "specializations": Array<Specialization>
  }
}
```

#### `PATCH /api/admin/applications/:id/approve`
**Purpose**: Approves a lawyer application with review notes  
**Auth**: Admin required  
**Input**: 
- Path parameter `id` (application ID)
- Body: `{ "reviewNotes": string }`

**Output**:
```json
{
  "success": true,
  "message": "Application approved successfully"
}
```

#### `PATCH /api/admin/applications/:id/reject`
**Purpose**: Rejects a lawyer application with reason and feedback  
**Auth**: Admin required  
**Input**: 
- Path parameter `id` (application ID)
- Body: `{ "reason": string, "feedback": string }`

**Output**:
```json
{
  "success": true,
  "message": "Application rejected successfully"
}
```

### User Management

#### `GET /api/admin/users`
**Purpose**: Retrieves users with advanced filtering and pagination  
**Auth**: Admin required  
**Input**: Query parameters (similar to applications):
- `query` (string): Search query
- `searchFields` (string): Comma-separated fields ('name', 'email', 'company', 'phoneNumber', 'barLicenseNumber')
- `userType` (string): 'client' | 'lawyer'
- `status` (string): 'active' | 'banned'
- `country`, `state`, `dateFrom`, `dateTo`, `page`, `limit`, `presetId`

**Output**:
```json
{
  "success": true,
  "data": {
    "users": Array<User>,
    "pagination": PaginationInfo
  },
  "searchType": "basic" | "advanced"
}
```

#### `GET /api/admin/users/:id`
**Purpose**: Retrieves detailed information for a specific user  
**Auth**: Admin required  
**Input**: Path parameter `id` (user ID)  
**Output**: User details with associated lawyer/client profile

#### `PATCH /api/admin/users/:id/status`
**Purpose**: Updates user account status (suspend, reactivate, flag)  
**Auth**: Admin required  
**Input**: 
- Path parameter `id` (user ID)
- Body: `{ "status": "suspend" | "reactivate" | "flag", "reason": string, "banExpires"?: string }`

**Output**:
```json
{
  "success": true,
  "message": "User {status} successfully"
}
```

#### `PATCH /api/admin/users/:id/profile`
**Purpose**: Updates user profile information (admin-level modifications)  
**Auth**: Super Admin required  
**Input**: 
- Path parameter `id` (user ID)
- Body: `{ "name"?: string, "email"?: string, "role"?: string }`

**Output**:
```json
{
  "success": true,
  "message": "User profile updated successfully"
}
```

### Lawyer & Client Specific Routes

#### `GET /api/admin/lawyers`
**Purpose**: Retrieves lawyers with filtering (userType forced to 'lawyer')  
**Auth**: Admin required  
**Input**: Same as `/users` but `userType` is automatically set to 'lawyer'  
**Output**: Filtered list of lawyer users

#### `GET /api/admin/lawyers/:id`
**Purpose**: Retrieves detailed information for a specific lawyer  
**Auth**: Admin required  
**Input**: Path parameter `id` (lawyer user ID)  
**Output**: Lawyer user details with verification that user is actually a lawyer

#### `GET /api/admin/clients`
**Purpose**: Retrieves clients with filtering (userType forced to 'client')  
**Auth**: Admin required  
**Input**: Same as `/users` but `userType` is automatically set to 'client'  
**Output**: Filtered list of client users

#### `GET /api/admin/clients/:id`
**Purpose**: Retrieves detailed information for a specific client  
**Auth**: Admin required  
**Input**: Path parameter `id` (client user ID)  
**Output**: Client user details with verification that user is actually a client

### Filter Presets

#### `GET /api/admin/filter-presets`
**Purpose**: Retrieves all filter presets for the current admin user  
**Auth**: Admin required  
**Input**: None  
**Output**: Array of saved filter presets

#### `POST /api/admin/filter-presets`
**Purpose**: Creates a new filter preset  
**Auth**: Admin required  
**Input**: `{ "name": string, "description"?: string, "criteria": object }`  
**Output**: Created preset object

#### `GET /api/admin/filter-presets/:id`
**Purpose**: Retrieves a specific filter preset  
**Auth**: Admin required  
**Input**: Path parameter `id` (preset ID)  
**Output**: Filter preset details

#### `DELETE /api/admin/filter-presets/:id`
**Purpose**: Deletes a filter preset  
**Auth**: Admin required  
**Input**: Path parameter `id` (preset ID)  
**Output**: Success confirmation

### Statistics & Analytics

#### `GET /api/admin/statistics`
**Purpose**: Retrieves platform statistics and analytics with configurable metrics  
**Auth**: Admin required  
**Input**: Query parameters:
- `startDate` (string): ISO date (default: 30 days ago)
- `endDate` (string): ISO date (default: now)
- `groupBy` (string): 'day' | 'week' | 'month' (default: 'day')
- `metrics` (string): Comma-separated list or 'all' (default: 'all')

**Output**:
```json
{
  "success": true,
  "data": {
    "platformStatistics"?: object,
    "userRegistrationTrends"?: Array<object>,
    "applicationSubmissionPatterns"?: Array<object>,
    "approvalRejectionRates"?: object,
    "activityMetrics"?: object
  },
  "metadata": {
    "timeRange": { "startDate": string, "endDate": string },
    "groupBy": string,
    "requestedMetrics": Array<string>,
    "generatedAt": string
  }
}
```

#### `GET /api/admin/statistics/summary`
**Purpose**: Retrieves a quick summary of key platform metrics  
**Auth**: Admin required  
**Input**: Query parameter `days` (number, 1-365, default: 30)  
**Output**: Summary statistics for the specified time period

### Data Export

#### `POST /api/admin/export`
**Purpose**: Exports platform data in various formats (CSV, Excel, PDF)  
**Auth**: Admin required  
**Input**: Export configuration object with type ('users', 'applications', 'audit_log'), format, filters, etc.  
**Output**: File download with appropriate headers

### Bulk Operations

#### `POST /api/admin/bulk/applications`
**Purpose**: Performs bulk operations on multiple applications (approve/reject)  
**Auth**: Super Admin required  
**Input**:
```json
{
  "action": "approve" | "reject",
  "applicationIds": Array<string>,
  "reason": string,
  "feedback"?: string,
  "confirmation": true
}
```
**Output**: Bulk operation results with success/failure counts

#### `POST /api/admin/bulk/users`
**Purpose**: Performs bulk operations on multiple users (suspend/reactivate/flag)  
**Auth**: Super Admin required  
**Input**:
```json
{
  "action": "suspend" | "reactivate" | "flag",
  "userIds": Array<string>,
  "reason": string,
  "banExpires"?: string,
  "confirmation": true
}
```
**Output**: Bulk operation results with success/failure counts

### Notifications & Communications

#### `GET /api/admin/notifications/templates`
**Purpose**: Retrieves all available notification templates  
**Auth**: Admin required  
**Input**: None  
**Output**: Array of notification templates

#### `GET /api/admin/notifications/templates/:id`
**Purpose**: Retrieves a specific notification template  
**Auth**: Admin required  
**Input**: Path parameter `id` (template ID)  
**Output**: Template details

#### `POST /api/admin/notifications/send`
**Purpose**: Sends a personalized notification to a specific user  
**Auth**: Admin required  
**Input**: `{ "templateId": string, "recipientUserId": string, "variables": object }`  
**Output**: Notification sent confirmation with communication ID

#### `POST /api/admin/notifications/bulk`
**Purpose**: Sends bulk communications to users matching targeting criteria  
**Auth**: Admin required  
**Input**: `{ "templateId": string, "targetingCriteria": object, "variables"?: object }`  
**Output**: Bulk communication results

#### `GET /api/admin/communications/history`
**Purpose**: Retrieves communication history with filtering options  
**Auth**: Admin required  
**Input**: Query parameters for filtering by admin, recipient, type, date range, pagination  
**Output**: Paginated communication history

#### `PATCH /api/admin/communications/:id/read`
**Purpose**: Marks a communication as read  
**Auth**: Admin required  
**Input**: Path parameter `id` (communication ID)  
**Output**: Success confirmation

#### `PATCH /api/admin/communications/:id/delivery-status`
**Purpose**: Updates the delivery status of a communication  
**Auth**: Admin required  
**Input**: 
- Path parameter `id` (communication ID)
- Body: `{ "status": "sent" | "delivered" | "failed" | "bounced", "errorMessage"?: string }`

**Output**: Success confirmation

### System Routes

#### `GET /api/admin/system/settings`
**Purpose**: Example super admin route for system settings  
**Auth**: Super Admin required  
**Input**: None  
**Output**: System settings access confirmation

---

## Boards Routes (`/api/boards/*`)

#### `GET /api/boards/`
**Purpose**: Checks user onboarding completion status  
**Auth**: Required  
**Input**: None  
**Output**:
```json
{
  "success": true,
  "onboarding_completed": boolean
}
```

---

## Checks Routes (`/api/checks/*`)

#### `GET /api/checks/:email`
**Purpose**: Checks if an email address is already registered  
**Auth**: None  
**Input**: Path parameter `email` (must be valid email format)  
**Output**:
```json
{
  "success": true,
  "exists": boolean,
  "message": "Email already registered" | "Email available"
}
```

---

## Client Routes (`/api/clients/*`)

### Profile Management

#### `GET /api/clients/me`
**Purpose**: Get current user's complete profile  
**Auth**: Required  
**Input**: None  
**Output**:
```json
{
  "profile": {
    "userId": string,
    "name": string,
    "email": string,
    "image": string,
    "client": {
      "id": string,
      "company": string,
      "country": string,
      "state": string,
      "phoneNumber": string,
      "specializations": Array<Specialization>
    }
  }
}
```

#### `PATCH /api/clients/me`
**Purpose**: Updates the authenticated user's complete profile  
**Auth**: Required  
**Input**: Body with optional fields:
```json
{
  "name"?: string,
  "image"?: string,
  "company"?: string,
  "country"?: string,
  "state"?: string,
  "phoneNumber"?: string
}
```
**Output**: Updated profile data

#### `POST /api/clients/upload-avatar`
**Purpose**: Upload profile image to Cloudinary  
**Auth**: Required  
**Input**: Multipart form data with 'image' field  
**Features**:
- Automatic image optimization (500x500, face detection)
- Automatic rollback if database update fails
- File type validation (JPEG, PNG, GIF, WebP)
- File size validation (max 5MB)

**Output**:
```json
{
  "success": true,
  "imageUrl": string,
  "message": "Profile image updated successfully"
}
```

### Client Management (Admin-level)

#### `POST /api/clients/`
**Purpose**: Create client profile  
**Auth**: Required  
**Input**: Client creation data  
**Output**: Created client object

#### `GET /api/clients/:id`
**Purpose**: Get client by ID  
**Auth**: Required  
**Input**: Path parameter `id` (client ID)  
**Output**: Client details

#### `PATCH /api/clients/:id`
**Purpose**: Update client  
**Auth**: Required  
**Input**: 
- Path parameter `id` (client ID)
- Body: Client update data

**Output**: Updated client object

#### `GET /api/clients/:id/specializations`
**Purpose**: Get client's specializations  
**Auth**: Required  
**Input**: Path parameter `id` (client ID)  
**Output**: Array of client specializations

### Onboarding

#### `POST /api/clients/onboarding/complete`
**Purpose**: Completes the client onboarding process in a single request  
**Auth**: Required  
**Input**:
```json
{
  "country": string,
  "state": string,
  "company"?: string,
  "specializationIds": Array<string>
}
```
**Flow**: Creates client profile → Assigns specializations → Marks onboarding complete  
**Output**:
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "clientId": string,
    "specializationsSelected": number
  }
}
```

---

## Country Routes (`/api/country/*`)

#### `GET /api/country/`
**Purpose**: Get all countries  
**Auth**: Required  
**Input**: None  
**Output**:
```json
{
  "success": true,
  "data": Array<Country>
}
```

#### `GET /api/country/:code`
**Purpose**: Get country by code (code2 or code3)  
**Auth**: Required  
**Input**: Path parameter `code` (2 or 3 letter country code)  
**Output**:
```json
{
  "success": true,
  "data": Country
}
```

#### `GET /api/country/search/:query`
**Purpose**: Search countries by name  
**Auth**: Required  
**Input**: Path parameter `query` (search term)  
**Output**:
```json
{
  "success": true,
  "data": Array<Country>,
  "count": number
}
```

#### `GET /api/country/regions/:region`
**Purpose**: Get countries by region  
**Auth**: Required  
**Input**: Path parameter `region` (region name)  
**Output**:
```json
{
  "success": true,
  "data": Array<Country>,
  "count": number
}
```

#### `GET /api/country/:code/states`
**Purpose**: Get states for a country  
**Auth**: Required  
**Input**: Path parameter `code` (country code)  
**Output**:
```json
{
  "success": true,
  "country": string,
  "data": Array<string>,
  "count": number
}
```

---

## Lawyer Routes (`/api/lawyers/*`)

### Onboarding Process

#### `GET /api/lawyers/onboarding/status`
**Purpose**: Retrieves current onboarding progress and saved data  
**Auth**: Required  
**Input**: None  
**Output**:
```json
{
  "currentStep": "practice-info" | "documents" | "specializations" | "submitted",
  "lawyer": LawyerProfile | null,
  "documents": Array<Document>,
  "specializations": Array<Specialization>
}
```

#### `PATCH /api/lawyers/onboarding/practice-info`
**Purpose**: Saves or updates practice information (Step 1)  
**Auth**: Required  
**Input**:
```json
{
  "phoneNumber": string,
  "country": string,
  "state": string,
  "yearsOfExperience": number,
  "barLicenseNumber": string,
  "barAssociation": string,
  "licenseStatus": string
}
```
**Output**: Updated lawyer profile

#### `PATCH /api/lawyers/onboarding/documents`
**Purpose**: Saves uploaded document metadata (Step 2)  
**Auth**: Required  
**Input**:
```json
{
  "documents": [
    {
      "type": "bar_license" | "certification",
      "url": string,
      "publicId": string,
      "originalName"?: string
    }
  ]
}
```
**Output**: Success confirmation

#### `POST /api/lawyers/onboarding/complete`
**Purpose**: Completes lawyer onboarding (Step 3)  
**Auth**: Required  
**Input**:
```json
{
  "specializations": [
    {
      "specializationId": string,
      "yearsOfExperience": number
    }
  ],
  "experienceDescription"?: string
}
```
**Output**:
```json
{
  "success": true,
  "message": "Application submitted successfully. Expected approval in 2 days.",
  "data": {
    "lawyerId": string,
    "specializationsSelected": number,
    "status": "pending"
  }
}
```

### Document Management

#### `POST /api/lawyers/upload-document`
**Purpose**: Uploads a lawyer verification document to temporary storage  
**Auth**: Required  
**Input**: Multipart form data with 'document' field and 'type' field  
**Features**:
- File type validation (PDF, JPEG, PNG, GIF, WebP)
- File size validation (max 10MB)
- Temporary storage until onboarding completion

**Output**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": string,
    "type": "bar_license" | "certification",
    "url": string,
    "publicId": string,
    "originalName": string,
    "createdAt": string
  }
}
```

#### `GET /api/lawyers/documents`
**Purpose**: Retrieves all documents uploaded by the authenticated lawyer  
**Auth**: Required  
**Input**: None  
**Output**:
```json
{
  "success": true,
  "documents": Array<Document>
}
```

#### `DELETE /api/lawyers/documents/:id`
**Purpose**: Deletes a lawyer document from both database and cloud storage  
**Auth**: Required  
**Input**: Path parameter `id` (document ID)  
**Output**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Cleanup

#### `DELETE /api/lawyers/onboarding/cleanup`
**Purpose**: Cleans up abandoned onboarding process  
**Auth**: Required  
**Input**: None  
**Output**:
```json
{
  "success": true,
  "message": "Onboarding cleanup completed successfully"
}
```

---

## Specialization Routes (`/api/specializations/*`)

#### `GET /api/specializations/`
**Purpose**: Get all specializations  
**Auth**: None  
**Input**: None  
**Output**:
```json
{
  "specializations": Array<Specialization>
}
```

#### `GET /api/specializations/:id`
**Purpose**: Get specialization by ID  
**Auth**: None  
**Input**: Path parameter `id` (specialization ID)  
**Output**:
```json
{
  "specialization": Specialization
}
```

---

## Todo Routes (`/api/todos/*`)

**Status**: Currently disabled (all routes commented out)  
**Purpose**: Todo management functionality  
**Auth**: Required when enabled

---

## Error Responses

All routes follow consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "code"?: "ERROR_CODE",
  "details"?: "Additional error details"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors, missing required fields)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource, state conflict)
- `500` - Internal Server Error (unexpected server errors)

## Rate Limiting & Security

- All routes implement proper input validation
- Admin routes require appropriate role-based permissions
- File uploads include type and size validation
- Bulk operations are limited to prevent abuse (max 100 items)
- Audit logging is implemented for sensitive operations
- IP address and user agent tracking for security

## Data Types

### Common Objects

**User**:
```typescript
{
  id: string,
  name: string,
  email: string,
  image?: string,
  role: 'user' | 'reviewer' | 'admin' | 'super_admin',
  createdAt: string,
  updatedAt: string
}
```

**Application**:
```typescript
{
  id: string,
  lawyerId: string,
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: string,
  reviewedAt?: string,
  reviewerId?: string,
  reviewNotes?: string,
  rejectionReason?: string,
  rejectionFeedback?: string
}
```

**Document**:
```typescript
{
  id: string,
  type: 'bar_license' | 'certification',
  url: string,
  publicId: string,
  originalName: string,
  createdAt: string
}
```

**Specialization**:
```typescript
{
  id: string,
  name: string,
  description?: string,
  category?: string
}
```