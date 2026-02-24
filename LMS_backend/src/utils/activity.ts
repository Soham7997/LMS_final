// Activity tracking utility functions
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create activity record
export const createActivity = async (
  actorId: string,
  action: string,
  entity: string,
  entityId: string
) => {
  try {
    await prisma.activity.create({
      data: {
        actorId,
        action,
        entity,
        entityId
      }
    });
  } catch (error) {
    console.error('Failed to create activity:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

// Activity action types
export const ACTIVITY_ACTIONS = {
  USER_CREATED: 'created user',
  USER_UPDATED: 'updated user',
  USER_DELETED: 'deleted user',
  COURSE_CREATED: 'created course',
  COURSE_UPDATED: 'updated course',
  COURSE_DELETED: 'deleted course',
  MATERIAL_UPLOADED: 'uploaded material',
  MATERIAL_UPDATED: 'updated material',
  MATERIAL_DELETED: 'deleted material',
  LECTURE_CREATED: 'created lecture',
  LECTURE_UPDATED: 'updated lecture',
  LECTURE_DELETED: 'deleted lecture',
  LECTURE_RECORDED: 'uploaded lecture recording',
  MEETING_CREATED: 'created meeting',
  MEETING_UPDATED: 'updated meeting',
  MEETING_DELETED: 'deleted meeting',
  NOTICE_CREATED: 'created notice',
  NOTICE_UPDATED: 'updated notice',
  NOTICE_DELETED: 'deleted notice',
  STUDENT_ENROLLED: 'enrolled student',
  STUDENT_UNENROLLED: 'unenrolled student'
} as const;