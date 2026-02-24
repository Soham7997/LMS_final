-- AlterTable
ALTER TABLE "public"."_CourseTeachers" ADD CONSTRAINT "_CourseTeachers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_CourseTeachers_AB_unique";
