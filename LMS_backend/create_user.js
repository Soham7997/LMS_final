const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser(email, password, name, role = 'STUDENT') {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user in database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role.toUpperCase()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('✅ User created successfully:', user);
    return user;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
}

// Example usage:
async function main() {
  // Create an Admin user
  await createUser('admin@example.com', 'admin123', 'System Admin', 'ADMIN');
  
  // Create a Teacher
  await createUser('teacher@example.com', 'teacher123', 'John Teacher', 'TEACHER');
  
  // Create a Head
  await createUser('head@example.com', 'head123', 'Sarah Head', 'HEAD');
  
  // Create Management user
  await createUser('manager@example.com', 'manager123', 'Mike Manager', 'MANAGEMENT');
  
  // Create a Student
  await createUser('student@example.com', 'student123', 'Jane Student', 'STUDENT');
  
  await prisma.$disconnect();
}

main().catch(console.error);