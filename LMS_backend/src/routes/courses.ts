import { requireAdmin } from "../middleware/roles";

const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireCourseCreation, requireCourseEdit, requireTeacherOrHead, requireStudentView,requireAdminOrTeacher, requireUserManagement } = require('../middleware/roles');

const router = Router();
const prisma = new PrismaClient();

// Define AuthRequest interface locally since we can't import types in CommonJS
interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  params?: any;
  body?: any;
}

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true,
            materials: true,
            lectures: true,
            meetings: true,
            notices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active courses
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { active: true },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get active courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        materials: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        lectures: {
          orderBy: {
            scheduledAt: 'asc'
          }
        },
        meetings: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        notices: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            enrollments: true,
            materials: true,
            lectures: true,
            meetings: true,
            notices: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create course - Admin/Management only
router.post('/', authenticateToken, requireCourseCreation, async (req, res) => {
  try {
    const { title, description, teacherIds } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Course title is required' });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        teachers: {
          connect: teacherIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'created course',
          entity: 'Course',
          entityId: course.id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update course - Admin/Management only (teachers can only update their own courses)
router.put('/:id', authenticateToken, requireCourseEdit, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, active, teacherIds } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if teacher has permission to update this course
    if (req.user.role === 'TEACHER') {
      const isTeacherOfCourse = existingCourse.teachers.some(teacher => teacher.id === req.user.id);
      if (!isTeacherOfCourse) {
        return res.status(403).json({ error: 'You can only update courses you teach' });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    if (teacherIds) {
      updateData.teachers = {
        set: [], // Clear existing teachers
        connect: teacherIds.map((teacherId: string) => ({ id: teacherId }))
      };
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'updated course',
          entity: 'Course',
          entityId: course.id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete course - Teacher/Admin/Head/Management only (teachers can only delete their own courses)
router.delete('/:id', authenticateToken, requireAdminOrTeacher, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if teacher has permission to delete this course
    if (req.user.role === 'TEACHER') {
      const isTeacherOfCourse = existingCourse.teachers.some(teacher => teacher.id === req.user.id);
      if (!isTeacherOfCourse) {
        return res.status(403).json({ error: 'You can only delete courses you teach' });
      }
    }

    // Delete all related records first to avoid foreign key constraint errors
    try {
      // Delete enrollments first
      await prisma.enrollment.deleteMany({
        where: { courseId: id }
      });

      // Delete materials
      await prisma.material.deleteMany({
        where: { courseId: id }
      });

      // Delete lectures
      await prisma.lecture.deleteMany({
        where: { courseId: id }
      });

      // Delete meetings
      await prisma.meeting.deleteMany({
        where: { courseId: id }
      });

      // Delete notices
      await prisma.notice.deleteMany({
        where: { courseId: id }
      });

      // Finally delete the course
      await prisma.course.delete({
        where: { id }
      });
    } catch (deleteError) {
      console.error('Error deleting related records:', deleteError);
      throw deleteError;
    }

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'deleted course',
          entity: 'Course',
          entityId: id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enroll student in course
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id: courseId } = req.params;
    const { studentId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Students can only enroll themselves, staff can enroll anyone
    const targetStudentId = req.user.role === 'STUDENT' ? req.user.id : studentId;

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.active) {
      return res.status(400).json({ error: 'Course is not active' });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: targetStudentId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: targetStudentId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: targetStudentId,
        courseId
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'enrolled student',
          entity: 'Enrollment',
          entityId: enrollment.id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unenroll student from course
router.delete('/:id/enroll/:studentId', authenticateToken, requireTeacherOrHead, async (req, res) => {
  try {
    const { id: courseId, studentId } = req.params;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'unenrolled student',
          entity: 'Enrollment',
          entityId: `${studentId}_${courseId}`
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.json({
      message: 'Student unenrolled successfully'
    });
  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher's courses with student counts - POST with teacher info in body
router.post('/my-courses', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get teacher information from request body
    const { teacherId, teacherEmail, teacherRole } = req.body;

    // Validate required fields
    if (!teacherId || !teacherEmail) {
      return res.status(400).json({ error: 'teacherId and teacherEmail are required' });
    }

    // Optional: Check if the requester has permission to view this teacher's courses
    // For now, allow teachers to view their own courses, and admins to view any teacher's courses
    if (req.user.role === 'TEACHER' && req.user.id !== teacherId) {
      return res.status(403).json({ error: 'You can only view your own courses' });
    }

    console.log('Fetching courses for teacher:', {
      requestedTeacherId: teacherId,
      requestedTeacherEmail: teacherEmail,
      requestedTeacherRole: teacherRole,
      requesterId: req.user.id,
      requesterRole: req.user.role
    });

    // First, let's check if there are any courses at all
    const allCourses = await prisma.course.findMany({
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('All courses in database:', allCourses.map(c => ({
      id: c.id,
      title: c.title,
      teacherCount: c.teachers.length,
      teachers: c.teachers.map(t => t.id)
    })));

    const courses = await prisma.course.findMany({
      where: {
        teachers: {
          some: {
            id: teacherId
          }
        }
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            materials: true,
            lectures: true,
            meetings: true,
            notices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Filtered courses for teacher:', {
      teacherId: teacherId,
      courseCount: courses.length,
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        teachers: c.teachers.map(t => ({ id: t.id, name: t.name }))
      }))
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to check course-teacher relationships (remove in production)
router.get('/debug', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    const users = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.json({
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        teacherCount: c.teachers.length,
        teachers: c.teachers
      })),
      teachers: users,
      totalCourses: courses.length,
      coursesWithTeachers: courses.filter(c => c.teachers.length > 0).length
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to check current user authentication
router.get('/debug-user', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
      headers: req.headers.authorization ? 'Token present' : 'No token',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug user endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent enrollments for management dashboard
router.get('/recent-enrollments', authenticateToken, requireUserManagement, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const recentEnrollments = await prisma.enrollment.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({ enrollments: recentEnrollments });
  } catch (error) {
    console.error('Get recent enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk enroll students in course - Admin/Management only
router.post('/:id/bulk-enroll', authenticateToken, requireUserManagement, async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ error: 'Student IDs array is required' });
    }

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.active) {
      return res.status(400).json({ error: 'Course is not active' });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each student enrollment
    for (const studentId of studentIds) {
      try {
        // Check if student exists and is a student
        const student = await prisma.user.findUnique({
          where: { id: studentId }
        });

        if (!student) {
          results.failed.push({ studentId, reason: 'Student not found' });
          continue;
        }

        if (student.role !== 'STUDENT') {
          results.failed.push({ studentId, reason: 'User is not a student' });
          continue;
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId,
              courseId
            }
          }
        });

        if (existingEnrollment) {
          results.failed.push({ studentId, reason: 'Student already enrolled' });
          continue;
        }

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
          data: {
            studentId,
            courseId
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        results.successful.push({
          studentId,
          studentName: enrollment.student.name,
          enrollmentId: enrollment.id
        });

        // Create activity record
        try {
          await prisma.activity.create({
            data: {
              actorId: req.user.id,
              action: 'enrolled student',
              entity: 'Enrollment',
              entityId: enrollment.id
            }
          });
        } catch (activityError) {
          console.error('Failed to create activity:', activityError);
        }
      } catch (error) {
        results.failed.push({ studentId, reason: error.message || 'Unknown error' });
      }
    }

    res.json({
      message: `Bulk enrollment completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Bulk enroll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve enrollment - Management only
router.post('/:courseId/enroll/:enrollmentId/approve', authenticateToken, requireUserManagement, async (req, res) => {
  try {
    const { courseId, enrollmentId } = req.params;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId
      },
      include: {
        course: true,
        student: true
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Update enrollment status (assuming there's a status field)
    // For now, we'll just return success since the enrollment is already created
    res.json({
      message: 'Enrollment approved successfully',
      enrollment: {
        id: enrollment.id,
        studentName: enrollment.student.name,
        course: enrollment.course.title,
        status: 'Active'
      }
    });
  } catch (error) {
    console.error('Approve enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming classes for teacher dashboard
router.get('/upcoming-classes', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied. Teachers only.' });
    }

    // Get teacher's courses
    const teacherCourses = await prisma.course.findMany({
      where: {
        teachers: {
          some: {
            id: req.user.id
          }
        }
      },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    // For now, return static upcoming classes data
    // In a real implementation, you might have a schedule/lectures table
    const upcomingClasses = teacherCourses.map((course, index) => ({
      id: `class-${index + 1}`,
      title: `${course.title} - Class ${index + 1}`,
      date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: index % 2 === 0 ? '10:00 AM' : '2:00 PM',
      students: course._count.enrollments,
      level: course.title.includes('N5') ? 'N5' : course.title.includes('N4') ? 'N4' : 'N3'
    }));

    res.json({ classes: upcomingClasses });
  } catch (error) {
    console.error('Get upcoming classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher statistics
router.get('/teacher-stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied. Teachers only.' });
    }

    // Get teacher's courses
    const teacherCourses = await prisma.course.findMany({
      where: {
        teachers: {
          some: {
            id: req.user.id
          }
        }
      },
      include: {
        _count: {
          select: {
            enrollments: true,
            materials: true,
            meetings: true,
            notices: true
          }
        }
      }
    });

    const stats = {
      totalCourses: teacherCourses.length,
      activeCourses: teacherCourses.filter(c => c.active).length,
      totalStudents: teacherCourses.reduce((sum, course) => sum + course._count.enrollments, 0),
      totalMaterials: teacherCourses.reduce((sum, course) => sum + course._count.materials, 0),
      totalMeetings: teacherCourses.reduce((sum, course) => sum + course._count.meetings, 0),
      totalNotices: teacherCourses.reduce((sum, course) => sum + course._count.notices, 0)
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get teacher stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get recent materials for admin dashboard
router.get('/recent-materials', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!['ADMIN', 'HEAD', 'MANAGEMENT'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Admin/Head/Management only.' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const recentMaterials = await prisma.material.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Transform the data to match the expected format
    const materials = recentMaterials.map(material => ({
      id: material.id,
      title: material.title,
      type: material.type === 'RECORDED_LECTURE' ? 'Video' : 'PDF',
      uploadedBy: 'Unknown', // Since uploadedBy is just a string ID, we can't get the name without additional query
      date: material.createdAt.toISOString().split('T')[0],
      course: material.course.title
    }));

    res.json({ materials });
  } catch (error) {
    console.error('Get recent materials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent video lectures for admin dashboard
router.get('/recent-videos', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!['ADMIN', 'HEAD', 'MANAGEMENT'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Admin/Head/Management only.' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const recentVideos = await prisma.material.findMany({
      where: {
        type: 'RECORDED_LECTURE'
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Transform the data to match the expected format
    const videos = recentVideos.map(video => ({
      id: video.id,
      title: video.title,
      instructor: 'Unknown', // Since uploadedBy is just a string ID, we can't get the name without additional query
      duration: '45 min', // Placeholder - you might want to add duration to the Material model
      views: Math.floor(Math.random() * 100) + 10, // Placeholder - you might want to add views tracking
      date: video.createdAt.toISOString().split('T')[0]
    }));

    res.json({ videos });
  } catch (error) {
    console.error('Get recent videos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;