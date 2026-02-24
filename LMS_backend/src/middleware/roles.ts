const express = require('express');

// Define AuthRequest interface locally since we can't import types in CommonJS
interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

type Role = 'ADMIN' | 'TEACHER' | 'HEAD' | 'MANAGEMENT' | 'STUDENT';

const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

// Specific role middleware functions
export const requireAdmin = requireRoles('ADMIN');
export const requireTeacher = requireRoles('TEACHER');
export const requireHead = requireRoles('HEAD');
export const requireManagement = requireRoles('MANAGEMENT');
export const requireStudent = requireRoles('STUDENT');

// Granular permissions based on requirements

// Admin permissions: Full system access
export const requireAdminOnly = requireRoles('ADMIN');

// Teacher permissions: Can manage own courses and materials
export const requireTeacherOnly = requireRoles('TEACHER');

// Head permissions: Can oversee everything and manage staff
export const requireHeadOnly = requireRoles('HEAD');

// Management permissions: Can add courses/materials and generate reports
export const requireManagementOnly = requireRoles('MANAGEMENT');

// Combined permissions for specific actions

// Who can upload study materials: Admin, Teacher, Management
export const requireMaterialUpload = requireRoles('ADMIN', 'TEACHER', 'MANAGEMENT');

// Who can upload recorded lectures: Admin, Teacher
export const requireLectureUpload = requireRoles('ADMIN', 'TEACHER');

// Who can create courses: Admin, Management
export const requireCourseCreation = requireRoles('ADMIN', 'MANAGEMENT');

// Who can edit courses: Admin, Management (teachers can only edit their own)
export const requireCourseEdit = requireRoles('ADMIN', 'MANAGEMENT');

// Who can manage users (add/edit/delete): Admin, Head
export const requireUserManagement = requireRoles('ADMIN', 'HEAD');

// Who can conduct meetings: Teacher, Head
export const requireMeetingConduct = requireRoles('TEACHER', 'HEAD');

// Who can create notices: Teacher, Head, Admin
export const requireNoticeCreation = requireRoles('TEACHER', 'HEAD', 'ADMIN');

// Who can view all activities: Head, Admin
export const requireActivityView = requireRoles('HEAD', 'ADMIN');

// Who can generate reports: Management, Admin
export const requireReportGeneration = requireRoles('MANAGEMENT', 'ADMIN');

// Who can view student counts: Admin, Head, Teacher (own courses), Management
export const requireStudentView = requireRoles('ADMIN', 'HEAD', 'TEACHER', 'MANAGEMENT');

// Legacy combined roles for backward compatibility
const requireAdminOrTeacher = requireRoles('ADMIN', 'TEACHER','MANAGEMENT');
const requireAdminOrHead = requireRoles('ADMIN','HEAD');
const requireTeacherOrHead = requireRoles('TEACHER', 'HEAD');
const requireManagementOrHead = requireRoles('MANAGEMENT', 'HEAD');
const requireStaff = requireRoles('ADMIN', 'TEACHER', 'HEAD', 'MANAGEMENT');
const requireAdminRoles = requireRoles('ADMIN', 'HEAD', 'MANAGEMENT');

module.exports = {
  requireRoles,
  requireAdmin,
  requireTeacher,
  requireHead,
  requireManagement,
  requireStudent,
  requireAdminOrTeacher,
  requireTeacherOrHead,
  requireManagementOrHead,
  requireStaff,
  requireAdminRoles,
  // New granular permissions
  requireAdminOnly,
  requireAdminOrHead,
  requireTeacherOnly,
  requireHeadOnly,
  requireManagementOnly,
  requireMaterialUpload,
  requireLectureUpload,
  requireCourseCreation,
  requireCourseEdit,
  requireUserManagement,
  requireMeetingConduct,
  requireNoticeCreation,
  requireActivityView,
  requireReportGeneration,
  requireStudentView
};