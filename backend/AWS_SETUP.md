# AWS Bedrock Setup Guide for MitraSetu

This guide explains how to configure AWS credentials so that Amazon Nova Pro can be used via Bedrock.

## Quick Setup (for Hackathon)

### Option 1: Environment Variables (Recommended for Local Development)

Add these to your `backend/.env` file:

```env
# AWS Credentials (required for Bedrock API calls)
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# Optional: Override default model
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
```

### Option 2: AWS Credentials File

If you prefer not to put credentials in `.env`, create `~/.aws/credentials` (Windows: `C:\Users\YourUsername\.aws\credentials`):

```ini
[default]
aws_access_key_id = your_access_key_here
aws_secret_access_key = your_secret_key_here
region = us-east-1
```

### Option 3: IAM Role (for EC2/ECS/Lambda)

If running on AWS infrastructure, attach an IAM role with `bedrock:InvokeModel` permission.

## Getting AWS Credentials

1. **Log in to AWS Console**: https://console.aws.amazon.com
2. **Go to IAM** → Users → Your User → Security Credentials
3. **Create Access Key** (if you don't have one)
4. **Copy** the Access Key ID and Secret Access Key

## Required IAM Permissions

Your AWS user/role needs this permission:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/amazon.nova-pro-v1:0"
    }
  ]
}
```

Or use the managed policy: `AmazonBedrockFullAccess` (for hackathon/testing only; restrict in production).

## Enable Bedrock Model Access

**Important**: Even with credentials, you must enable model access in Bedrock:

1. Go to **AWS Console** → **Amazon Bedrock** → **Model access**
2. Find **Amazon Nova Pro** (`amazon.nova-pro-v1:0`)
3. Click **Enable** (or **Request model access** if it's not available in your region)

## Testing Your Setup

After configuring credentials, restart your backend and test:

```powershell
.\test-chat-api.ps1
```

If you see errors about credentials, check:
- ✅ `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
- ✅ `AWS_REGION` is set (defaults to `us-east-1`)
- ✅ Model access is enabled in Bedrock console
- ✅ IAM permissions are correct

## Troubleshooting

**Error: "CredentialsError" or "Unable to locate credentials"**
- Solution: Add AWS credentials to `.env` or AWS credentials file

**Error: "AccessDeniedException"**
- Solution: Check IAM permissions and ensure model access is enabled in Bedrock console

**Error: "ModelNotReadyException"**
- Solution: Enable the model in Bedrock console → Model access

**Error: "ValidationException"**
- Solution: Check that `BEDROCK_MODEL_ID` matches an available model (e.g., `amazon.nova-pro-v1:0`)
