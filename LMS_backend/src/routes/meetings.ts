export {};

const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireMeetingConduct } = require('../middleware/roles');
const { createMeetLink } = require('../services/googleCalendar');

interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  body?: any;
  params?: any;
}

const router = Router();
const prisma = new PrismaClient();

// Get all meetings for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const meetings = await prisma.meeting.findMany({
      where: { courseId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ meetings });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get meeting by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ meeting });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create meeting - Teacher/Head only
router.post('/', authenticateToken, requireMeetingConduct, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { courseId, title, meetLink: providedMeetLink, scheduledAt, description } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: 'Course ID and title are required' });
    }

    const meetUrlPattern = /^https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+$/;
    let meetLink = providedMeetLink && meetUrlPattern.test(providedMeetLink) ? providedMeetLink : null;

    if (!meetLink) {
      if (!scheduledAt) {
        return res.status(400).json({
          error: 'Either provide a meet link or schedule a date/time so we can generate a Google Meet link'
        });
      }
      const startDate = new Date(scheduledAt);
      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduled date/time' });
      }
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const isoStart = startDate.toISOString();
      const isoEnd = endDate.toISOString();
      meetLink = await createMeetLink(title, description || undefined, isoStart, isoEnd);
      if (!meetLink) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/75a258f2-8154-4e5f-8113-4ad1cbb1c307', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'src/routes/meetings.ts:POST /api/meetings',
            message: 'create meeting: Meet link generation failed',
            data: {
              courseId,
              title,
              scheduledAt,
              hasDescription: !!description
            },
            timestamp: Date.now(),
            runId: 'pre-fix',
            hypothesisId: 'H1'
          })
        }).catch(() => {});
        // #endregion

        return res.status(503).json({
          error: 'Google Meet link could not be generated. Please add a meet link manually or configure Google Calendar API.'
        });
      }
    } else if (providedMeetLink && !meetUrlPattern.test(providedMeetLink)) {
      return res.status(400).json({ error: 'Invalid Google Meet link format' });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is authorized to create meetings for this course
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
        return res.status(403).json({ error: 'You are not authorized to create meetings for this course' });
      }
    }

    const scheduledAtDate = scheduledAt ? new Date(scheduledAt) : null;

    const meeting = await prisma.meeting.create({
      data: {
        courseId,
        title,
        meetLink,
        description: description || null,
        scheduledAt: scheduledAtDate,
        createdBy: req.user.id
      }
    });

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meeting - Teacher/Head only
router.put('/:id', authenticateToken, requireMeetingConduct, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, meetLink } = req.body;

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!existingMeeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if user is authorized to update this meeting
    if (req.user && req.user.role === 'TEACHER' && existingMeeting.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only update meetings you created' });
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (meetLink) {
      // Validate meet link format
      const meetUrlPattern = /^https:\/\/meet\.google\.com\/[a-zA-Z0-9-]+$/;
      if (!meetUrlPattern.test(meetLink)) {
        return res.status(400).json({ error: 'Invalid Google Meet link format' });
      }
      updateData.meetLink = meetLink;
    }

    // Update meeting
    const meeting = await prisma.meeting.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Meeting updated successfully',
      meeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete meeting - Teacher/Head only
router.delete('/:id', authenticateToken, requireMeetingConduct, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!existingMeeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Check if user is authorized to delete this meeting
    if (req.user && req.user.role === 'TEACHER' && existingMeeting.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete meetings you created' });
    }

    // Delete meeting
    await prisma.meeting.delete({
      where: { id }
    });

    res.json({
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming meetings for a course
router.get('/upcoming/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // For now, we'll just return recent meetings since we don't have a scheduled time field
    // In a real implementation, you might want to add a scheduledAt field to the Meeting model
    const meetings = await prisma.meeting.findMany({
      where: { courseId },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Get 5 most recent meetings
    });

    res.json({ meetings });
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join meeting - redirect to Google Meet link
router.get('/:id/join', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Redirect to Google Meet link
    res.redirect(meeting.meetLink);
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;