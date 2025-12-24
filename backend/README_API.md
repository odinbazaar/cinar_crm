# Çınar CRM Backend

A comprehensive NestJS backend for the Çınar CRM application with Supabase integration.

## Features

- 🔐 **Authentication** - User login and registration with bcrypt password hashing
- 👥 **User Management** - Complete CRUD operations for users
- 🏢 **Client Management** - Lead tracking and client relationship management
- 📊 **Project Management** - Project tracking with budget and timeline management
- 📝 **Proposals** - Create and manage proposals with automatic numbering
- 📦 **Inventory** - Manage inventory items with location tracking
- 📅 **Bookings** - Schedule and manage inventory bookings
- ✅ **Tasks** - Task management with assignments and approvals
- ⏱️ **Time Tracking** - Track time entries for projects and tasks

## Tech Stack

- **Framework**: NestJS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: bcrypt
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your Supabase credentials:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Set up the database schema:
   - Go to your Supabase project
   - Open the SQL Editor
   - Run the `supabase-schema.sql` file
   - Optionally run `seed-data.sql` for test data

### Running the Application

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile/:id` - Get user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/role/:role` - Get users by role
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/active` - Get active clients
- `GET /api/clients/stage/:stage` - Get clients by lead stage
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/status/:status` - Get projects by status
- `GET /api/projects/client/:clientId` - Get projects by client
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `PUT /api/projects/:id/archive` - Archive project
- `DELETE /api/projects/:id` - Delete project

### Proposals
- `GET /api/proposals` - Get all proposals
- `GET /api/proposals/:id` - Get proposal by ID
- `POST /api/proposals` - Create proposal
- `PUT /api/proposals/:id` - Update proposal
- `PUT /api/proposals/:id/status/:status` - Update proposal status
- `DELETE /api/proposals/:id` - Delete proposal

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/district/:district` - Get items by district
- `GET /api/inventory/:id` - Get item by ID
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/inventory/:inventoryItemId` - Get bookings by inventory item
- `GET /api/bookings/project/:projectId` - Get bookings by project
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/project/:projectId` - Get tasks by project
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/assign/:userId` - Assign user to task
- `DELETE /api/tasks/:id/assign/:userId` - Unassign user from task
- `DELETE /api/tasks/:id` - Delete task

### Time Entries
- `GET /api/time-entries` - Get all time entries
- `GET /api/time-entries/user/:userId` - Get time entries by user
- `GET /api/time-entries/project/:projectId` - Get time entries by project
- `GET /api/time-entries/:id` - Get time entry by ID
- `POST /api/time-entries` - Create time entry
- `PUT /api/time-entries/:id` - Update time entry
- `PUT /api/time-entries/:id/stop` - Stop timer
- `DELETE /api/time-entries/:id` - Delete time entry

## Project Structure

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # User management
│   ├── clients/           # Client management
│   ├── projects/          # Project management
│   ├── proposals/         # Proposal management
│   ├── inventory/         # Inventory management
│   ├── bookings/          # Booking management
│   ├── tasks/             # Task management
│   ├── time-entries/      # Time tracking
│   ├── config/            # Configuration files
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── .env.example           # Environment variables template
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript configuration
```

## Development

### Code Style

This project uses ESLint and Prettier for code formatting. Run:

```bash
npm run lint
npm run format
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

UNLICENSED
