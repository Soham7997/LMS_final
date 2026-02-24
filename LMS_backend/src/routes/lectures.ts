const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireLectureUpload } = require('../middleware/roles');
const { uploadToLocal, getLocalFilePath, deleteLocalFile, STORAGE_TYPE, isS3Configured } = require('../utils/s3Storage');

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

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'lecture-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Allow video file types
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/mkv',
      'video/webm'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Get all lectures for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await prisma.lecture.findMany({
      where: { courseId },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    res.json({ lectures });
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lecture by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await prisma.lecture.findUnique({
      where: { id }
    });

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    res.json({ lecture });
  } catch (error) {
    console.error('Get lecture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create lecture - Admin, Teacher, Management only
router.post('/', authenticateToken, requireLectureUpload, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { courseId, title, scheduledAt } = req.body;

    // Validate input
    if (!courseId || !title || !scheduledAt) {
      return res.status(400).json({ error: 'Course ID, title, and scheduled date are required' });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Parse and validate scheduled date
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ error: 'Invalid scheduled date format' });
    }

    // Create lecture
    const lecture = await prisma.lecture.create({
      data: {
        courseId,
        title,
        scheduledAt: scheduledDate,
        createdBy: req.user.id
      }
    });

    res.status(201).json({
      message: 'Lecture created successfully',
      lecture
    });
  } catch (error) {
    console.error('Create lecture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lecture - Admin, Teacher, Management only
router.put('/:id', authenticateToken, requireLectureUpload, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, scheduledAt } = req.body;

    // Check if lecture exists
    const existingLecture = await prisma.lecture.findUnique({
      where: { id }
    });

    if (!existingLecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Prepare update data
    const updateData: any = {};
    if (title) updateData.title = title;
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ error: 'Invalid scheduled date format' });
      }
      updateData.scheduledAt = scheduledDate;
    }

    // Update lecture
    const lecture = await prisma.lecture.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Lecture updated successfully',
      lecture
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload recorded video for lecture - Admin, Teacher, Management only
router.post('/:id/record', authenticateToken, requireLectureUpload, upload.single('video'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    // Check if lecture exists
    const existingLecture = await prisma.lecture.findUnique({
      where: { id }
    });

    if (!existingLecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    let recordPath: string;

    // Handle file storage based on configuration
    if (STORAGE_TYPE === 's3' && isS3Configured()) {
      // S3 Storage (commented out - uncomment when S3 is configured)
      /*
      const s3Key = `lectures/${Date.now()}-${file.originalname}`;
      recordPath = await uploadToS3(file, s3Key);
      */
      // For now, fall back to local storage
      recordPath = uploadToLocal(file, file.filename);
    } else {
      // Local storage (current active method)
      recordPath = uploadToLocal(file, file.filename);
    }

    // Update lecture with recorded video path
    const lecture = await prisma.lecture.update({
      where: { id },
      data: {
        recordPath: recordPath
      }
    });

    res.json({
      message: 'Lecture recording uploaded successfully',
      lecture
    });
  } catch (error) {
    console.error('Upload lecture recording error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete lecture - Admin, Teacher, Management only
router.delete('/:id', authenticateToken, requireLectureUpload, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if lecture exists
    const existingLecture = await prisma.lecture.findUnique({
      where: { id }
    });

    if (!existingLecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Delete lecture
    await prisma.lecture.delete({
      where: { id }
    });

    // Delete recorded video file if it exists
    if (existingLecture.recordPath) {
      if (STORAGE_TYPE === 's3' && isS3Configured()) {
        // S3 Storage (commented out - uncomment when S3 is configured)
        /*
        try {
          await deleteFromS3(existingLecture.recordPath);
        } catch (error) {
          console.error('Failed to delete video from S3:', error);
          // Don't throw error to avoid breaking the deletion
        }
        */
      } else {
        // Local storage (current active method)
        try {
          deleteLocalFile(existingLecture.recordPath);
        } catch (error) {
          console.error('Failed to delete local video file:', error);
          // Don't throw error to avoid breaking the deletion
        }
      }
    }

    res.json({
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming lectures
router.get('/upcoming/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const lectures = await prisma.lecture.findMany({
      where: {
        courseId,
        scheduledAt: {
          gte: new Date()
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      take: 5 // Get next 5 upcoming lectures
    });

    res.json({ lectures });
  } catch (error) {
    console.error('Get upcoming lectures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stream lecture video for viewing
router.get('/:id/stream', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await prisma.lecture.findUnique({
      where: { id }
    });

    if (!lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    if (!lecture.recordPath) {
      return res.status(404).json({ error: 'No recording available for this lecture' });
    }

    if (STORAGE_TYPE === 's3' && isS3Configured()) {
      // S3 Storage (commented out - uncomment when S3 is configured)
      /*
      try {
        const signedUrl = await getSignedUrlForFile(lecture.recordPath);
        res.redirect(signedUrl);
      } catch (error) {
        console.error('S3 signed URL error:', error);
        res.status(500).json({ error: 'Failed to generate video stream link' });
      }
      */
      // For now, fall back to local storage
      const filePath = getLocalFilePath(lecture.recordPath);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Video file not found' });
      }

      // Get file extension to determine content type
      const ext = path.extname(lecture.recordPath).toLowerCase();
      const contentType = getVideoContentType(ext);

      res.setHeader('Content-Disposition', `inline; filename="${lecture.title}${ext}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      // Local storage (current active method)
      const filePath = getLocalFilePath(lecture.recordPath);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Video file not found' });
      }

      // Get file extension to determine content type
      const ext = path.extname(lecture.recordPath).toLowerCase();
      const contentType = getVideoContentType(ext);

      // Set appropriate headers for video streaming
      res.setHeader('Content-Disposition', `inline; filename="${lecture.title}${ext}"`);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Accept-Ranges', 'bytes');

      // Stream the video file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }

  } catch (error) {
    console.error('Stream lecture video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get video content type based on file extension
function getVideoContentType(ext: string): string {
  const videoContentTypes: { [key: string]: string } = {
    '.mp4': 'video/mp4',
    '.avi': 'video/avi',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.m4v': 'video/x-m4v',
    '.flv': 'video/x-flv'
  };

  return videoContentTypes[ext] || 'video/mp4';
}

module.exports = router;