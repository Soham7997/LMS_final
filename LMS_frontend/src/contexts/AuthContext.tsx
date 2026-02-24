import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, RegisterData } from '../types/api';
import apiService from '../services/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  // Role checking methods
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isHead: () => boolean;
  isManagement: () => boolean;
  isStudent: () => boolean;
  // Permission checking methods
  canManageUsers: () => boolean;
  canCreateCourses: () => boolean;
  canEditCourses: () => boolean;
  canUploadMaterials: () => boolean;
  canUploadLectures: () => boolean;
  canConductMeetings: () => boolean;
  canCreateNotices: () => boolean;
  canViewReports: () => boolean;
  canViewActivities: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored auth token and validate it
    const token = localStorage.getItem('auth_token');
    if (token) {
      validateToken();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await apiService.getProfile();
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      // Token is invalid, remove it 
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await apiService.login(credentials);
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    apiService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const response = await apiService.register(userData);
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  // Role checking methods
  const isAdmin = (): boolean => {
    return authState.user?.role === 'ADMIN';
  };

  const isTeacher = (): boolean => {
    return authState.user?.role === 'TEACHER';
  };

  const isHead = (): boolean => {
    return authState.user?.role === 'HEAD';
  };

  const isManagement = (): boolean => {
    return authState.user?.role === 'MANAGEMENT';
  };

  const isStudent = (): boolean => {
    return authState.user?.role === 'STUDENT';
  };

  // Permission checking methods based on backend permissions
  const canManageUsers = (): boolean => {
    return ['ADMIN', 'HEAD'].includes(authState.user?.role || '');
  };

  const canCreateCourses = (): boolean => {
    return ['ADMIN', 'MANAGEMENT'].includes(authState.user?.role || '');
  };

  const canEditCourses = (): boolean => {
    return ['ADMIN', 'MANAGEMENT'].includes(authState.user?.role || '');
  };

  const canUploadMaterials = (): boolean => {
    return ['ADMIN', 'TEACHER', 'MANAGEMENT'].includes(authState.user?.role || '');
  };

  const canUploadLectures = (): boolean => {
    return ['ADMIN', 'TEACHER', 'MANAGEMENT'].includes(authState.user?.role || '');
  };

  const canConductMeetings = (): boolean => {
    return ['ADMIN', 'TEACHER', 'HEAD'].includes(authState.user?.role || '');
  };

  const canCreateNotices = (): boolean => {
    return ['ADMIN', 'TEACHER', 'HEAD'].includes(authState.user?.role || '');
  };

  const canViewReports = (): boolean => {
    return ['ADMIN', 'MANAGEMENT'].includes(authState.user?.role || '');
  };

  const canViewActivities = (): boolean => {
    return ['ADMIN', 'HEAD'].includes(authState.user?.role || '');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      register,
      isAdmin,
      isTeacher,
      isHead,
      isManagement,
      isStudent,
      canManageUsers,
      canCreateCourses,
      canEditCourses,
      canUploadMaterials,
      canUploadLectures,
      canConductMeetings,
      canCreateNotices,
      canViewReports,
      canViewActivities
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};