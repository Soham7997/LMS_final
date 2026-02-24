# Bulk Account Creator

This script allows you to create multiple user accounts at once for the LMS system.

## Features

- ✅ **Bulk Email Input**: Enter multiple email addresses separated by commas
- ✅ **Role Selection**: Choose roles for each user (STUDENT, TEACHER, ADMIN, HEAD, MANAGEMENT)
- ✅ **Auto Name Extraction**: Automatically extracts names from email addresses using regex
- ✅ **Random Password Generation**: Generates secure random passwords for each account
- ✅ **Duplicate Prevention**: Skips existing email addresses
- ✅ **Results Display**: Shows created accounts with credentials
- ✅ **File Export**: Option to save credentials to a file

## Usage

### Prerequisites

1. **Database Connection**: Ensure your LMS database is running and accessible
2. **Environment Variables**: Make sure your `.env` file has the correct `DATABASE_URL`

### Running the Script

```bash
cd LMS_backend
node bulk-account-creator.js
```

### Example Session

```
🚀 LMS Bulk Account Creator
===========================

Enter email addresses (comma-separated): john.doe@university.edu, jane.smith@school.com, admin@lms.com
📧 Found 3 email(s) to process

👤 Account 1: john.doe@university.edu
📝 Extracted name: "John Doe"
Select role for john.doe@university.edu (STUDENT/TEACHER/ADMIN/HEAD/MANAGEMENT): STUDENT

👤 Account 2: jane.smith@school.com
📝 Extracted name: "Jane Smith"
Select role for jane.smith@school.com (STUDENT/TEACHER/ADMIN/HEAD/MANAGEMENT): TEACHER

👤 Account 3: admin@lms.com
📝 Extracted name: "Admin"
Select role for admin@lms.com (STUDENT/TEACHER/ADMIN/HEAD/MANAGEMENT): ADMIN

📋 Accounts to be created:
1. John Doe <john.doe@university.edu> - STUDENT
2. Jane Smith <jane.smith@school.com> - TEACHER
3. Admin <admin@lms.com> - ADMIN

✅ Proceed with account creation? (y/N): y

🔄 Creating accounts...
✅ Created: John Doe <john.doe@university.edu> - STUDENT
✅ Created: Jane Smith <jane.smith@school.com> - TEACHER
✅ Created: Admin <admin@lms.com> - ADMIN

🎉 Account Creation Summary
===========================

👤 Account 1:
   Name: John Doe
   Email: john.doe@university.edu
   Role: STUDENT
   Password: Xy7$mN2pL9
   Created: 2024-01-15T10:30:00.000Z

👤 Account 2:
   Name: Jane Smith
   Email: jane.smith@school.com
   Role: TEACHER
   Password: Ak3$tR8vB4
   Created: 2024-01-15T10:30:01.000Z

👤 Account 3:
   Name: Admin
   Email: admin@lms.com
   Role: ADMIN
   Password: Mq9$wP5nR2
   Created: 2024-01-15T10:30:02.000Z

💾 Save credentials to file? (y/N): y
📄 Credentials saved to: lms_accounts_2024-01-15.txt

✅ Process completed! Created 3 account(s).
```

## Name Extraction Logic

The script uses regex to extract names from email addresses:

### Examples:
- `john.doe@university.edu` → `John Doe`
- `jane_smith@school.com` → `Jane Smith`
- `admin@lms.com` → `Admin`
- `mary.jones@college.org` → `Mary Jones`
- `robert-brown@academy.net` → `Robert Brown`

### Rules:
1. Removes domain part (everything after `@`)
2. Replaces dots, underscores, and hyphens with spaces
3. Capitalizes first letter of each word
4. Handles various email formats

## Password Security

- **Length**: 12 characters (configurable)
- **Characters**: Uppercase, lowercase, numbers, and special characters
- **Uniqueness**: Each password is randomly generated
- **Security**: Uses cryptographically secure random generation

## Error Handling

- **Invalid Emails**: Skips emails that don't match standard format
- **Existing Users**: Skips emails that already exist in database
- **Database Errors**: Shows specific error messages for failed creations
- **File Operations**: Handles file writing errors gracefully

## Output Options

### Console Output
- Real-time progress updates
- Color-coded status messages
- Summary of all created accounts

### File Export
- Saves credentials to timestamped file
- Format: `lms_accounts_YYYY-MM-DD.txt`
- Includes all account details
- Easy to share with users

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt before database storage
2. **No Plain Text**: Plain passwords are only shown during creation process
3. **Secure Generation**: Uses crypto-secure random password generation
4. **Role Validation**: Validates role selection against allowed values

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DATABASE_URL in .env file
   - Ensure database is running
   - Verify connection permissions

2. **Email Validation Errors**
   - Ensure emails follow standard format: user@domain.com
   - Check for special characters in local part

3. **Role Selection Issues**
   - Use only allowed roles: STUDENT, TEACHER, ADMIN, HEAD, MANAGEMENT
   - Roles are case-sensitive

4. **File Writing Errors**
   - Check write permissions in current directory
   - Ensure sufficient disk space

## Integration with LMS

### After Account Creation:
1. **Users can login** immediately with provided credentials
2. **Passwords can be changed** through profile settings
3. **Role-based access** is enforced throughout the system
4. **Account activity** is tracked in the system logs

### For Students:
- Can enroll in courses
- Access learning materials
- Join meetings
- View notices

### For Teachers:
- Can create and manage courses
- Upload materials and lectures
- Create meetings and notices
- View student progress

### For Admins:
- Full system access
- User management capabilities
- System configuration
- Generate reports

## Best Practices

1. **Use Strong Passwords**: The script generates secure passwords, but encourage users to change them
2. **Role Assignment**: Carefully assign roles based on user responsibilities
3. **Bulk Operations**: Test with small batches first
4. **Backup Credentials**: Save the generated credentials securely
5. **User Communication**: Inform users about their login credentials

## Support

For issues with the bulk account creator:
- Check the console output for specific error messages
- Verify database connectivity
- Ensure proper environment configuration
- Review the generated log files

---

This tool streamlines the process of creating multiple user accounts for your LMS system, making it easy to onboard large groups of students, teachers, or administrators efficiently.