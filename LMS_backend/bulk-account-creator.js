#!/usr/bin/env node

/**
 * Bulk Account Creator for LMS
 *
 * This script allows you to create multiple user accounts at once.
 * Usage: node bulk-account-creator.js
 *
 * Features:
 * - Input multiple email addresses
 * - Select role for each user
 * - Auto-generate random passwords
 * - Extract names from email addresses using regex
 * - Display created accounts with credentials
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Generate random password
function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Extract name from email using regex
function extractNameFromEmail(email) {
  // Remove domain and special characters, capitalize first letter of each word
  const localPart = email.split('@')[0];
  const cleanName = localPart.replace(/[^a-zA-Z0-9]/g, ' ').trim();

  // Split by spaces/underscores/dots and capitalize each word
  const words = cleanName.split(/[\s_.]+/).filter(word => word.length > 0);
  const capitalizedWords = words.map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  return capitalizedWords.join(' ');
}

// Ask user for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Main function
async function main() {
  console.log('🚀 LMS Bulk Account Creator');
  console.log('===========================\n');

  try {
    // Get emails
    const emailsInput = await askQuestion('Enter email addresses (comma-separated): ');
    const emails = emailsInput.split(',').map(email => email.trim()).filter(email => email);

    if (emails.length === 0) {
      console.log('❌ No emails provided. Exiting...');
      process.exit(1);
    }

    // Validate emails
    const invalidEmails = emails.filter(email => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      console.log('❌ Invalid email formats:', invalidEmails.join(', '));
      process.exit(1);
    }

    console.log(`\n📧 Found ${emails.length} email(s) to process\n`);

    // Get role for each email
    const accounts = [];
    const roles = ['STUDENT', 'TEACHER', 'ADMIN', 'HEAD', 'MANAGEMENT'];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const extractedName = extractNameFromEmail(email);

      console.log(`\n👤 Account ${i + 1}: ${email}`);
      console.log(`📝 Extracted name: "${extractedName}"`);

      const roleInput = await askQuestion(`Select role for ${email} (${roles.join('/')}): `);
      const role = roleInput.toUpperCase();

      if (!roles.includes(role)) {
        console.log(`❌ Invalid role. Using STUDENT as default.`);
        accounts.push({
          email,
          name: extractedName,
          role: 'STUDENT'
        });
      } else {
        accounts.push({
          email,
          name: extractedName,
          role
        });
      }
    }

    // Confirm creation
    console.log('\n📋 Accounts to be created:');
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.name} <${account.email}> - ${account.role}`);
    });

    const confirm = await askQuestion('\n✅ Proceed with account creation? (y/N): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Account creation cancelled.');
      process.exit(0);
    }

    // Create accounts
    console.log('\n🔄 Creating accounts...\n');

    const createdAccounts = [];

    for (const account of accounts) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: account.email }
        });

        if (existingUser) {
          console.log(`⚠️  User ${account.email} already exists. Skipping...`);
          continue;
        }

        // Generate password
        const password = generatePassword();
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
          data: {
            email: account.email,
            password: hashedPassword,
            name: account.name,
            role: account.role
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        });

        createdAccounts.push({
          ...user,
          password: password // Store plain password for display
        });

        console.log(`✅ Created: ${account.name} <${account.email}> - ${account.role}`);

      } catch (error) {
        console.log(`❌ Failed to create account for ${account.email}:`, error.message);
      }
    }

    // Display results
    if (createdAccounts.length > 0) {
      console.log('\n🎉 Account Creation Summary');
      console.log('===========================\n');

      createdAccounts.forEach((account, index) => {
        console.log(`👤 Account ${index + 1}:`);
        console.log(`   Name: ${account.name}`);
        console.log(`   Email: ${account.email}`);
        console.log(`   Role: ${account.role}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Created: ${account.createdAt.toLocaleString()}`);
        console.log('');
      });

      // Save to file option
      const saveToFile = await askQuestion('💾 Save credentials to file? (y/N): ');
      if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = `lms_accounts_${new Date().toISOString().split('T')[0]}.txt`;
        const fileContent = createdAccounts.map((account, index) =>
          `Account ${index + 1}:\n` +
          `Name: ${account.name}\n` +
          `Email: ${account.email}\n` +
          `Role: ${account.role}\n` +
          `Password: ${account.password}\n` +
          `Created: ${account.createdAt.toLocaleString()}\n\n`
        ).join('');

        require('fs').writeFileSync(filename, fileContent);
        console.log(`📄 Credentials saved to: ${filename}`);
      }
    }

    console.log(`\n✅ Process completed! Created ${createdAccounts.length} account(s).`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n\n❌ Process interrupted. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
main().catch(console.error);