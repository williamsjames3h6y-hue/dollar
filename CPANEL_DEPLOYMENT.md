# cPanel Deployment Guide - MySQL Data Annotation Platform

## Overview
Your application has been converted to use MySQL with a Node.js/Express backend. This guide will help you deploy it to cPanel.

---

## Part 1: Database Setup

### Step 1: Import MySQL Schema

1. **Login to cPanel**
2. **Go to phpMyAdmin**
3. **Select your database:** `admsoayacucho_56`
4. **Click the "Import" tab**
5. **Upload and execute:** `server/schema.sql`
6. **Verify tables were created:** You should see these tables:
   - users
   - user_profiles
   - wallets
   - products
   - brand_identification_tasks
   - earnings
   - payment_methods
   - payment_gateways

### Step 2: Verify Database Credentials

Make sure these credentials are correct in `server/.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=admsoayacucho_56
DB_PASSWORD=12ma12MA@#
DB_NAME=admsoayacucho_56
```

### Step 3: Create Admin Account

The schema includes a default admin account:
- **Email:** `admin@dataannotation.com`
- **Password:** `admin123`

**IMPORTANT:** Change this password immediately after first login!

---

## Part 2: Backend Deployment (Node.js API)

### Option A: Using Node.js App in cPanel (Recommended)

1. **Go to cPanel → "Setup Node.js App"**

2. **Create New Application:**
   - Node.js version: `18.x` or higher
   - Application mode: `Production`
   - Application root: `/home/yourusername/public_html/server`
   - Application URL: `yourdomain.com/api` or use a subdomain like `api.yourdomain.com`
   - Application startup file: `server.js`

3. **Upload Backend Files:**
   - Upload the entire `server/` folder to the application root
   - Make sure `.env` file is uploaded with correct credentials

4. **Install Dependencies:**
   - In cPanel Node.js App interface, click "Run NPM Install"
   - Or via SSH: `cd /home/yourusername/public_html/server && npm install`

5. **Configure Environment Variables in cPanel:**
   - Set `FRONTEND_URL` to your actual domain: `https://yourdomain.com`
   - Generate a secure JWT_SECRET: Use a random 64-character string
   - Update `PORT` if needed (default: 3001)

6. **Start the Application:**
   - Click "Start App" in cPanel interface
   - Verify it's running by visiting: `https://yourdomain.com/api/health`
   - You should see: `{"status":"ok","timestamp":"..."}`

### Option B: Using Passenger (Alternative)

If your cPanel uses Passenger:

1. Create a `.htaccess` file in your backend directory:
```apache
PassengerEnabled On
PassengerAppType node
PassengerStartupFile server.js
PassengerAppRoot /home/yourusername/public_html/server
```

2. Restart the app using cPanel's restart feature

---

## Part 3: Frontend Deployment

### Step 1: Update API URL

Edit `.env.production` before building:
```
VITE_API_URL=https://yourdomain.com/api
```

Or if using subdomain:
```
VITE_API_URL=https://api.yourdomain.com
```

### Step 2: Build Frontend

On your local machine or via SSH:
```bash
npm install
npm run build
```

This creates a `dist/` folder with production files.

### Step 3: Upload to cPanel

1. **Go to cPanel File Manager**
2. **Navigate to:** `/public_html/` (or your domain's root folder)
3. **Upload all files from `dist/` folder**
4. **Also upload the `public/` folder** (contains product images)

### Step 4: Configure .htaccess for React Router

Create/edit `.htaccess` in your `public_html` folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite API requests
  RewriteCond %{REQUEST_URI} ^/api [NC]
  RewriteRule ^ - [L]

  # Rewrite everything else to index.html for React Router
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## Part 4: Configure CORS and Security

### Backend CORS Configuration

The backend is already configured to accept requests from your frontend. Make sure `server/.env` has:
```
FRONTEND_URL=https://yourdomain.com
```

### Security Checklist

1. **Change default admin password** immediately after first login
2. **Generate a strong JWT_SECRET** (64+ random characters)
3. **Use HTTPS** (enable SSL in cPanel)
4. **Keep database credentials secure** (never commit .env files)
5. **Set proper file permissions:**
   - Files: 644
   - Directories: 755
   - `.env`: 600 (readable only by owner)

---

## Part 5: Testing

### Test Backend API

Visit these URLs to verify backend is working:

1. **Health Check:**
   ```
   https://yourdomain.com/api/health
   ```
   Expected: `{"status":"ok","timestamp":"..."}`

2. **Test Login (using Postman or curl):**
   ```bash
   curl -X POST https://yourdomain.com/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@dataannotation.com","password":"admin123"}'
   ```
   Expected: JWT token and user object

### Test Frontend

1. Visit `https://yourdomain.com`
2. Try logging in with admin credentials
3. Check browser console for any errors
4. Test user registration
5. Test task assignment and completion

---

## Part 6: Troubleshooting

### Backend Not Starting

1. **Check Node.js logs in cPanel**
2. **Common issues:**
   - Wrong database credentials
   - Missing npm packages (run `npm install`)
   - Port already in use
   - MySQL connection refused

### Database Connection Issues

```bash
# Test MySQL connection via SSH
mysql -u admsoayacucho_56 -p admsoayacucho_56
```

### Frontend Can't Connect to Backend

1. **Check CORS settings** in `server/server.js`
2. **Verify API_URL** in `.env.production`
3. **Check browser console** for CORS errors
4. **Ensure backend is running** (visit `/api/health`)

### 500 Internal Server Error

1. **Check backend logs** in cPanel
2. **Check database connection** in phpMyAdmin
3. **Verify all environment variables** are set correctly

---

## Part 7: File Structure on cPanel

```
/home/yourusername/
├── public_html/                  # Frontend (React build)
│   ├── index.html
│   ├── assets/
│   ├── public/
│   │   ├── products/
│   │   └── *.jpg
│   └── .htaccess
│
└── server/                       # Backend (Node.js API)
    ├── server.js
    ├── package.json
    ├── .env
    ├── config/
    │   └── database.js
    ├── routes/
    │   ├── auth.js
    │   ├── tasks.js
    │   └── admin.js
    ├── middleware/
    │   └── auth.js
    └── node_modules/
```

---

## Part 8: Maintenance

### Updating the Application

**Backend Updates:**
1. Upload new files to `server/` folder
2. Restart Node.js app in cPanel
3. Check logs for errors

**Frontend Updates:**
1. Build locally: `npm run build`
2. Upload new `dist/` files to `public_html/`
3. Clear browser cache

### Database Backups

1. **Regular Backups:** Use cPanel backup feature
2. **Manual Export:** phpMyAdmin → Export tab
3. **Store backups securely** off-server

### Monitoring

1. **Check API health endpoint** regularly
2. **Monitor error logs** in cPanel
3. **Review database size** in phpMyAdmin
4. **Check disk space** usage

---

## Part 9: Default Accounts

### Admin Account
- **Email:** admin@dataannotation.com
- **Password:** admin123 (CHANGE THIS!)
- **Access:** Full admin panel

### Sample Products
The database includes 5 sample products for testing task generation.

---

## Support

If you encounter issues:

1. Check backend logs in cPanel
2. Check browser console for frontend errors
3. Verify database connection in phpMyAdmin
4. Test API endpoints using curl or Postman
5. Review this deployment guide step-by-step

---

## Quick Reference

**Database:** admsoayacucho_56
**DB User:** admsoayacucho_56
**Backend Port:** 3001
**API Base URL:** https://yourdomain.com/api
**Admin Panel:** Login as admin to access

---

**Last Updated:** February 20, 2026
**Version:** 1.0 - MySQL Migration
