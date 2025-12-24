# Çınar CRM Backend Setup Guide

## Quick Start

### 1. Environment Configuration

Create a `.env` file in the backend directory with the following content:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cinar_crm"

# Supabase (Use your existing credentials)
SUPABASE_URL=https://slanoowprgrcksfqrgak.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODU2NzYsImV4cCI6MjA4MDM2MTY3Nn0.mbm0PFKd-dkIJmMlu9-DLlIvghDzKsLudwtOR6vT28U
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsYW5vb3dwcmdyY2tzZnFyZ2FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDc4NTY3NiwiZXhwIjoyMDgwMzYxNjc2fQ.PxQmPGzKXVGtJdKJmODnFRhMnJXEJQKLvRRTGiQQmxs

# JWT
JWT_SECRET=cinar-crm-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Start the Backend

Development mode (with hot reload):
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

### 4. Verify Backend is Running

The backend should be accessible at:
- **API Base URL**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api (should return "Hello World!")

## Testing the API

You can test the API endpoints using:

1. **Browser** - For GET requests
2. **Postman** - For all HTTP methods
3. **cURL** - Command line testing
4. **Frontend** - The React frontend at http://localhost:5173

### Example API Calls

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cinar.com","password":"admin123"}'
```

**Get All Projects:**
```bash
curl http://localhost:3000/api/projects
```

**Create a Client:**
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "type": "CORPORATE",
    "email": "test@example.com",
    "phone": "+90 555 123 4567"
  }'
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the PORT in your `.env` file:
```env
PORT=3001
```

### Database Connection Issues
Verify your Supabase credentials are correct in the `.env` file.

### CORS Errors
Make sure the FRONTEND_URL in `.env` matches your frontend URL.

## Next Steps

1. ✅ Backend is set up with all modules
2. ✅ Supabase integration is configured
3. ✅ All API endpoints are ready
4. 🔄 Start the backend server
5. 🔄 Test API endpoints
6. 🔄 Connect frontend to backend

## Available Modules

- ✅ Authentication (Login/Register)
- ✅ Users Management
- ✅ Clients Management
- ✅ Projects Management
- ✅ Proposals Management
- ✅ Inventory Management
- ✅ Bookings Management
- ✅ Tasks Management
- ✅ Time Entries Management

All modules are fully integrated with Supabase and ready to use!
