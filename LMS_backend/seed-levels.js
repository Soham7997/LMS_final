const { PrismaClient } = require('@prisma/client');

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

async function seedLevels() {
  console.log('🌱 Starting to seed Japanese language levels...');

  try {
    // Check if levels already exist
    const existingLevels = await prisma.course.findMany({
      where: {
        id: {
          in: levelData.map(level => level.id)
        }
      }
    });

    if (existingLevels.length > 0) {
      console.log(`📋 Found ${existingLevels.length} existing levels. Skipping seed.`);
      return;
    }

    // Create levels as courses
    for (const level of levelData) {
      const courseData = {
        id: level.id,
        title: `${level.title} - ${level.jlptLevel}`,
        description: `${level.description}\n\n${level.features.map(feature => `• ${feature}`).join('\n')}`,
        active: true,
        // Note: teachers and other relations will need to be set up separately
        // as they require existing user records
      };

      await prisma.course.create({
        data: courseData
      });

      console.log(`✅ Created course: ${courseData.title}`);
    }

    console.log('🎉 Successfully seeded all Japanese language levels!');

    // Display created courses
    const createdCourses = await prisma.course.findMany({
      where: {
        id: {
          in: levelData.map(level => level.id)
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        active: true,
        createdAt: true
      }
    });

    console.log('\n📚 Created Courses:');
    createdCourses.forEach(course => {
      console.log(`  - ${course.title} (${course.active ? 'Active' : 'Inactive'})`);
    });

  } catch (error) {
    console.error('❌ Error seeding levels:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedLevels()
    .then(() => {
      console.log('✅ Seed completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedLevels, levelData };