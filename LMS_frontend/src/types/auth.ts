export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin' | 'main_head' | 'management_team';
  avatar?: string;
  enrolledCourses?: string[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'student' | 'staff';
}

export interface Course {
  id: string;
  title: string;
  level: string;
  description: string;
  instructor: string;
  duration: string;
  schedule: string;
  image: string;
  enrolled: number;
  maxStudents: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  link: string;
  instructor: string;
  type: 'class' | 'meeting';
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'text';
  url: string;
  course: string;
  uploadedBy: string;
  uploadedAt: string;
}