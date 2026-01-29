# Deployment Quick Reference Scripts

This file contains useful scripts and commands for deploying and managing MitraSetu on AWS.

## Local Development Setup

```bash
# Backend Setup
cd backend
npm install
cp .env.example .env
# Edit .env with your local MongoDB and API keys
npm start

# Frontend Setup
cd react_frontend
npm install
cp .env.example .env
# Edit .env if needed for local backend URL
npm run dev
```

## EC2 Server Setup Commands

### Initial Server Setup

```bash
# Connect to EC2
ssh -i "mitrasetu-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git build-essential

# Install PM2 globally
sudo npm install -g pm2 yarn

# Verify installations
node --version  # Should be v18.x or higher
npm --version
nginx -v
pm2 --version
```

### Deploy Backend to EC2

```bash
# Navigate to project
cd ~
git clone https://github.com/YOUR_USERNAME/MitraSetu.git
cd MitraSetu/backend

# Install dependencies
npm install

# Create environment file
nano .env
# Add your production environment variables

# Start with PM2
pm2 start index.js --name "mitrasetu-backend"

# Save PM2 configuration
pm2 save
pm2 startup
# Follow the instructions to enable startup on boot
```

### Nginx Configuration

```bash
# Remove default Nginx configuration
sudo rm -rf /etc/nginx/sites-enabled/default

# Create new configuration
sudo nano /etc/nginx/sites-available/mitrasetu-backend

# Add Nginx configuration (see backend/nginx-config.conf)

# Enable site
sudo ln -s /etc/nginx/sites-available/mitrasetu-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Frontend Deployment Commands

### Local Build

```bash
cd react_frontend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_LIVE_MODE=live
EOF

# Build for production
npm run build
```

### Deploy to S3

```bash
# Using AWS CLI (recommended)
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete

#Sync with cache control
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete --cache-control "max-age=31536000,public"

# Upload individual files
aws s3 cp dist/index.html s3://YOUR_BUCKET_NAME/ --content-type "text/html; charset=utf-8"
```

### Invalidate CloudFront Cache

```bash
# Get distribution ID
aws cloudfront list-distributions --query "DistributionList.Items[?Origins.Items[0].Id=='YOUR_S3_BUCKET'].Id" --output text

# Create invalidation for all files
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/*'

# Create invalidation for specific file
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths '/index.html'
```

## Database Management

```bash
# Connect to MongoDB (from EC2)
mongosh "mongodb+srv://user:password@cluster.mongodb.net/mitrasetu"

# Backup database
mongodump --uri="mongodb+srv://user:password@cluster.mongodb.net/mitrasetu" --out=./backup

# Restore database
mongorestore --uri="mongodb+srv://user:password@cluster.mongodb.net/mitrasetu" ./backup

# Check database stats
mongosh "mongodb+srv://user:password@cluster.mongodb.net/mitrasetu" --eval "db.stats()"
```

## Application Management

### PM2 Management

```bash
# View status
pm2 status

# View logs
pm2 logs mitrasetu-backend

# View last 100 lines
pm2 logs mitrasetu-backend --lines 100

# Monitor
pm2 monit

# Restart application
pm2 restart mitrasetu-backend

# Stop application
pm2 stop mitrasetu-backend

# Delete application
pm2 delete mitrasetu-backend

# Reload with zero downtime
pm2 reload mitrasetu-backend

# Reset count
pm2 reset mitrasetu-backend
```

### Server Resource Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux

# Check port 5000 (backend)
sudo netstat -tlnp | grep 5000

# Check Nginx status
sudo systemctl status nginx

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Security Commands

### Update SSH Configuration

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended changes:
# Port 2222 (instead of 22)
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# Restart SSH
sudo systemctl restart ssh
```

### Setup SSL with Certbot (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw enable

# View firewall status
sudo ufw status verbose
```

## Backup & Restore

### Backup Project Files

```bash
# Create backup script
cat > ~/backup-mitrasetu.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/mitrasetu-backups/$DATE
mkdir -p $BACKUP_DIR

# Backup code
cp -r ~/MitraSetu $BACKUP_DIR/

# Backup environment files
cp ~/.env $BACKUP_DIR/ 2>/dev/null || true
cp ~/MitraSetu/backend/.env $BACKUP_DIR/

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 $BACKUP_DIR/

# Backup Nginx configuration
sudo cp -r /etc/nginx $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x ~/backup-mitrasetu.sh

# Run backup
~/backup-mitrasetu.sh
```

### Automated Backup Schedule (Cron)

```bash
# Edit crontab
crontab -e

# Add backup job to run daily at 3 AM
0 3 * * * /home/ubuntu/backup-mitrasetu.sh >> /var/log/migrasetu-backup.log 2>&1
```

## Monitoring & Alerts

### Setup CloudWatch Logs

```bash
# Install CloudWatch agent
sudo apt install -y amazon-cloudwatch-agent

# Download and install
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Start the agent
sudo systemctl start amazon-cloudwatch-agent
sudo systemctl enable amazon-cloudwatch-agent

# Check status
sudo systemctl status amazon-cloudwatch-agent
```

## Deployment Troubleshooting

### Reset Application

```bash
# Stop and remove PM2 process
pm2 stop mitrasetu-backend
pm2 delete mitrasetu-backend

# Pull latest code
cd ~/MitraSetu
git pull origin main

# Reinstall dependencies
cd backend
npm install

# Restart
pm2 start index.js --name "mitrasetu-backend"
pm2 save
```

### Check Application Health

```bash
# Test backend locally
curl http://localhost:5000

# Test via Nginx
curl http://localhost

# Test with full path
curl http://localhost/api/auth/register

# Test Socket.io
curl http://localhost:5000/socket.io/
```

## AWS CLI Quick Commands

### EC2 Management

```bash
# List instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,PublicIpAddress]'

# Start instance
aws ec2 start-instances --instance-ids YOUR_INSTANCE_ID

# Stop instance
aws ec2 stop-instances --instance-ids YOUR_INSTANCE_ID

# Reboot instance
aws ec2 reboot-instances --instance-ids YOUR_INSTANCE_ID

# Get instance status
aws ec2 describe-instance-status --instance-ids YOUR_INSTANCE_ID
```

### S3 Management

```bash
# List buckets
aws s3 ls

# List bucket contents
aws s3 ls s3://YOUR_BUCKET_NAME

# Copy file to S3
aws s3 cp local-file.txt s3://YOUR_BUCKET_NAME/

# Download file from S3
aws s3 cp s3://YOUR_BUCKET_NAME/file.txt .

# Empty bucket
aws s3 rm s3://YOUR_BUCKET_NAME --recursive
```

### CloudWatch Logs

```bash
# Get logs log stream
aws logs describe-log-streams --log-group-name YOUR_LOG_GROUP

# Get latest logs
aws logs get-log-events --log-group-name YOUR_LOG_GROUP --log-stream-name YOUR_LOG_STREAM
```

## Cache Invalidation

```bash
# Create CloudFront invalidation script
cat > ~/invalidate-cloudfront.sh << 'EOF'
#!/bin/bash
DIST_ID="YOUR_CLOUDFront_DISTRIBUTION_ID"
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id $DIST_ID --paths '/*' --query 'Invalidation.Id' --output text)
echo "Invalidation created: $INVALIDATION_ID"

# Wait for invalidation to complete
aws cloudfront wait invalidation-completed --distribution-id $DIST_ID --id $INVALIDATION_ID
echo "Invalidation completed"
EOF

chmod +x ~/invalidate-cloudfront.sh
```

## Test Commands

### Test All Services

```bash
# Test backend API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Test database connection
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb+srv://USERNAME:PASSWORD@CLUSTER/mitrasetu').then(() => console.log('DB Connected')).catch(e => console.error(e))"

# Test Bedrock access
cd ~/MitraSetu/backend
node test_chat_api.js

# Test Socket.io (requires nc or telnet)
telnet localhost 5000
```

## Quick Rebuild & Deploy

### One-Command Rebuild

```bash
# Create rebuild script
cat > ~/rebuild-backend.sh << 'EOF'
#!/bin/bash
cd ~/MitraSetu
git pull origin main
cd backend
npm install
pm2 restart mitrasetu-backend
pm2 logs mitrasetu-backend --lines 20
EOF

chmod +x ~/rebuild-backend.sh

# Run rebuild
~/rebuild-backend.sh
```

## Production Checklist

Before going to production, verify:

```bash
# 1. Check environment variables
pm2 env 0

# 2. Verify database connectivity
ping mongodb-atlas-cluster.mongodb.net

# 3. Check all required services are running
pm2 list
sudo systemctl status nginx
sudo systemctl status amazon-cloudwatch-agent

# 4. Verify SSL certificate
sudo certbot certificates

# 5. Check firewall
sudo ufw status

# 6. Monitor system resources
htop

# 7. Test critical endpoints
curl -I https://api.yourdomain.com
curl -I https://yourdomain.com

# 8. Check recent logs
pm2 logs mitrasetu-backend --lines 50 --nostream
sudo tail -50 /var/log/nginx/error.log
```

## Useful Browser DevTools

### Network Tab Tests

1. **Frontend Loading**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Refresh page
   - Check for 404 errors
   - Verify all assets load (200 status)

2. **API Calls**
   - Filter by "XHR" or "Fetch"
   - Check request/response for API calls
   - Verify proper status codes
   - Check response payload

3. **WebSocket**
   - Filter by "WS"
   - Verify WebSocket connection
   - Check for connection errors

4. **Console Errors**
   - Check Console tab for JavaScript errors
   - Look for CORS errors
   - Verify no uncaught exceptions

## Cost Monitoring

```bash
# Check current month cost estimate
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d "$(date +%Y-%m-01)" +%Y-%m-%dT00:00:00Z),End=$(date -u +%Y-%m-%dT00:00:00Z) \
  --metric "BlendedCost" \
  --granularity MONTHLY \
  --group-by Type=DIMENSION,Key=SERVICE

# Set up budget alarm (through AWS Console)
# CloudWatch → Billing → Budgets → Create budget
```

## Performance Testing

```bash
# Install Apache Bench for load testing
sudo apt install -y apache2-utils

# Test backend performance
ab -n 1000 -c 10 http://localhost:5000/

# Test specific endpoint
ab -n 100 -c 5 -p test.json -T application/json http://localhost:5000/api/auth/register
```

## Security Scanning

```bash
# Install security tools
sudo apt install -y nmap

# Scan open ports
nmap -sV localhost

# Check for common vulnerabilities
sudo ufw status verbose
```

## Log Rotation Setup

```bash
# Setup logrotate for PM2 logs
sudo nano /etc/logrotate.d/mitrasetu

# Add:
/home/ubuntu/.pm2/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 ubuntu ubuntu
    size 100M
}
```

## Quick Emergency Commands

```bash
# Emergency stop of backend
pm2 stop mitrasetu-backend

# Emergency stop of everything
pm2 stop all

# Clear all PM2 logs
pm2 flush

# Emergency reboot server
sudo reboot

# Shutdown server
sudo shutdown -h now
```

---

## Tips & Best Practices

1. **Always test changes in staging first**
2. **Keep backups before major updates**
3. **Monitor CloudWatch dashboards regularly**
4. **Use git branches for features**
5. **Review Nginx/PM2 logs daily during initial deployment**
6. **Set up cost alerts in AWS Billing**
7. **Keep your key(.pem) file secure - never commit to git**
8. **Use strong passwords for all services**
9. **Enable automatic backups**
10. **Document any custom configurations**

---

Remember to replace placeholder values (YOUR_DATABASE_URI, YOUR_BUCKET_NAME, etc.) with your actual values before running these commands!