const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireReportGeneration, requireActivityView } = require('../middleware/roles');

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

// Get enrollment statistics per course
router.get('/enrollments', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    const enrollmentStats = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        active: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      }
    });

    res.json({
      enrollmentStats,
      totalCourses: enrollmentStats.length,
      totalEnrollments: enrollmentStats.reduce((sum, course) => sum + course._count.enrollments, 0)
    });
  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active courses overview
router.get('/courses/active', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    const activeCourses = await prisma.course.findMany({
      where: { active: true },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
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

    res.json({
      activeCourses,
      totalActiveCourses: activeCourses.length
    });
  } catch (error) {
    console.error('Get active courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student enrollment trends (monthly)
router.get('/enrollments/trends', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    // Get enrollments grouped by month
    const enrollmentTrends = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM "Enrollment"
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    `;

    res.json({ enrollmentTrends });
  } catch (error) {
    console.error('Get enrollment trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course activity summary
router.get('/courses/activity', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    const courseActivity = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
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

    // Calculate activity score for each course
    const courseActivityWithScore = courseActivity.map(course => ({
      ...course,
      activityScore: course._count.materials + course._count.lectures + course._count.meetings + course._count.notices
    }));

    res.json({
      courseActivity: courseActivityWithScore,
      totalCourses: courseActivity.length
    });
  } catch (error) {
    console.error('Get course activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
router.get('/users/stats', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    });

    const totalUsers = userStats.reduce((sum, stat) => sum + stat._count.id, 0);

    res.json({
      userStats,
      totalUsers
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/activities/recent', authenticateToken, requireActivityView, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course performance metrics
router.get('/courses/performance', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    const coursePerformance = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        active: true,
        createdAt: true,
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

    // Calculate performance metrics
    const performanceMetrics = coursePerformance.map(course => {
      const daysSinceCreation = Math.max(1, Math.floor((Date.now() - course.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
      const totalActivities = course._count.materials + course._count.lectures + course._count.meetings + course._count.notices;

      return {
        ...course,
        daysSinceCreation,
        totalActivities,
        activitiesPerDay: (totalActivities / daysSinceCreation).toFixed(2),
        enrollmentRate: course._count.enrollments
      };
    });

    res.json({
      coursePerformance: performanceMetrics,
      totalCourses: performanceMetrics.length
    });
  } catch (error) {
    console.error('Get course performance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities - Head/Admin only
router.get('/activities/recent', authenticateToken, requireActivityView, async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get activities by entity
router.get('/activities/entity/:entity/:entityId', authenticateToken, requireActivityView, async (req, res) => {
  try {
    const { entity, entityId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const activities = await prisma.activity.findMany({
      where: {
        entity,
        entityId
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get entity activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system overview statistics
router.get('/overview', authenticateToken, requireReportGeneration, async (req, res) => {
  try {
    // Get counts for various entities
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalMaterials,
      totalLectures,
      totalMeetings,
      totalNotices,
      activeCourses
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.material.count(),
      prisma.lecture.count(),
      prisma.meeting.count(),
      prisma.notice.count(),
      prisma.course.count({ where: { active: true } })
    ]);

    // Get recent activity count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivities = await prisma.activity.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    res.json({
      overview: {
        totalUsers,
        totalCourses,
        activeCourses,
        totalEnrollments,
        totalMaterials,
        totalLectures,
        totalMeetings,
        totalNotices,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;