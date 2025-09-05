# RS Assignment

## Overview

This is a full-stack application built with React, TypeScript, and Vite for the frontend client, and Express, PostgreSQL with Drizzle ORM for the backend. The application includes authentication and user management functionality with role-based access control using Row Level Security (RLS) in PostgreSQL.

## test mails and password

```
 systemadmin@gmail.com - Systemadmin@123
```

```
testuser1@gmail.com - Testuser@123
```

```
teststore1@gmail.com - Teststore@123
```

## Project Structure

- `/client` - React frontend application with modern UI components
- `/server` - Express backend application with PostgreSQL database
  - `/controller` - API controllers
  - `/db` - Database configuration and schema
  - `/middleware` - Authentication and other middleware
  - `/routes` - API routes
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions
  - `/supabase` - Database migrations and configuration

## Tech Stack

### Frontend (Client)

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- React Query for data fetching
- React Hook Form with Zod validation

### Backend (Server)

- Node.js with Express
- TypeScript
- PostgreSQL database
- Drizzle ORM for database operations
- JWT for authentication
- bcrypt for password hashing
- Row Level Security (RLS) for data protection

## Setup and Installation

### Client

1. Navigate to the client directory:
   ```bash
   npm run dev
   # or
   bun dev
   ```

### Server

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with the following variables:

   ```
   PORT=3000
   DATABASE_URL=postgres://username:password@localhost:5432/database
   JWT_SECRET=your_jwt_secret
   ```

4. Run database migrations:

   ```bash
   npm run db:migration
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Database

The application uses PostgreSQL with Drizzle ORM. The database schema includes:

- User authentication and authorization with role-based access
- Row Level Security (RLS) for data protection
- Automated triggers for maintaining data integrity

### Database Management

```bash
# Generate migration files
npm run db:push

# Apply migrations
npm run db:migration

# Open Drizzle Studio to view/edit data
npm run db:studio
```

## Features

- User authentication (signup, login, profile management)
- Role-based access control
- Secure API endpoints with JWT authentication
- Modern UI with responsive design
- Data fetching with React Query
- Form validation with Zod
- PostgreSQL database with Row Level Security
