// API Types matching the backend schema

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'HEAD' | 'MANAGEMENT' | 'STUDENT';
  createdAt: string;
  updatedAt: string;
  courses?: Course[];
  enrollments?: Enrollment[];
}

export interface Course {
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
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
    materials: number;
    lectures: number;
    meetings: number;
    notices: number;
  };
}

export interface Enrollment {
  id: string;
  student: User;
  studentId: string;
  course: Course;
  courseId: string;
  createdAt: string;
}

export interface Material {
  id: string;
  course: Course;
  courseId: string;
  title: string;
  type: 'STUDY_MATERIAL' | 'RECORDED_LECTURE';
  filePath: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Lecture {
  id: string;
  course: Course;
  courseId: string;
  title: string;
  scheduledAt: string;
  recordPath?: string;
  createdBy: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  course: Course;
  courseId: string;
  title: string;
  meetLink: string;
  createdBy: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  course?: Course;
  courseId?: string;
  title: string;
  body: string;
  postedBy: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  actor?: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'TEACHER' | 'HEAD' | 'MANAGEMENT' | 'STUDENT';
}

export interface CreateCourseData {
  title: string;
  description?: string;
  teacherIds?: string[];
}

export interface CreateMaterialData {
  courseId: string;
  title: string;
  type: 'STUDY_MATERIAL' | 'RECORDED_LECTURE';
  file: File;
}

export interface CreateLectureData {
  courseId: string;
  title: string;
  scheduledAt: string;
}

export interface CreateMeetingData {
  courseId: string;
  title: string;
  scheduledAt: string;
  description?: string;
  meetLink?: string;
}

export interface CreateNoticeData {
  courseId?: string;
  title: string;
  body: string;
}

// Auth context types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
}

// Dashboard stats
export interface DashboardStats {
  totalCourses: number;
  totalEnrollments: number;
  totalMaterials: number;
  totalLectures: number;
  totalMeetings: number;
  totalNotices: number;
  recentActivities: Activity[];
}

// Report types
export interface EnrollmentStats {
  enrollmentStats: Array<{
    id: string;
    title: string;
    active: boolean;
    _count: {
      enrollments: number;
    };
  }>;
  totalCourses: number;
  totalEnrollments: number;
}

export interface SystemOverview {
  overview: {
    totalUsers: number;
    totalCourses: number;
    activeCourses: number;
    totalEnrollments: number;
    totalMaterials: number;
    totalLectures: number;
    totalMeetings: number;
    totalNotices: number;
    recentActivities: number;
  };
}