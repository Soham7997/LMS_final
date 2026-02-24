const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const levelData = [
  {
    id: "beginner",
    title: "Beginner",
    jlptLevel: "N5 Level",
    description: "Start your Japanese journey with basic vocabulary, greetings, and simple sentences.",
    features: [
      "Hiragana and Katakana mastery",
      "Basic greetings and introductions",
      "Simple sentence structures",
      "Essential vocabulary (500+ words)"
    ],
    image: "https://images.pexels.com/photos/5990267/pexels-photo-5990267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    color: "bg-pink-500"
  },
  {
    id: "elementary",
    title: "Elementary",
    jlptLevel: "N4 Level",
    description: "Build on the basics with more complex grammar and expanded vocabulary.",
    features: [
      "Basic Kanji (150+ characters)",
      "More complex sentence patterns",
      "Daily conversation skills",
      "Expanded vocabulary (1000+ words)"
    ],
    image: "https://images.pexels.com/photos/5990265/pexels-photo-5990265.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    color: "bg-indigo-500"
  },
  {
    id: "intermediate",
    title: "Intermediate",
    jlptLevel: "N3 Level",
    description: "Develop fluency with advanced grammar and comprehensive communication skills.",
    features: [
      "Intermediate Kanji (300+ characters)",
      "Complex grammar patterns",
      "Reading and comprehension skills",
      "Cultural context and nuances"
    ],
    image: "https://images.pexels.com/photos/5990300/pexels-photo-5990300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    color: "bg-teal-500"
  },
  {
    id: "advanced",
    title: "Advanced",
    jlptLevel: "N2-N1 Levels",
    description: "Master Japanese with native-like proficiency and business-level communication.",
    features: [
      "Advanced Kanji (1000+ characters)",
      "Business Japanese",
      "Advanced reading and writing",
      "Cultural mastery and idioms"
    ],
    image: "https://images.pexels.com/photos/5403547/pexels-photo-5403547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    color: "bg-red-500"
  }
];

const sampleTeachers = [
  {
    email: "yuki.sato@example.com",
    password: "password123",
    name: "Yuki Sato",
    role: "TEACHER"
  },
  {
    email: "takeshi.nakamura@example.com",
    password: "password123",
    name: "Takeshi Nakamura",
    role: "TEACHER"
  },
  {
    email: "sakura.tanaka@example.com",
    password: "password123",
    name: "Sakura Tanaka",
    role: "TEACHER"
  },
  {
    email: "hiroshi.yamamoto@example.com",
    password: "password123",
    name: "Hiroshi Yamamoto",
    role: "TEACHER"
  }
];

const sampleStudents = [
  {
    email: "student1@example.com",
    password: "password123",
    name: "John Smith",
    role: "STUDENT"
  },
  {
    email: "student2@example.com",
    password: "password123",
    name: "Sarah Johnson",
    role: "STUDENT"
  },
  {
    email: "student3@example.com",
    password: "password123",
    name: "Mike Davis",
    role: "STUDENT"
  }
];

const sampleAdmin = {
  email: "admin@example.com",
  password: "admin123",
  name: "System Admin",
  role: "ADMIN"
};

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function seedComplete() {
  console.log('🌱 Starting complete database seeding...');

  try {
    // Create sample teachers
    console.log('👨‍🏫 Creating sample teachers...');
    const createdTeachers = [];
    for (const teacher of sampleTeachers) {
      const existingTeacher = await prisma.user.findUnique({
        where: { email: teacher.email }
      });

      if (!existingTeacher) {
        const hashedPassword = await hashPassword(teacher.password);
        const createdTeacher = await prisma.user.create({
          data: {
            ...teacher,
            password: hashedPassword
          }
        });
        createdTeachers.push(createdTeacher);
        console.log(`✅ Created teacher: ${createdTeacher.name}`);
      } else {
        createdTeachers.push(existingTeacher);
        console.log(`📋 Teacher already exists: ${existingTeacher.name}`);
      }
    }

    // Create admin user
    console.log('👑 Creating admin user...');
    const existingAdmin = await prisma.user.findUnique({
      where: { email: sampleAdmin.email }
    });

    let createdAdmin;
    if (!existingAdmin) {
      const hashedPassword = await hashPassword(sampleAdmin.password);
      createdAdmin = await prisma.user.create({
        data: {
          ...sampleAdmin,
          password: hashedPassword
        }
      });
      console.log(`✅ Created admin: ${createdAdmin.name}`);
    } else {
      createdAdmin = existingAdmin;
      console.log(`📋 Admin already exists: ${existingAdmin.name}`);
    }

    // Create sample students
    console.log('🎓 Creating sample students...');
    const createdStudents = [];
    for (const student of sampleStudents) {
      const existingStudent = await prisma.user.findUnique({
        where: { email: student.email }
      });

      if (!existingStudent) {
        const hashedPassword = await hashPassword(student.password);
        const createdStudent = await prisma.user.create({
          data: {
            ...student,
            password: hashedPassword
          }
        });
        createdStudents.push(createdStudent);
        console.log(`✅ Created student: ${createdStudent.name}`);
      } else {
        createdStudents.push(existingStudent);
        console.log(`📋 Student already exists: ${existingStudent.name}`);
      }
    }

    // Create courses (levels)
    console.log('📚 Creating Japanese language courses...');
    const createdCourses = [];
    for (let i = 0; i < levelData.length; i++) {
      const level = levelData[i];
      const existingCourse = await prisma.course.findUnique({
        where: { id: level.id }
      });

      if (!existingCourse) {
        const courseData = {
          id: level.id,
          title: `${level.title} - ${level.jlptLevel}`,
          description: `${level.description}\n\n${level.features.map(feature => `• ${feature}`).join('\n')}`,
          active: true,
          teachers: {
            connect: [{ id: createdTeachers[i % createdTeachers.length].id }]
          }
        };

        const createdCourse = await prisma.course.create({
          data: courseData,
          include: {
            teachers: true
          }
        });
        createdCourses.push(createdCourse);
        console.log(`✅ Created course: ${createdCourse.title}`);
      } else {
        createdCourses.push(existingCourse);
        console.log(`📋 Course already exists: ${existingCourse.title}`);
      }
    }

    // Enroll students in courses
    console.log('📝 Enrolling students in courses...');
    for (const student of createdStudents) {
      for (const course of createdCourses.slice(0, 2)) { // Enroll each student in first 2 courses
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: student.id,
              courseId: course.id
            }
          }
        });

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              studentId: student.id,
              courseId: course.id
            }
          });
          console.log(`✅ Enrolled ${student.name} in ${course.title}`);
        }
      }
    }

    // Create sample notices
    console.log('📢 Creating sample notices...');
    const sampleNotices = [
      {
        title: "Welcome to Japanese Learning!",
        body: "Welcome to our comprehensive Japanese language learning platform. We're excited to have you on this journey to mastering Japanese!",
        courseId: null // General notice
      },
      {
        title: "Beginner Course Materials Available",
        body: "New study materials have been uploaded for the Beginner course. Check them out in the materials section!",
        courseId: "beginner"
      },
      {
        title: "Weekly Meeting Schedule",
        body: "Don't forget our weekly online meetings. Check the meetings section for the latest schedule.",
        courseId: null
      }
    ];

    for (const notice of sampleNotices) {
      await prisma.notice.create({
        data: {
          ...notice,
          postedBy: createdTeachers[0].id
        }
      });
    }
    console.log(`✅ Created ${sampleNotices.length} sample notices`);

    // Create sample meetings
    console.log('📅 Creating sample meetings...');
    const sampleMeetings = [
      {
        title: "Beginner Level Orientation",
        meetLink: "https://meet.google.com/abc-defg-hij",
        courseId: "beginner"
      },
      {
        title: "Elementary Grammar Session",
        meetLink: "https://meet.google.com/klm-nop-qrs",
        courseId: "elementary"
      },
      {
        title: "Intermediate Conversation Practice",
        meetLink: "https://meet.google.com/tuv-wxy-zab",
        courseId: "intermediate"
      }
    ];

    for (const meeting of sampleMeetings) {
      await prisma.meeting.create({
        data: {
          ...meeting,
          createdBy: createdTeachers[0].id
        }
      });
    }
    console.log(`✅ Created ${sampleMeetings.length} sample meetings`);

    // Create sample materials
    console.log('📄 Creating sample materials...');
    const sampleMaterials = [
      {
        title: "Hiragana Chart",
        type: "STUDY_MATERIAL",
        filePath: "/uploads/hiragana-chart.pdf",
        courseId: "beginner"
      },
      {
        title: "Katakana Practice",
        type: "STUDY_MATERIAL",
        filePath: "/uploads/katakana-practice.pdf",
        courseId: "beginner"
      },
      {
        title: "Basic Grammar Guide",
        type: "STUDY_MATERIAL",
        filePath: "/uploads/basic-grammar.pdf",
        courseId: "elementary"
      },
      {
        title: "Kanji Study Sheet",
        type: "STUDY_MATERIAL",
        filePath: "/uploads/kanji-sheet.pdf",
        courseId: "elementary"
      },
      {
        title: "Welcome Video",
        type: "RECORDED_LECTURE",
        filePath: "/uploads/welcome-video.mp4",
        courseId: "beginner"
      },
      {
        title: "Grammar Lesson 1",
        type: "RECORDED_LECTURE",
        filePath: "/uploads/grammar-lesson-1.mp4",
        courseId: "elementary"
      }
    ];

    for (const material of sampleMaterials) {
      await prisma.material.create({
        data: {
          ...material,
          uploadedBy: createdTeachers[0].id
        }
      });
    }
    console.log(`✅ Created ${sampleMaterials.length} sample materials`);

    // Create sample lectures
    console.log('🎥 Creating sample lectures...');
    const sampleLectures = [
      {
        title: "Introduction to Japanese",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        courseId: "beginner"
      },
      {
        title: "Basic Sentence Structure",
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        courseId: "elementary"
      },
      {
        title: "Kanji Reading Practice",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        courseId: "intermediate"
      }
    ];

    for (const lecture of sampleLectures) {
      await prisma.lecture.create({
        data: {
          ...lecture,
          createdBy: createdTeachers[0].id
        }
      });
    }
    console.log(`✅ Created ${sampleLectures.length} sample lectures`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👑 Admin: 1`);
    console.log(`   👨‍🏫 Teachers: ${createdTeachers.length}`);
    console.log(`   🎓 Students: ${createdStudents.length}`);
    console.log(`   📚 Courses: ${createdCourses.length}`);
    console.log(`   📝 Enrollments: ${createdStudents.length * 2}`);
    console.log(`   📄 Materials: ${sampleMaterials.length}`);
    console.log(`   🎥 Lectures: ${sampleLectures.length}`);
    console.log(`    Notices: ${sampleNotices.length}`);
    console.log(`   📅 Meetings: ${sampleMeetings.length}`);

    console.log('\n🔑 Sample Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   Teacher: yuki.sato@example.com / password123');
    console.log('   Student: student1@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedComplete()
    .then(() => {
      console.log('✅ Complete seeding finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedComplete, levelData, sampleTeachers, sampleStudents };