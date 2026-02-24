const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireNoticeCreation } = require('../middleware/roles');

// Define AuthRequest interface locally since we can't import types in CommonJS
interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

const router = Router();
const prisma = new PrismaClient();

// Get all notices for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const notices = await prisma.notice.findMany({
      where: { courseId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ notices });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all general notices (not tied to a specific course)
router.get('/general', authenticateToken, async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      where: { courseId: null },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ notices });
  } catch (error) {
    console.error('Get general notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { id }
    });

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({ notice });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create notice - Teacher/Head/Admin only
router.post('/', authenticateToken, requireNoticeCreation, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { courseId, title, body } = req.body;

    // Validate input
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    // If courseId is provided, check if course exists
    if (courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Check if user is authorized to post notices for this course
      if (req.user.role === 'TEACHER') {
        const isTeacherOfCourse = await prisma.course.findFirst({
          where: {
            id: courseId,
            teachers: {
              some: {
                id: req.user.id
              }
            }
          }
        });

        if (!isTeacherOfCourse) {
          return res.status(403).json({ error: 'You are not authorized to post notices for this course' });
        }
      }
    }

    // Create notice
    const notice = await prisma.notice.create({
      data: {
        courseId: courseId || null,
        title,
        body,
        postedBy: req.user.id
      }
    });

    res.status(201).json({
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notice - Teacher/Head/Admin only
router.put('/:id', authenticateToken, requireNoticeCreation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, body } = req.body;

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id }
    });

    if (!existingNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Check if user is authorized to update this notice
    if (req.user && req.user.role === 'TEACHER' && existingNotice.postedBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update notices you created' });
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (body) updateData.body = body;

    // Update notice
    const notice = await prisma.notice.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notice - Teacher/Head/Admin only
router.delete('/:id', authenticateToken, requireNoticeCreation, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id }
    });

    if (!existingNotice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Check if user is authorized to delete this notice
    if (req.user && req.user.role === 'TEACHER' && existingNotice.postedBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete notices you created' });
    }

    // Delete notice
    await prisma.notice.delete({
      where: { id }
    });

    res.json({
      message: 'Notice deleted successfully'
    });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent notices (for dashboard)
router.get('/recent/:limit?', authenticateToken, async (req, res) => {
  try {
    const limit = req.params.limit ? parseInt(req.params.limit) : 10;

    const notices = await prisma.notice.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({ notices });
  } catch (error) {
    console.error('Get recent notices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;