const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const jlptCourses = [
  {
    title: 'JLPT N5',
    description: 'This is the first level for beginners. It shows that a person can understand some basic Japanese. This includes reading simple sentences and listening to short, slow conversations about everyday life.',
    active: true
  },
  {
    title: 'JLPT N4',
    description: 'This level builds on the basics. It shows a person can understand daily conversations and read simple texts on familiar topics. It means having a good knowledge of basic grammar and words.',
    active: true
  },
  {
    title: 'JLPT N3',
    description: 'This is the middle level. It shows a person can understand Japanese in many daily situations fairly well. This includes reading articles and following conversations spoken at an almost normal speed.',
    active: true
  },
  {
    title: 'JLPT N2',
    description: 'This is an advanced level, often needed for work or university in Japan. It shows a person can understand many different things, like the news and articles. It also means they can talk about difficult topics clearly.',
    active: true
  },
  {
    title: 'JLPT N1',
    description: 'This is the highest and most difficult level. It shows a very high skill in Japanese, similar to a native speaker. A person at this level can understand complex writing, like in newspapers, and talk about difficult ideas in a very clear and detailed way.',
    active: true
  }
];

async function seedJLPTCourses() {
  console.log('🌱 Starting JLPT courses seeding...');

  try {
    // Check if courses already exist
    const existingCourses = await prisma.course.findMany({
      where: {
        title: {
          in: jlptCourses.map(course => course.title)
        }
      }
    });

    if (existingCourses.length > 0) {
      console.log('📚 JLPT courses already exist:', existingCourses.map(c => c.title));
      return;
    }

    // Create JLPT courses
    for (const courseData of jlptCourses) {
      const course = await prisma.course.create({
        data: courseData
      });
      console.log(`✅ Created course: ${course.title}`);
    }

    console.log('🎉 All JLPT courses seeded successfully!');

    // Display created courses
    const allCourses = await prisma.course.findMany({
      where: {
        title: {
          in: jlptCourses.map(course => course.title)
        }
      }
    });

    console.log('\n📋 Created JLPT Courses:');
    allCourses.forEach(course => {
      console.log(`- ${course.title}: ${course.description.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error seeding JLPT courses:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedJLPTCourses()
    .then(() => {
      console.log('✅ JLPT courses seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ JLPT courses seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedJLPTCourses };