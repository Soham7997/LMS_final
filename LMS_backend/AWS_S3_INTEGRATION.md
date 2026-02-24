# AWS S3 Integration Guide

This document contains the necessary code and instructions for integrating AWS S3 storage with the LMS system.

## Prerequisites

1. **AWS Account** with S3 permissions
2. **S3 Bucket** created in your AWS account
3. **AWS IAM User** with the following permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::YOUR_BUCKET_NAME",
           "arn:aws:s3:::YOUR_BUCKET_NAME/*"
         ]
       }
     ]
   }
   ```

## Required Dependencies

Add these dependencies to your `package.json`:

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.400.0",
    "@aws-sdk/s3-request-presigner": "^3.400.0"
  }
}
```

Install with:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name

# Storage Configuration
STORAGE_TYPE=s3  # Set to 's3' to enable S3, 'local' for local storage
```

## S3 Bucket Configuration

### CORS Configuration (for web access):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Bucket Policy (optional, for public read access):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

## Usage

### 1. Enable S3 Storage

Set the environment variable:
```env
STORAGE_TYPE=s3
```

### 2. File Upload Process

The system will automatically:
- Upload files to S3 when `STORAGE_TYPE=s3`
- Generate signed URLs for secure access
- Store only the S3 key in the database
- Clean up local files after S3 upload

### 3. File Access

Files are accessed via signed URLs that expire after 1 hour (configurable). The signed URL generation happens automatically when files are requested.

### 4. File Deletion

When materials are deleted, the system will:
- Remove the file from S3
- Delete the database record

## Cost Considerations

### S3 Pricing (as of 2024):
- **Storage**: $0.023 per GB/month
- **Requests**: $0.005 per 1,000 requests
- **Data Transfer**: $0.09 per GB (first 1GB free)

### Estimated Monthly Cost for LMS:
- **100 users, 50 courses, 200 files**: ~$2-5/month
- **1000 users, 200 courses, 2000 files**: ~$20-50/month

## Security Best Practices

1. **Use IAM roles** instead of access keys when possible
2. **Enable versioning** on your S3 bucket
3. **Set up CloudTrail** for audit logging
4. **Use signed URLs** instead of public access
5. **Enable encryption** (SSE-S3 or SSE-KMS)
6. **Set up lifecycle policies** for automatic deletion

## Performance Optimization

1. **CloudFront CDN** for faster file delivery
2. **S3 Transfer Acceleration** for faster uploads
3. **Multipart uploads** for large files
4. **Caching** signed URLs client-side when possible

## Monitoring & Alerts

Set up CloudWatch alarms for:
- S3 bucket size
- Number of requests
- Error rates
- Data transfer costs

## Backup Strategy

1. **Cross-region replication** for disaster recovery
2. **Versioning** for file history
3. **Regular backups** to another storage service
4. **Test restoration** procedures

## Migration from Local to S3

If you have existing files in local storage:

1. **Set STORAGE_TYPE=local** temporarily
2. **Run migration script** (create one to upload existing files to S3)
3. **Update database records** with S3 keys
4. **Switch STORAGE_TYPE=s3**
5. **Remove local files** after verification

## Troubleshooting

### Common Issues:

1. **Access Denied**
   - Check IAM permissions
   - Verify bucket policy
   - Ensure correct region

2. **Signed URL Expired**
   - Increase expiration time in `getSignedUrlForFile`
   - Check client-side caching

3. **Upload Failures**
   - Check file size limits
   - Verify network connectivity
   - Check AWS service status

4. **CORS Errors**
   - Update bucket CORS policy
   - Check request origin

## Support

For AWS S3 issues:
- AWS Documentation: https://docs.aws.amazon.com/s3/
- AWS Support: https://aws.amazon.com/support/
- LMS Issues: Check application logs and database records