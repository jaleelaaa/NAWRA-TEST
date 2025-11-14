# 🚀 NAWRA Library Management System - Deployment Guide

Complete guide for deploying NAWRA to production.

---

## 📋 Prerequisites

### Required Services

1. **Supabase Account** (Database + Storage)
   - Sign up at https://supabase.com
   - Create a new project
   - Note down your credentials

2. **Resend Account** (Email Notifications)
   - Sign up at https://resend.com
   - Create API key
   - Verify your domain (optional but recommended)

3. **Hosting** (Choose one):
   - Docker + VPS (Recommended)
   - Vercel (Frontend) + Render (Backend)
   - Railway
   - DigitalOcean App Platform

### System Requirements

- Docker & Docker Compose 20.10+ (for Docker deployment)
- OR Node.js 20+ and Python 3.11+ (for manual deployment)

---

## 🐳 Option 1: Docker Deployment (Recommended)

### Step 1: Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/nawra-lms.git
cd nawra-lms

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Step 2: Set Up Supabase

1. **Create Database Tables**

```bash
# Go to your Supabase dashboard
# SQL Editor → New Query
# Copy and run each migration file in order:

1. backend/sql/001_initial_schema.sql
2. backend/migrations/002_create_books_tables.sql
3. backend/migrations/003_create_circulation_tables.sql
4. backend/migrations/create_user_settings_table.sql
```

2. **Create Storage Bucket**

```bash
# In Supabase Dashboard:
# Storage → Create new bucket
# Name: library-files
# Public: Yes (for book covers)
# File size limit: 10MB
# Allowed MIME types: image/*, application/pdf
```

### Step 3: Configure Environment Variables

Edit `.env` file:

```bash
# Supabase (from https://supabase.com/dashboard/project/_/settings/api)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxx...
SUPABASE_SERVICE_KEY=eyJxxxxx...
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres

# Security (Generate with: openssl rand -hex 32)
SECRET_KEY=your-generated-secret-key-here

# Email (from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Optional: Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

### Step 4: Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Verify Deployment

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000

# Check API
curl http://localhost:8000/api/v1/users/stats
```

### Step 6: Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Admin Dashboard:** http://localhost:3000/ar/admin/dashboard

**Default Login:**
- Email: `admin@ministry.om`
- Password: `Admin@123`

⚠️ **IMPORTANT:** Change default passwords immediately!

---

## 🌐 Option 2: Cloud Deployment

### Vercel (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Create New Web Service**
   - Connect GitHub repository
   - Select `backend` directory
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables**
   ```
   ENVIRONMENT=production
   DEBUG=False
   SUPABASE_URL=...
   SUPABASE_KEY=...
   SECRET_KEY=...
   RESEND_API_KEY=...
   EMAIL_FROM=...
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **Note Backend URL**
   - Example: `https://nawra-api.onrender.com`

#### Deploy Frontend to Vercel

1. **Import Project**
   - Connect GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: Next.js

2. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://nawra-api.onrender.com/api/v1
   NEXT_PUBLIC_APP_NAME=NAWRA
   NEXT_PUBLIC_DEFAULT_LOCALE=ar
   ```

3. **Deploy**
   - Click Deploy
   - Wait for build to complete

---

## 🔧 Option 3: Manual Deployment (VPS)

### Prerequisites on Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3-pip nodejs npm postgresql nginx certbot

# Install PM2 for process management
sudo npm install -g pm2
```

### Backend Deployment

```bash
# Create app directory
sudo mkdir -p /var/www/nawra-backend
cd /var/www/nawra-backend

# Clone code
git clone [your-repo] .

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Set up environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your values

# Start with PM2
cd backend
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name nawra-backend
pm2 save
pm2 startup
```

### Frontend Deployment

```bash
# Create app directory
sudo mkdir -p /var/www/nawra-frontend
cd /var/www/nawra-frontend

# Clone code
git clone [your-repo] .

# Install dependencies
cd frontend
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "nawra-frontend" -- start
pm2 save
```

### Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/nawra
```

```nginx
# Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/nawra /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 🔒 Security Checklist

### Before Going Live

- [ ] Change all default passwords
- [ ] Generate strong SECRET_KEY: `openssl rand -hex 32`
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly (remove localhost from allowed origins)
- [ ] Set DEBUG=False in production
- [ ] Enable Supabase RLS (Row Level Security)
- [ ] Set up database backups
- [ ] Configure firewall (UFW/iptables)
- [ ] Add rate limiting
- [ ] Enable audit logging
- [ ] Review Supabase security settings

### Recommended Security Headers

Add to Nginx:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/health

# Check logs
docker-compose logs -f backend
# OR
pm2 logs nawra-backend
```

### Database Backups

```bash
# Supabase automatic backups (check dashboard)
# OR manual backup:

pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Update Deployment

```bash
# Docker
git pull
docker-compose down
docker-compose build
docker-compose up -d

# PM2
git pull
cd backend && pip install -r requirements.txt
cd ../frontend && npm install && npm run build
pm2 restart all
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check DATABASE_URL format
# Should be: postgresql://user:password@host:5432/database
# Verify credentials in Supabase dashboard
```

**2. CORS Errors**
```bash
# Update CORS_ORIGINS in backend .env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**3. Email Not Sending**
```bash
# Verify Resend API key
# Check domain verification in Resend dashboard
# Test email endpoint: curl -X POST https://api.yourdomain.com/api/v1/test-email
```

**4. File Upload Fails**
```bash
# Verify Supabase storage bucket exists
# Check bucket is public
# Verify SUPABASE_SERVICE_KEY is set correctly
```

**5. Frontend Can't Connect to Backend**
```bash
# Check NEXT_PUBLIC_API_URL in frontend .env.local
# Should match your backend URL
# Verify backend is running: curl https://api.yourdomain.com/health
```

### Debug Mode

```bash
# Enable debug mode temporarily
# Backend .env:
DEBUG=True

# Frontend .env.local:
NEXT_PUBLIC_ENABLE_DEBUG=true

# View detailed logs
docker-compose logs -f backend
```

---

## 📈 Performance Optimization

### Production Optimizations

1. **Enable Redis Caching**
   ```bash
   # Already included in docker-compose.yml
   # Or use Upstash Redis (serverless)
   ```

2. **Database Indexing**
   - All indexes already created in migrations
   - Monitor slow queries in Supabase dashboard

3. **CDN for Static Assets**
   - Use Vercel CDN (automatic)
   - OR Cloudflare for custom domain

4. **Image Optimization**
   - Already handled by file upload service
   - Uses Pillow for compression

---

## 🌍 Multi-Region Deployment

For high availability:

1. Deploy to multiple regions
2. Use Supabase read replicas
3. Configure load balancer (Cloudflare/AWS)
4. Enable geo-routing

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Check GitHub Issues
4. Contact support: support@nawra.om

---

## ✅ Post-Deployment Checklist

- [ ] All services running
- [ ] Database migrations applied
- [ ] Storage bucket created
- [ ] Email notifications working
- [ ] SSL certificates installed
- [ ] Default passwords changed
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained

---

**🎉 Congratulations! Your NAWRA Library Management System is now deployed!**

Access your system at: https://yourdomain.com

Login with your admin credentials and start managing your library!
