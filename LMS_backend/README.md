# LMS Backend API Documentation

## Overview

This is a comprehensive Learning Management System (LMS) backend built with Node.js, Express, TypeScript, and Prisma. The system supports multiple user roles and provides a complete set of features for managing courses, users, materials, and activities.

## Features

### User Management
- **Multi-role Support**: Admin, Teacher, Head, Management, Student
- **Public Registration**: Students can register without authentication
- **Admin Registration**: Admins can create users with any role
- **Profile Management**: Users can update their information
- **Authentication**: JWT-based authentication (no expiration)

### Course Management
- **CRUD Operations**: Create, read, update, delete courses
- **Enrollment System**: Students can enroll in courses
- **Teacher Assignment**: Multiple teachers per course
- **Course Status**: Active/inactive courses
- **Statistics**: Enrollment counts, material counts, etc.

### Material Management
- **File Upload**: Support for various file types (PDF, DOC, PPT, videos)
- **Download System**: Secure file access with authentication
- **Material Types**: Study materials and recorded lectures
- **File Storage**: Local file storage with organized structure

### Lecture Management
- **Scheduled Lectures**: Create lectures with dates and times
- **Video Recording**: Upload recorded lecture videos
- **Lecture Tracking**: View upcoming and past lectures

### Meeting Management
- **Google Meet Integration**: Create meetings with Meet links
- **Meeting Access**: Direct links to join meetings
- **Meeting History**: Track all course meetings

### Notice System
- **Course Notices**: Notices specific to courses
- **General Notices**: System-wide announcements
- **Rich Content**: Support for formatted notice content

### Activity Tracking
- **Real-time Logging**: All user actions are tracked
- **Activity History**: View recent activities by user or entity
- **Audit Trail**: Complete system activity log

### Reporting System
- **Enrollment Statistics**: Course enrollment analytics
- **System Overview**: Comprehensive system metrics
- **User Statistics**: User distribution by role
- **Performance Metrics**: Course and user performance data

## API Endpoints

### Authentication

#### Public Registration
```
POST /api/auth/register
```
**Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
**Response:** Automatically creates STUDENT account and returns JWT token

#### Admin Registration
```
POST /api/auth/register/admin
```
**Headers:** Authorization: Bearer `<admin_token>`
**Body:**
```json
{
  "email": "teacher@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "TEACHER"
}
```

#### Login
```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/auth/me
```
**Headers:** Authorization: Bearer `<token>`

### User Management

#### Get All Users (Admin/Head only)
```
GET /api/users
```

#### Get User by ID (Admin/Head only)
```
GET /api/users/:id
```

#### Create User (Admin/Head only)
```
POST /api/users
```

#### Update User (Admin/Head only)
```
PUT /api/users/:id
```

#### Delete User (Admin/Head only)
```
DELETE /api/users/:id
```

### Course Management

#### Get All Courses
```
GET /api/courses
```

#### Get Active Courses
```
GET /api/courses/active
```

#### Get Course by ID
```
GET /api/courses/:id
```

#### Create Course (Admin/Head only)
```
POST /api/courses
```

#### Update Course (Admin/Head only)
```
PUT /api/courses/:id
```

#### Delete Course (Admin/Head only)
```
DELETE /api/courses/:id
```

#### Enroll in Course
```
POST /api/courses/:id/enroll
```

#### Unenroll from Course (Staff only)
```
DELETE /api/courses/:id/enroll/:studentId
```

### Material Management

#### Get Materials for Course
```
GET /api/materials/course/:courseId
```

#### Get Material by ID
```
GET /api/materials/:id
```

#### Upload Material (Staff only)
```
POST /api/materials
```
**Content-Type:** multipart/form-data
**Body:** file, courseId, title, type

#### Update Material (Staff only)
```
PUT /api/materials/:id
```

#### Delete Material (Staff only)
```
DELETE /api/materials/:id
```

#### Download Material
```
GET /api/materials/:id/download
```

### Lecture Management

#### Get Lectures for Course
```
GET /api/lectures/course/:courseId
```

#### Get Lecture by ID
```
GET /api/lectures/:id
```

#### Create Lecture (Staff only)
```
POST /api/lectures
```

#### Update Lecture (Staff only)
```
PUT /api/lectures/:id
```

#### Upload Lecture Recording (Staff only)
```
POST /api/lectures/:id/record
```

#### Delete Lecture (Staff only)
```
DELETE /api/lectures/:id
```

#### Get Upcoming Lectures
```
GET /api/lectures/upcoming/:courseId
```

### Meeting Management

#### Get Meetings for Course
```
GET /api/meetings/course/:courseId
```

#### Get Meeting by ID
```
GET /api/meetings/:id
```

#### Create Meeting (Teacher/Head only)
```
POST /api/meetings
```
**Body (auto Google Meet):** Send `courseId`, `title`, `scheduledAt`, and optional `description`. A Google Meet link is created automatically via Google Calendar API.
```json
{
  "courseId": "course_id",
  "title": "Weekly Lecture",
  "scheduledAt": "2025-02-15T14:30:00",
  "description": "Optional description"
}
```
**Body (manual link):** Alternatively send `meetLink` instead of `scheduledAt` to use an existing Meet link.
```json
{
  "courseId": "course_id",
  "title": "Weekly Lecture",
  "meetLink": "https://meet.google.com/xxx-xxxx-xxx"
}
```

#### Update Meeting (Teacher/Head only)
```
PUT /api/meetings/:id
```

#### Delete Meeting (Teacher/Head only)
```
DELETE /api/meetings/:id
```

#### Join Meeting
```
GET /api/meetings/:id/join
```

### Notice Management

#### Get Notices for Course
```
GET /api/notices/course/:courseId
```

#### Get General Notices
```
GET /api/notices/general
```

#### Get Notice by ID
```
GET /api/notices/:id
```

#### Create Notice (Staff only)
```
POST /api/notices
```

#### Update Notice (Staff only)
```
PUT /api/notices/:id
```

#### Delete Notice (Staff only)
```
DELETE /api/notices/:id
```

#### Get Recent Notices
```
GET /api/notices/recent/:limit?
```

### Activity Tracking

#### Get Recent Activities (Head/Management only)
```
GET /api/reports/activities/recent?limit=50
```

#### Get Activities by Entity (Head/Management only)
```
GET /api/reports/activities/entity/:entity/:entityId
```

### Reporting System

#### Get Enrollment Statistics (Management/Head only)
```
GET /api/reports/enrollments
```

#### Get Active Courses Overview (Management/Head only)
```
GET /api/reports/courses/active
```

#### Get Enrollment Trends (Management/Head only)
```
GET /api/reports/enrollments/trends
```

#### Get Course Activity Summary (Management/Head only)
```
GET /api/reports/courses/activity
```

#### Get User Statistics (Management/Head only)
```
GET /api/reports/users/stats
```

#### Get System Overview (Management/Head only)
```
GET /api/reports/overview
```

#### Get Course Performance Metrics (Management/Head only)
```
GET /api/reports/courses/performance
```

## User Roles & Permissions

### Student
- View and enroll in courses
- Access course materials and lectures
- Join meetings
- View notices
- Update own profile

### Teacher
- View assigned courses
- Upload materials and lectures
- Create meetings and notices
- View course statistics
- Update own profile

### Admin
- All teacher permissions
- Create and manage users
- Create and manage courses
- Full system access
- View all reports

### Head
- All teacher permissions
- Create and manage users
- Create and manage courses
- View activity logs
- View all reports

### Management
- View all courses and enrollments
- Generate reports
- View system overview
- Access analytics

## Data Models

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'HEAD' | 'MANAGEMENT' | 'STUDENT';
  courses: Course[]; // For teachers
  enrollments: Enrollment[]; // For students
  createdAt: Date;
  updatedAt: Date;
}
```

### Course
```typescript
{
  id: string;
  title: string;
  description?: string;
  active: boolean;
  teachers: User[];
  enrollments: Enrollment[];
  materials: Material[];
  lectures: Lecture[];
  meetings: Meeting[];
  notices: Notice[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Material
```typescript
{
  id: string;
  courseId: string;
  title: string;
  type: 'STUDY_MATERIAL' | 'RECORDED_LECTURE';
  filePath: string;
  uploadedBy: string;
  createdAt: Date;
}
```

### Lecture
```typescript
{
  id: string;
  courseId: string;
  title: string;
  scheduledAt: Date;
  recordPath?: string;
  createdBy: string;
  createdAt: Date;
}
```

### Meeting
```typescript
{
  id: string;
  courseId: string;
  title: string;
  meetLink: string;
  createdBy: string;
  createdAt: Date;
}
```

### Notice
```typescript
{
  id: string;
  courseId?: string;
  title: string;
  body: string;
  postedBy: string;
  createdAt: Date;
}
```

### Activity
```typescript
{
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: Date;
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different roles
- **File Upload Security**: File type validation and size limits
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Input validation and sanitization

## Installation & Setup

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
4. **Configure database**
   ```bash
   npx prisma migrate dev
   ```
5. **Seed the database (optional)**
    ```bash
    # Seed with sample Japanese language courses
    npm run seed:levels

    # Or seed with complete sample data (users, courses, enrollments, notices, meetings)
    npm run seed:complete
    ```
6. **Start the server**
    ```bash
    npm run dev
    ```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/lms_db

# Authentication
JWT_SECRET=your_jwt_secret_key

# Server
FRONTEND_URL=http://localhost:5173
PORT=3001

# Storage Configuration
STORAGE_TYPE=local  # 'local' or 's3'

# AWS S3 (only needed if STORAGE_TYPE=s3)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name

# Google Meet auto-generation (optional; if unset, teachers must paste a Meet link)
# Option A: path to service account JSON key file
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account.json
# Option B: inline credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# Calendar to create events on (default: primary)
GOOGLE_CALENDAR_ID=primary
# Timezone for event times (default: Asia/Tokyo)
GOOGLE_MEET_TIMEZONE=Asia/Tokyo
```

## Database Seeding

The LMS comes with seed scripts to populate your database with sample data:

### Available Seed Scripts

#### 1. Japanese Language Courses (`seed:levels`)
Creates the 4 Japanese language courses from the frontend levelData:
- **Beginner** - N5 Level
- **Elementary** - N4 Level
- **Intermediate** - N3 Level
- **Advanced** - N2-N1 Levels

#### 2. Complete Sample Data (`seed:complete`)
Creates a full sample LMS environment including:
- **4 Sample Teachers** with different specializations
- **3 Sample Students** enrolled in courses
- **4 Japanese Language Courses** with teachers assigned
- **Student Enrollments** in courses
- **Sample Notices** (general and course-specific)
- **Sample Meetings** with Google Meet links

### Running Seed Scripts

```bash
# Seed only the Japanese language courses
npm run seed:levels

# Seed complete sample data (recommended for testing)
npm run seed:complete

# Or run all seeds
npm run seed:all
```

### Sample Login Credentials

After running `seed:complete`, you can log in with:

```
Admin: admin@example.com / admin123
Teacher: yuki.sato@example.com / password123
Student: student1@example.com / password123
```

### Seed Script Details

- **Safe to run multiple times** - scripts check for existing data
- **Hashed passwords** - all sample passwords are properly hashed
- **Realistic data** - courses include descriptions and features
- **Relationships maintained** - proper teacher assignments and enrollments

## File Structure

```
src/
├── index.ts              # Main server file
├── middleware/
│   ├── auth.ts          # Authentication middleware
│   └── roles.ts         # Role-based access control
├── routes/
│   ├── auth.ts          # Authentication endpoints
│   ├── users.ts         # User management
│   ├── courses.ts       # Course management
│   ├── materials.ts     # Material management
│   ├── lectures.ts      # Lecture management
│   ├── meetings.ts      # Meeting management
│   ├── notices.ts       # Notice system
│   └── reports.ts       # Reporting system
├── utils/
│   ├── activity.ts      # Activity tracking utilities
│   └── s3Storage.ts     # Storage abstraction layer
└── prisma/
    └── schema.prisma    # Database schema
```

## Storage Configuration

The LMS system supports two storage options:

### Local Storage (Default)
- Files are stored in the `uploads/` directory
- Suitable for development and small-scale deployments
- No additional configuration required

### AWS S3 Storage (Production Recommended)
- Scalable cloud storage with global CDN
- Automatic backup and high availability
- See `AWS_S3_INTEGRATION.md` for detailed setup instructions

To enable S3 storage:
1. Install AWS SDK dependencies
2. Configure AWS credentials and bucket
3. Set `STORAGE_TYPE=s3` in environment variables
4. Uncomment S3 code in `src/routes/materials.ts` and `src/routes/lectures.ts`

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```
2. **Set production environment variables**
3. **Use a production database** (PostgreSQL recommended)
4. **Configure storage** (AWS S3 recommended for production)
5. **Configure reverse proxy** (nginx recommended)
6. **Set up SSL certificate**
7. **Monitor logs and performance**

## API Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "message": "Operation successful",
  "data": { ... },
  "user": { ... } // For auth endpoints
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Error Handling

The API includes comprehensive error handling for:
- Authentication errors (401)
- Authorization errors (403)
- Validation errors (400)
- Not found errors (404)
- Server errors (500)

## Rate Limiting

Consider implementing rate limiting for:
- Authentication endpoints
- File upload endpoints
- Public registration

## Monitoring & Logging

The system logs:
- All user actions (activity tracking)
- Authentication attempts
- File uploads
- Error conditions
- Performance metrics

## Future Enhancements

- Email notifications
- Payment integration
- Video streaming
- Mobile app API
- Advanced analytics
- Integration with external LMS platforms

---

This LMS backend provides a solid foundation for a comprehensive learning management system with role-based access control, comprehensive tracking, and production-ready features.