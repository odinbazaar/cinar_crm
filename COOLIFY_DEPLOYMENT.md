# Çınar CRM - Coolify Deployment Guide

## 🎯 Overview
This guide covers deploying the Çınar CRM application using Coolify, a self-hosted platform-as-a-service.

## 📋 Prerequisites
- Coolify instance running
- Supabase project created: `cinar-crm` (ID: lalnmyfkrveepkagnhh)
- Domain names configured:
  - Frontend: `cınarcrm.online` or your Coolify domain
  - Backend: `backend.cınarcrm.online` or your Coolify domain

## 🔑 Environment Variables

### Frontend Environment Variables (Coolify)

```bash
# API Configuration
VITE_API_URL=https://backend.cınarcrm.online/api

# Supabase Configuration
VITE_SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo

# Company Information
VITE_COMPANY_NAME=İZMİR AÇIK HAVA REKLAM SAN. VE TİC. LTD. ŞTİ.
VITE_COMPANY_ADDRESS=MANAS BULVARI ADALET MAHALLESİ NO:47 KAT:28 FOLKART TOWERS BAYRAKLI İZMİR
VITE_COMPANY_PHONE=0232 431 0 75
VITE_COMPANY_FAX=0232 431 00 73
VITE_COMPANY_TAX_OFFICE=KARŞIYAKA V.D.
VITE_COMPANY_TAX_NO=6490546546
```

### Backend Environment Variables (Coolify)

```bash
# Supabase Configuration
SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNjg1NzksImV4cCI6MjA4Mzk0NDU3OX0.RDluoe9zAPvf-2o4S0ubRlZK_yhV7ZVMDJv3XFopjyo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbHRteXNma3lwcGtxeWtnZ21oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM2ODU3OSwiZXhwIjoyMDgzOTQ0NTc5fQ.i0UQYvKhgTUhrpIoPo-gvRjqRQl7tel57sklFPyhVIU

# JWT Configuration
JWT_SECRET=cinar-crm-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS (Frontend URL)
FRONTEND_URL=https://cınarcrm.online

# Mail Configuration (Reservations)
MAIL_HOST=smtp.yandex.com.tr
MAIL_PORT=465
MAIL_USER=Rezervasyon@izmiracikhavareklam.com
MAIL_PASS=Reziar.075
MAIL_FROM="Çınar CRM" <Rezervasyon@izmiracikhavareklam.com>

# Sales Mail Configuration
ALI_MAIL_PASS=Reziar.075

# Database (Not used - using Supabase)
# DATABASE_URL is optional, Supabase is the primary database
```

## 🚀 Deployment Steps

### 1. Create Projects in Coolify

#### Frontend Project
1. Go to Coolify Dashboard → Projects
2. Create a new project for the frontend
3. Select Git repository or local folder
4. Set build command: `npm install && npm run build`
5. Set output directory: `dist`
6. Configure environment variables from the Frontend section above

#### Backend Project
1. Create a separate project for the backend
2. Select Git repository or local folder
3. Set build command: `npm install && npm run build`
4. Set start command: `node dist/main.js`
5. Configure environment variables from the Backend section above
6. Set port: `3000`

### 2. Configure in Coolify

#### Frontend Configuration
- **Port**: Auto (static files)
- **SSL**: Enable automatic SSL
- **Domain**: `cınarcrm.online`
- **Build Pack**: Static/Node.js

#### Backend Configuration
- **Port**: `3000`
- **SSL**: Enable automatic SSL
- **Domain**: `backend.cınarcrm.online`
- **Health Check**: `/api/health` or `/api`
- **Restart Policy**: Always

### 3. Environment Variable Setup in Coolify

For each project:
1. Navigate to **Configuration → Environment**
2. Click **"Danger Zone"** if needed to access service secrets
3. Add each environment variable:
   - Click **"Is Literal?"** checkbox if it shouldn't be treated as a regex
   - Mark sensitive values (keys, passwords) as **"Available at Runtime"** and check **"Is Multiline?"** if needed
4. Click **"Update"** after adding all variables

### 4. Deploy

1. Click **"Restart project"** for both frontend and backend
2. Monitor the build logs
3. Wait for successful deployment

### 5. Verify Deployment

- Frontend: Visit `https://cınarcrm.online`
- Backend API: Visit `https://backend.cınarcrm.online/api`
- Test login with credentials from DEPLOYMENT.md

## 🔄 Updates

### Frontend Update
1. Push changes to Git (if using Git integration)
2. Or click "Redeploy" in Coolify dashboard
3. Coolify will automatically rebuild and deploy

### Backend Update
1. Push changes to Git
2. Or click "Redeploy" in Coolify dashboard
3. Backend will restart automatically

## 📝 Pre-Deployment Checklist

### Data Cleanup
Run the data cleanup script to remove test data:

```bash
cd backend
npm run ts-node src/prepare-live.ts
```

This will clear:
- ✅ Proposals and proposal items
- ✅ Communications and contacts
- ✅ Bookings
- ✅ Tasks and task assignments
- ✅ Projects
- ✅ Notifications
- ✅ Customer requests
- ✅ Clients

**Preserved data:**
- ✅ Users (all company users remain)
- ✅ Inventory items (all locations remain)

### Environment Variables Verification

**Frontend (.env.production):**
- ✅ VITE_API_URL points to production backend
- ✅ VITE_SUPABASE_URL is correct
- ✅ VITE_SUPABASE_ANON_KEY is set
- ✅ Company information is accurate

**Backend (.env.production):**
- ✅ SUPABASE_URL is correct
- ✅ SUPABASE_ANON_KEY is set
- ✅ SUPABASE_SERVICE_ROLE_KEY is set (for admin operations)
- ✅ JWT_SECRET is strong and unique
- ✅ FRONTEND_URL matches your frontend domain
- ✅ Mail settings are correct
- ✅ NODE_ENV=production

### Build Verification

```bash
# Test frontend build
cd frontend
npm run build

# Test backend build
cd backend
npm run build
```

## 🔒 Security Notes

1. **Service Role Key**: Only use in backend, never expose in frontend
2. **JWT Secret**: Change to a strong, unique value in production
3. **Mail Passwords**: Store securely, consider using environment secrets
4. **CORS**: Ensure FRONTEND_URL matches exactly

## 🆘 Troubleshooting

### Frontend Issues
- **404 errors**: Check if static files are served correctly
- **API errors**: Verify VITE_API_URL points to correct backend
- **Blank page**: Check browser console for errors

### Backend Issues
- **Port conflicts**: Ensure port 3000 is available
- **Database errors**: Verify Supabase credentials
- **CORS errors**: Check FRONTEND_URL setting

### Coolify Issues
- **Build fails**: Check build logs in Coolify dashboard
- **Environment variables not working**: Ensure they're marked as "Available at Runtime"
- **SSL issues**: Verify domain DNS is pointing to Coolify server

## 👥 User Accounts

Default user accounts (passwords: `Cinarcrm123!`):

| E-posta | Rol |
|---------|-----|
| ali@izmiracikhavareklam.com | Admin |
| ayse@izmiracikhavareklam.com | Employee |
| muhasebe@izmiracikhavareklam.com | Manager |
| info@izmiracikhavareklam.com | Admin |
| goknil@izmiracikhavareklam.com | Employee |
| simge@izmiracikhavareklam.com | Employee |
| can@izmiracikhavareklam.com | Employee |
| cihangir@izmiracikhavareklam.com | Employee |

## 📞 Support

For deployment issues:
1. Check Coolify build logs
2. Verify Supabase connection
3. Review browser console for frontend errors
4. Check backend logs in Coolify

