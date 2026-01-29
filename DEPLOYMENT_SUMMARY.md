# MitraSetu Deployment Guide

This guide provides complete deployment instructions for the MitraSetu application, including local development with Docker and production deployment to AWS.

## 📚 Deployment Documents

The following documents are available to help you deploy MitraSetu:

| Document | Description |
|----------|-------------|
| [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) | Complete step-by-step AWS deployment guide |
| [DEPLOYMENT_SCRIPTS.md](./DEPLOYMENT_SCRIPTS.md) | Quick reference scripts and commands |
| [backend/AWS_SETUP.md](./backend/AWS_SETUP.md) | AWS Bedrock configuration for AI features |
| [backend/README.md](./backend/README.md) | Backend setup and API documentation |
| [backend/nginx-config.conf](./backend/nginx-config.conf) | Nginx configuration reference |

---

## 🚀 Quick Start Options

### Option 1: Local Development with Docker (Recommended for Development)

Fastest way to get started locally with all services running in containers.

#### Prerequisites
- Docker Desktop installed
- 4GB+ RAM available for Docker
- AWS credentials (optional, for AI features)

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/MitraSetu.git
   cd MitraSetu
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env and add your AWS credentials if you want AI features
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB Express: http://localhost:8081
   - Backend API Endpoints: http://localhost:5000/api

5. **Stop services**
   ```bash
   docker-compose down
   ```

**✅ Pros:**
- Fast setup (5 minutes)
- Consistent development environment
- All dependencies bundled
- Perfect for testing

**❌ Cons:**
- Requires Docker installed
- Not suitable for production

---

### Option 2: Traditional EC2 Deployment (Recommended for Production)

Deploy backend on EC2 and frontend on S3 with CloudFront for global distribution.

#### Prerequisites
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Basic knowledge of AWS services

#### Time Estimate: 2-4 hours

#### Key Steps

1. **Setup AWS Infrastructure** (30 min)
   - Create IAM user with permissions
   - Configure security groups
   - Launch EC2 instance

2. **Deploy Backend** (1 hour)
   - Connect to EC2 instance
   - Install Node.js, PM2, Nginx
   - Deploy backend code
   - Configure environment variables

3. **Setup Database** (15 min)
   - Create MongoDB Atlas cluster
   - Configure database user
   - Update backend environment

4. **Deploy Frontend** (30 min)
   - Build React frontend
   - Create S3 bucket
   - Upload build artifacts
   - Setup CloudFront distribution

5. **Configure AWS Services** (30 min)
   - Enable AWS Bedrock model access
   - Configure IAM permissions
   - Setup SSL certificates
   - Configure DNS (optional)

#### Cost Estimate

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| EC2 (t3.medium) | 24/7 | $30-40 |
| S3 | 1 GB storage | $0.02 |
| CloudFront | 100 GB transfer | $8.50 |
| MongoDB Atlas (M2) | Shared cluster | $9-15 |
| **Total** | | **~$50-70** |

**📖 Detailed Guide:** See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

**✅ Pros:**
- Full control over infrastructure
- Scalable and production-ready
- Cost-effective for production
- Professional setup

**❌ Cons:**
- Longer setup time
- Requires AWS knowledge
- Ongoing maintenance needed

---

### Option 3: Containerized Deployment (Modern Approach)

Deploy using Docker containers on ECS, EKS, or EC2 with Docker Compose.

#### Prerequisites
- Docker knowledge
- AWS ECS or EKS experience (recommended)
- Container registry (ECR)

#### Key Steps

1. **Build Docker Images**
   ```bash
   # Backend
   cd backend
   docker build -t mitrasetu-backend:latest .
   
   # Frontend
   cd ../react_frontend
   docker build -t mitrasetu-frontend:latest .
   ```

2. **Push to ECR** (Elastic Container Registry)
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
   
   # Tag and push
   docker tag mitrasetu-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mitrasetu-backend:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/mitrasetu-backend:latest
   ```

3. **Deploy to ECS/EKS**
   - Create ECS task definitions
   - Setup load balancer
   - Configure auto-scaling
   - Setup CI/CD pipeline

**📖 Detailed Guide:** See [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for container deployment section

**✅ Pros:**
- Modern, cloud-native approach
- Easy scaling with auto-scaling
- Consistent deployment
- Easy rollback

**❌ Cons:**
- More complex initial setup
- Requires Docker/Kubernetes knowledge
- Learning curve

---

## 🔧 Environment Variables

### Backend Environment Variables

Create a `.env` file in the [`backend/`](./backend/) directory:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/mitrasetu

# Security
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key_here

# AWS Bedrock (for AI features)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
```

### Frontend Environment Variables

Create a `.env.production` file in the [`react_frontend/`](./react_frontend/) directory:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_LIVE_MODE=live
```

---

## 📦 Project Structure

```
MitraSetu/
├── backend/
│   ├── Dockerfile              # Backend container configuration
│   ├── .dockerignore           # Docker build exclusions
│   ├── nginx-config.conf       # Nginx configuration reference
│   ├── index.js                # Backend entry point
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB models
│   ├── routes/                 # API routes
│   └── utils/                  # Utility functions
├── react_frontend/
│   ├── Dockerfile              # Frontend container configuration
│   ├── .dockerignore           # Docker build exclusions
│   ├── nginx.conf              # Nginx configuration for container
│   ├── app/                    # Next.js app router
│   ├── src/                    # Source code
│   └── components/             # React components
├── frontend/                   # Flutter mobile app
├── docker-compose.yml          # Local development composition
├── AWS_DEPLOYMENT_GUIDE.md     # Comprehensive AWS guide
└── DEPLOYMENT_SUMMARY.md       # This file
```

---

## 🧪 Testing Your Deployment

### After Deployment, Verify:

#### Backend API
```bash
# Health check
curl https://api.yourdomain.com/health

# Test authentication
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

#### Frontend
- Open your domain in browser
- Check for any console errors
- Test user registration/login
- Test PHQ-9/GAD-7 screenings
- Test AI chat features
- Test real-time circles

#### Database
```bash
# MongoDB Atlas console
# Verify connection
# Check data persistence
```

#### AWS Bedrock
```bash
# Check Bedrock model access enabled
# Test AI chat in application
# Verify responses are generated
```

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] AWS account with billing enabled
- [ ] IAM user with appropriate permissions created
- [ ] AWS CLI installed and configured
- [ ] Domain name purchased (optional but recommended)
- [ ] Read AWS_DEPLOYMENT_GUIDE.md thoroughly

### Backend Deployment (EC2)
- [ ] EC2 instance launched and accessible
- [ ] Node.js and dependencies installed
- [ ] Backend code deployed via Git
- [ ] PM2 configured and running
- [ ] Nginx configured as reverse proxy
- [ ] Security group ports opened correctly
- [ ] Environment variables configured

### Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with appropriate permissions
- [ ] Network access configured (IP whitelist)
- [ ] Connection string tested

### AWS Bedrock Setup
- [ ] Bedrock model access enabled (Amazon Nova Pro)
- [ ] IAM permissions configured
- [ ] Bedrock role attached to EC2 instance
- [ ] Bedrock connectivity tested

### Frontend Deployment (S3 + CloudFront)
- [ ] React frontend built for production
- [ ] S3 bucket created and configured
- [ ] Build artifacts uploaded to S3
- [ ] CloudFront distribution created
- [ ] SSL certificate obtained via ACM
- [ ] Custom domain configured (if applicable)
- [ ] CloudFront cache invalidation performed
- [ ] CORS configured correctly

### Final Testing
- [ ] Frontend loads in browser
- [ ] API endpoints accessible
- [ ] User registration/login works
- [ ] Screensings functional
- [ ] AI chat features working
- [ ] Real-time circles working
- [ ] Database persists data
- [ ] No CORS errors in browser
- [ ] HTTPS working with valid SSL
- [ ] Application performance verified

### Monitoring & Maintenance
- [ ] CloudWatch metrics configured
- [ ] CloudWatch alerts set up
- [ ] Cost alerts configured in AWS Billing
- [ ] Backup strategy implemented
- [ ] Log rotation configured
- [ ] SSL certificate auto-renewal setup

---

## 🔐 Security Best Practices

1. **Never commit sensitive files to version control**
   - `.env` files
   - AWS keys
   - Database credentials
   - SSL certificates

2. **Use IAM roles instead of access keys when possible**

3. **Enable MFA on AWS accounts**

4. **Regularly rotate credentials and secrets**

5. **Keep dependencies updated**
   ```bash
   npm audit fix
   ```

6. **Monitor CloudWatch for anomalies**

7. **Set up AWS Budget alerts to prevent unexpected costs**

8. **Use different environments:**
   - Development
   - Staging
   - Production

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Backend not starting | Check PM2 logs: `pm2 logs` |
| CORS errors | Verify CORS origins in backend |
| WebSocket not connecting | Check Socket.io connection URL |
| Database connection failed | Verify MongoDB URI and network access |
| AI features not working | Check Bedrock credentials and model access |
| Frontend not loading | Check CloudFront distribution status |
| SSL certificate error | Verify ACM certificate and DNS |

For detailed troubleshooting, see [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) → Troubleshooting section.

---

## 📈 Scaling Considerations

### When to Scale

1. **CPU Usage > 70%** consistently → Consider upgrading EC2 instance type
2. **Response time > 2 seconds** → Setup load balancer with multiple instances
3. **Database queries slow** → Optimize queries or upgrade MongoDB tier
4. **Cost increasing significantly** → Review usage and optimize

### Scaling Options

#### Horizontal Scaling
- **Elastic Load Balancer (ELB)**: Distribute traffic across multiple EC2 instances
- **Auto Scaling Groups**: Automatically add instances based on metrics
- **ECS/EKS**: Deploy containers across multiple nodes

#### Vertical Scaling
- **Upgrade EC2 instance**: Use larger instance types (t3.medium → m5.large)
- **MongoDB Atlas**: Upgrade cluster tier (M2 → M10+)

#### Caching
- **Redis**: Cache frequently accessed data
- **CloudFront**: CDN for static assets

---

## 🔄 CI/CD Pipeline (Optional)

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # SSH into EC2 and deploy
          # Pull latest code, install dependencies, restart PM2
          
      - name: Deploy Frontend
        run: |
          # Build frontend
          # Upload to S3
          # Invalidate CloudFront cache
```

---

## 📞 Support

### Resources
- [AWS Documentation](https://docs.aws.amazon.com/)
- [MongoDB Atlas Documentation](https://docs.mongodb.com/)
- [AWS Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/)

### Getting Help
1. Check the detailed guide: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
2. Review troubleshooting section
3. Check AWS CloudWatch logs
4. Review deployment scripts: [DEPLOYMENT_SCRIPTS.md](./DEPLOYMENT_SCRIPTS.md)

---

## 🎯 Next Steps After Deployment

### Week 1
- Monitor performance
- Test all features thoroughly
- Set up monitoring dashboards
- Configure cost alerts

### Week 2-4
- Gather user feedback
- Fix any bugs found
- Optimize performance
- Set up staging environment

### Month 1+
- Implement CI/CD pipeline
- Set up automated backups
- Add more monitoring
- Plan for scaling

---

## 📝 Summary

### Recommended Deployment Path

**For Development:**
- Use Option 1 (Docker Compose)
- Fast setup, all services bundled
- Perfect for testing and development

**For Production:**
- Start with Option 2 (Traditional EC2)
- Proven, reliable, cost-effective
- Scale to Option 3 (ECS/EKS) as needed

### Time Estimates

| Deployment Option | Initial Setup | Learning Time |
|-------------------|---------------|---------------|
| Docker Compose | 5-10 min | 30 min |
| EC2 + S3 | 2-4 hours | 4-6 hours |
| ECS/EKS | 6-8 hours | 1-2 days |

### Total Estimated Time to Production

**If you're new to AWS:** 1-2 days
**If you have AWS experience:** 4-8 hours

---

## 🎉 Congratulations!

You now have everything you need to deploy MitraSetu to AWS!

**Remember:**
- Start with Docker Compose for testing
- Follow the detailed AWS guide for production
- Keep credentials secure
- Monitor costs and performance
- Backup regularly

Good luck with your deployment! 🚀

---

**Need Help?**
- Review the comprehensive [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- Check quick reference commands in [DEPLOYMENT_SCRIPTS.md](./DEPLOYMENT_SCRIPTS.md)
- Verify AWS Bedrock setup in [backend/AWS_SETUP.md](./backend/AWS_SETUP.md)