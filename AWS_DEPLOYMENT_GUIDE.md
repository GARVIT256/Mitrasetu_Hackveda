# AWS Deployment Guide for MitraSetu

This guide provides step-by-step instructions to deploy your MitraSetu application on AWS.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Phase 1: AWS Infrastructure Setup](#phase-1-aws-infrastructure-setup)
4. [Phase 2: Backend Deployment](#phase-2-backend-deployment)
5. [Phase 3: Frontend Deployment](#phase-3-frontend-deployment)
6. [Phase 4: Database Configuration](#phase-4-database-configuration)
7. [Phase 5: AWS Bedrock Setup](#phase-5-aws-bedrock-setup)
8. [Phase 6: Security & Best Practices](#phase-6-security--best-practices)
9. [Phase 7: Monitoring & Maintenance](#phase-7-monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ AWS Account with appropriate permissions
- ✅ AWS CLI installed and configured
- ✅ Node.js v18+ installed locally
- ✅ Git installed
- ✅ Basic understanding of AWS services
- ✅ A domain name (optional, recommended for production)

### Install AWS CLI (if not already installed)

**Windows:**
```powershell
wing install aws cli
```

**Configure AWS CLI:**
```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region (e.g., `us-east-1`), and default output format (`json`).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Cloud                             │
│                                                              │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  CloudFront     │         │   EC2 Instance  │           │
│  │  (CDN)          │────────▶│   (Backend)     │           │
│  │                 │         │                 │           │
│  └────────┬────────┘         │  ┌───────────┐  │           │
│           │                  │  │  Node.js  │  │           │
│  ┌────────▼────────┐         │  │  Express  │  │           │
│  │  S3 Bucket      │         │  │  Socket.io│  │           │
│  │  (Static Files) │         │  └───────────┘  │           │
│  └─────────────────┘         └─────────┬───────┘           │
│                                       │                    │
│                            ┌──────────▼───────────┐        │
│                            │  MongoDB Atlas       │        │
│                            │  (Database)          │        │
│                            └──────────────────────┘        │
│                                       │                    │
│                            ┌──────────▼───────────┐        │
│                            │  AWS Bedrock         │        │
│                            │  (AI Services)       │        │
│                            └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Services Used

- **Amazon EC2**: Backend server hosting
- **Amazon S3**: Static website hosting for React frontend
- **Amazon CloudFront**: CDN for frontend distribution
- **MongoDB Atlas**: Database (managed MongoDB service)
- **AWS Bedrock**: AI model hosting (Amazon Nova Pro)
- **AWS IAM**: Identity and access management
- **AWS CloudWatch**: Monitoring and logging
- **Route 53** (optional): DNS management

---

## Phase 1: AWS Infrastructure Setup

### 1.1 Create IAM User for Deployment

1. **Log in to AWS Console**: https://console.aws.amazon.com
2. **Navigate to IAM** → **Users** → **Create user**
3. **User name**: `mitrasetu-deploy`
4. **Permissions**: Choose "Attach policies directly"
5. **Add policies**:
   - `AdministratorAccess` (for initial setup, tighten later)
   - OR specific policies for production

6. **Create access key**:
   - In the user details, go to **Security credentials** → **Create access key**
   - Choose **Third-party service** or **CLI**
   - Save the Access Key ID and Secret Access Key

### 1.2 Set Up VPC and Security Groups

#### Create Security Group for Backend

1. **EC2 Dashboard** → **Security Groups** → **Create security group**
2. **Security group name**: `mitrasetu-backend-sg`
3. **Description**: `MitraSetu Backend Security Group`
4. **VPC**: Select default VPC

#### Inbound Rules:
| Type  | Protocol | Port Range | Source        |
|-------|----------|------------|---------------|
| SSH   | TCP      | 22         | Your IP/32    |
| HTTP  | TCP      | 80         | 0.0.0.0/0     |
| HTTPS | TCP      | 443        | 0.0.0.0/0     |
| Custom| TCP      | 5000       | 0.0.0.0/0     |
| Custom| TCP      | 5000       | CloudFront IP |

#### Outbound Rules:
| Type | Protocol | Port Range | Destination |
|------|----------|------------|-------------|
| All traffic | All | All | 0.0.0.0/0 |

---

## Phase 2: Backend Deployment

### 2.1 Create EC2 Instance

1. **EC2 Dashboard** → **Launch Instance**
2. **Name**: `mitrasetu-backend`
3. **AMI**: Ubuntu Server 22.04 LTS (or Amazon Linux 2023)
4. **Instance type**: `t3.medium` (2 vCPU, 4GB RAM) or higher
5. **Key pair**: Create/download a new key pair (save securely!)
6. **Network settings**:
   - Select your security group: `mitrasetu-backend-sg`
7. **Configure storage**: 30 GB GP3
8. **Launch**: Review and launch instance

### 2.2 Connect to EC2 Instance

**Windows (using PowerShell or Git Bash):**
```bash
ssh -i "mitrasetu-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2.3 Install Node.js and Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version

# Install build tools (may be needed for some packages)
sudo apt install -y build-essential
```

### 2.4 Clone and Setup Backend

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/YOUR_USERNAME/MitraSetu.git
cd MitraSetu/backend

# Install dependencies
npm install

# Create environment file
nano .env
```

Add the following to `.env` ( Phase 4 for credentials):
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/mitrasetu

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars

# Encryption Key (32 characters for AES-256)
ENCRYPTION_KEY=your_32_character_encryption_key_here

# AWS Bedrock Configuration (from Phase 5)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0

# CORS Origins (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

### 2.5 Configure PM2 for Process Management

```bash
# Start the application with PM2
pm2 start index.js --name "mitrasetu-backend"

# Save PM2 process list
pm2 save

# Setup PM2 to start on system reboot
pm2 startup
# Run the command output by the above step
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 2.6 Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs mitrasetu-backend

# Test the application locally
curl http://localhost:5000
```

### 2.7 Setup Nginx as Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/mitrasetu-backend
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_BACKEND_DOMAIN.com;

    # Increase the maximum request body size (for file uploads if needed)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io support
    location /socket.io/ {
        proxy_pass http://localhost:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/mitrasetu-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

---

## Phase 3: Frontend Deployment

### 3.1 Build the React Frontend

**On your local machine:**

```bash
# Navigate to react_frontend directory
cd react_frontend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add:
```env
VITE_API_BASE_URL=https://YOUR_API_DOMAIN.com
VITE_LIVE_MODE=live
```

```bash
# Build the production version
npm run build

# The build output will be in the 'dist' directory
```

### 3.2 Create S3 Bucket

1. **S3 Dashboard** → **Create bucket**
2. **Bucket name**: `mitrasetu-frontend-unique-name` (must be globally unique)
3. **Region**: Same as your EC2 instance (e.g., `us-east-1`)
4. **Block Public Access settings**: UNCHECK "Block all public access"
5. **Create bucket**

### 3.3 Upload Build Artifacts

**Option A: Using AWS Console:**
1. Open the bucket
2. Upload the entire `dist` folder contents
3. Upload folder structure

**Option B: Using AWS CLI:**
```bash
# Navigate to react_frontend directory
cd react_frontend

# Sync the dist folder to S3
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

### 3.4 Configure S3 for Static Hosting

1. **Open bucket** → **Properties** → **Static website hosting**
2. **Edit**: Enable static website hosting
3. **Index document**: `index.html`
4. **Error document**: `index.html` (for SPA routing)
5. **Save changes**

### 3.5 Set Up S3 Bucket Policy

1. **Open bucket** → **Permissions** → **Bucket Policy**
2. **Edit**: Add this policy:

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

### 3.6 Create CloudFront Distribution

1. **CloudFront Dashboard** → **Create distribution**
2. **Origin domain**: Select your S3 bucket from dropdown
3. **S3 Bucket Access**: "Yes use OAI" or "Legacy access identities"
4. **Origin access identity**: Create new OAI
5. **Bucket policy**: Update bucket policy (CloudFront will prompt)
6. **Default cache behavior settings**:
   - **Viewer protocol policy**: "Redirect HTTP to HTTPS"
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS
   - **Cached HTTP methods**: GET, HEAD
   - **Cache key and origin requests**:
     - **Cookies**: "Whitelist" - None
     - **Headers**: Add `Authorization` if using auth headers
7. **Settings**:
   - **Price class**: "Use all edge locations" (best performance)
   - **Alternate domain names**: Add your domain (e.g., `frontend.yourdomain.com`)
   - **Custom SSL certificate**: If you have a domain, add ACM certificate
   - **Default root object**: `index.html`
   - **Standard logging**: Enable logging
8. **Create distribution**

### 3.7 Configure CloudFront for SPA Routing

1. **Open your distribution** → **Behaviors** → **Edit**
2. **Error pages** → **Create custom error response**:
   - **HTTP error code**: 403 & 404
   - **Customize error response**: Yes
   - **Response page path**: `/index.html`
   - **HTTP response code**: 200

---

## Phase 4: Database Configuration

### 4.1 Set Up MongoDB Atlas

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
2. **Sign up/Login**
3. **Create a new cluster**:
   - Cluster name: `mitrasetu-cluster`
   - Choose a provider and region (same as AWS region)
   - Cluster tier: M0 (Free) or M2 for production
4. **Configure security**:
   - **Network Access**: Add IP address `0.0.0.0/0` (for production, use your VPC CIDR)
   - **Database Access**: Create database user
     - Username: `mitrasetu_user`
     - Password: Use a strong password
     - Database User Privileges: Read and write to any database
5. **Connect**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Get the connection URI: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net`

### 4.2 Update Backend Environment

Update the `MONGO_URI` in your `.env` file on EC2:

```bash
nano ~/MitraSetu/backend/.env
```

Update:
```env
MONGO_URI=mongodb+srv://mitrasetu_user:YOUR_PASSWORD@mitrasetu-cluster.xxxx.mongodb.net/mitrasetu
```

```bash
# Restart the application
pm2 restart mitrasetu-backend
pm2 logs mitrasetu-backend
```

---

## Phase 5: AWS Bedrock Setup

### 5.1 Enable Bedrock Model Access

1. **AWS Console** → **Amazon Bedrock**
2. **Model access** → **Get started**
3. Scroll to **Foundation models**
4. Find **Amazon Nova Pro** or enable access to other models:
   - ✅ amazon.nova-pro-v1:0 (main model)
   - ✅ amazon.nova-lite-v1:0 (lighter alternative)
   - ✅ amazon.titan-text-premier-v1:0 (text model)
5. **Request model access** (usually approved automatically)
6. Wait for approval (typically instant for these models)

### 5.2 Configure IAM Permissions for Bedrock

1. **IAM Dashboard** → **Roles**
2. **Create role** for EC2 instance (or add to existing)
3. **Trusted entity**: AWS service → EC2
4. **Permissions**: Attach inline policy:

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
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/amazon.nova-pro-v1:0",
        "arn:aws:bedrock:*::foundation-model/amazon.nova-lite-v1:0",
        "arn:aws:bedrock:*::foundation-model/amazon.titan-text-premier-v1:0"
      ]
    }
  ]
}
```

5. **Name**: `mitrasetu-bedrock-role`
6. **Create role**

### 5.3 Attach IAM Role to EC2 Instance

1. **EC2 Dashboard** → **Instances** → Select your instance
2. **Actions** → **Security** → **Modify IAM role**
3. **IAM role**: Select `mitrasetu-bedrock-role`
4. **Update IAM role**

### 5.4 Verify Bedrock Access

```bash
# SSH into EC2
ssh -i "mitrasetu-key.pem" ubuntu@YOUR_EC2_IP

# Test Bedrock connectivity
cd ~/MitraSetu/backend

# Use Node REPL to test
node
```

```javascript
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const input = {
  modelId: "amazon.nova-pro-v1:0",
  contentType: "application/json",
  accept: "application/json",
  body: JSON.stringify({
    inputText: "Hello, can you help me?",
    textGenerationConfig: {
      maxTokenCount: 100,
      temperature: 0.7,
      topP: 0.9
    }
  })
};

client.send(new InvokeModelCommand(input))
  .then(response => {
    const responseText = new TextDecoder().decode(response.body);
    console.log(JSON.parse(responseText));
  })
  .catch(error => {
    console.error("Error:", error);
  });
```

If successful, you'll see a JSON response with the model's output.

---

## Phase 6: Security & Best Practices

### 6.1 SSL/TLS Configuration

#### Obtain SSL Certificate (ACM)

1. **AWS Console** → **Certificate Manager (ACM)**
2. **Request a certificate** → **Request public certificate**
3. **Domain names**: Add your domains:
   - `api.yourdomain.com` (backend)
   - `yourdomain.com` (frontend)
4. **Validation**: Choose "DNS validation"
5. **Request**
6. **Validation**: Click each domain → **Create record in Route 53**
7. **Wait for validation** (click refresh periodically)

#### Update CloudFront Distribution

1. **Open your distribution** → **General**
2. **Edit**: 
   - **Alternate domain names**: Add your domain
   - **Custom SSL certificate**: Select your ACM certificate
3. **Save changes**

### 6.2 Update CORS Configuration

Update your backend's CORS settings to include your production domain:

```bash
nano ~/MitraSetu/backend/index.js
```

Update the CORS configuration (around line 19):
```javascript
app.use(cors({
  origin: [
    'https://yourdomain.com',           // Production frontend
    'https://frontend.yourdomain.com',  // CloudFront URL
    'http://localhost:5173',            // Local development
    'http://localhost:3000'             // Other local
  ],
  credentials: true
}));
```

```bash
pm2 restart mitrasetu-backend
```

### 6.3 Update Frontend API URL

Update your React frontend to use production API URL:

**In `react_frontend/.env.production`:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_LIVE_MODE=live
```

Rebuild and redeploy:
```bash
cd react_frontend
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete
```

### 6.4 Enable CloudWatch Monitoring

```bash
# Install CloudWatch agent on EC2
sudo apt install -y amazon-cloudwatch-agent

# Download configuration
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start agent
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent
```

### 6.5 Set Up Auto Scaling (Optional for Production)

1. **Create AMI from your instance**:
   - EC2 → Instances → Select instance
   - Actions → Image → Create image
   - Name: `mitrasetu-backend-ami-v1`

2. **Create Launch Template**:
   - EC2 → Launch Templates → Create launch template
   - Use your AMI and security group
   - Select your IAM role with Bedrock permissions

3. **Create Auto Scaling Group**:
   - EC2 → Auto Scaling Groups → Create
   - Use your launch template
   - Min: 1, Max: 4, Desired: 1
   - Scale on CPU > 70%, scale out
   - Scale on CPU < 30%, scale in

---

## Phase 7: Monitoring & Maintenance

### 7.1 Set Up CloudWatch Alarms

1. **CloudWatch Dashboard** → **Alarms** → **Create alarm**
2. **Select metric**:
   - EC2 → Per-instance metrics → CPUUtilization
   - Threshold: > 80% for 5 minutes
3. **Actions**: Send notification via SNS or auto-recover

### 7.2 Set Up Log Monitoring

```bash
# View PM2 logs
pm2 logs mitrasetu-backend --lines 100

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 7.3 Backup Strategy

- **Database Backups**: MongoDB Atlas provides automatic backups
- **Code Backups**: Ensure GitHub backup is set up
- **Configure S3 Versioning**: Enable on your frontend bucket

---

## Troubleshooting

### Issue: Backend Not Accessible

**Symptoms:** Can't reach API on port 443/80

**Solution:**
```bash
# Check if backend is running
pm2 status

# Check if listening on port 5000
sudo netstat -tlnp | grep 5000

# Restart backend
pm2 restart mitrasetu-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: CORS Errors

**Symptoms:** Browser shows CORS errors

**Solution:**
```bash
# Check CORS configuration
cat ~/MitraSetu/backend/index.js | grep -A 10 "app.use(cors"

# Update CORS origins to include your CloudFront URL
nano ~/MitraSetu/backend/index.js

# Restart backend
pm2 restart mitrasetu-backend
```

### Issue: WebSocket Not Connecting

**Symptoms:** chat features not working, real-time updates not working

**Solution:**
```bash
# Check Socket.io logs
pm2 logs mitrasetu-backend | grep socket

# Verify Socket.io is accessible
curl http://localhost:5000/socket.io/

# Check CloudFront distribution settings for WebSocket support
# CloudFront doesn't support WebSocket for S3 origin, skip CloudFront for WebSocket
# Direct frontend to connect to backend API URL for Socket.io
```

### Issue: Bedrock Access Denied

**Symptoms:** AI features not working, access denied errors

**Solution:**
```bash
# Verify IAM role is attached
aws ec2 describe-instance-attribute --instance-id YOUR_INSTANCE_ID --attribute iamInstanceProfile

# Verify permissions
aws iam get-role-policy --role-name mitrasetu-bedrock-role --policy-name BedrockAccessPolicy

# Test Bedrock access locally on EC2
cd ~/MitraSetu/backend
node test_chat_api.js
```

### Issue: Database Connection Failed

**Symptoms:** Application can't connect to MongoDB

**Solution:**
```bash
# Verify environment variables
pm2 env 0 | grep MONGO_URI

# Test connectivity from EC2
ping mongodb-atlas-cluster
telnet mongodb-atlas-cluster.mongodb.net 27017

# Check MongoDB Atlas whitelist
# Add EC2 public IP or VPC CIDR to Atlas network access
```

---

## Deployment Checklist

- [ ] AWS CLI installed and configured
- [ ] IAM user with necessary permissions created
- [ ] Security groups configured with proper ports
- [ ] EC2 instance launched and accessible
- [ ] Node.js and dependencies installed on EC2
- [ ] Backend code deployed and running via PM2
- [ ] Nginx configured and running as reverse proxy
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Environment variables configured (MONGO_URI, JWT_SECRET, etc.)
- [ ] AWS Bedrock model access enabled
- [ ] IAM role with Bedrock permissions attached to EC2
- [ ] Bedrock connectivity tested successfully
- [ ] React frontend built for production
- [ ] S3 bucket created and configured for static hosting
- [ ] Frontend artifacts uploaded to S3
- [ ] CloudFront distribution created and configured
- [ ] SSL/TLS certificate obtained from ACM
- [ ] CloudFront distribution configured with SSL certificate
- [ ] Custom domain names configured (if using)
- [ ] CORS updated with production URLs
- [ ] CloudWatch monitoring and alarms configured
- [ ] Backend accessible via HTTPS
- [ ] Frontend accessible via HTTPS
- [ ] Socket.io connections working
- [ ] AI features tested and working
- [ ] Database operations tested
- [ ] Full end-to-end testing completed

---

## Cost Optimization

### AWS Cost Estimate (Monthly)

| Service              | Configuration     | Estimated Cost |
|----------------------|-------------------|----------------|
| EC2 (t3.medium)      | 24/7              | $30-40         |
| S3 Storage           | 1 GB              | $0.02          |
| CloudFront           | 100 GB Transfer   | $8.50          |
| MongoDB Atlas (M2)   | Shared cluster    | $9-15          |
| CloudWatch           | Alarms & Logs     | $0-5           |
| **Total**            |                   | **$50-70**     |

### Cost Reduction Tips

1. **Use Reserved Instances**: Save 30-40% by reserving EC2 instances for 1-3 years
2. **Optimize CloudFront**: Use CloudFront for all static assets
3. **Right-size EC2**: Monitor CPU usage and adjust instance type
4. **MongoDB Atlas M0**: Use free tier for development/testing
5. **Bedrock On-demand**: Only pay for actual usage
6. **S3 Lifecycle Rules**: Move old data to Glacier cheap storage

---

## Further Enhancements

### Recommended Next Steps

1. **Add Domain Names**: Purchase domains via Route 53
2. **Set Up Subdomains**: 
   - `api.yourdomain.com` → Backend
   - `yourdomain.com` → Frontend
3. **Implement Rate Limiting**: Prevent abuse and DDoS
4. **Add API Gateway**: Better API management and caching
5. **Implement Redis**: Caching layer for better performance
6. **Set Up CI/CD**: GitHub Actions or AWS CodePipeline
7. **Enable Auto Scaling**: For high-availability production setup
8. **Add Backup Systems**: Disaster recovery planning
9. **Implement Monitoring**: Datadog or detailed CloudWatch dashboards
10. **Add Load Testing**: Use tools to test system under load

---

## Support & Resources

### AWS Documentation
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)

### Project Documentation
- [Backend README](./backend/README.md)
- [AWS Bedrock Setup](./backend/AWS_SETUP.md)
- [React README](./react_frontend/.env.example)

### Need Help?
- Check AWS Health Dashboard for service status
- Review CloudWatch logs for error details
- Test endpoints via Postman collection
- Verify IAM permissions using AWS Policy Simulator

---

## Quick Reference

### Common Commands

```bash
# SSH into EC2
ssh -i "mitrasetu-key.pem" ubuntu@YOUR_EC2_IP

# Restart backend
pm2 restart mitrasetu-backend

# View logs
pm2 logs mitrasetu-backend

# Nginx status
sudo systemctl status nginx

# Rebuild and upload frontend
cd react_frontend
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'
```

### Important URLs After Deployment

- **Backend API**: `https://api.yourdomain.com` or `https://YOUR_EC2_IP`
- **Frontend**: `https://yourdomain.com` or `https://YOUR_CLOUDFront_DISTRIBUTION.cloudfront.net`
- **MongoDB Atlas**: https://cloud.mongodb.com
- **AWS Console**: https://console.aws.amazon.com
- **Bedrock Console**: https://console.aws.amazon.com/bedrock

---

## Success Criteria

Your deployment is successful when:

✅ Frontend loads in browser with no console errors
✅ User can register and login
✅ User can access dashboard
✅ PHQ-9/GAD-7 screenings work correctly
✅ AI chat responds and generates answers
✅ Circle/Community features work with real-time updates
✅ No CORS errors in browser console
✅ Database persists data correctly
✅ HTTPS works with valid SSL certificate
✅ System is performant and responsive

---

## Conclusion

Congratulations! You now have a complete guide to deploy MitraSetu on AWS. Remember to:

1. Follow each phase sequentially
2. Test thoroughly before moving to the next phase
3. Keep your credentials and keys secure
4. Monitor costs and optimize where possible
5. Regular backups and security updates
6. Plan for scaling as user base grows

Good luck with your deployment! 🚀