# RS Assignment

## Overview

This is a full-stack application built with React, TypeScript, and Vite for the frontend client, and Express, PostgreSQL with Drizzle ORM for the backend. The application includes authentication and user management functionality with role-based access control using Row Level Security (RLS) in PostgreSQL.

The system implements a multi-role architecture with admin, store owner, and regular user capabilities, providing a complete e-commerce platform for store management and user interactions.

## Test Accounts

### Admin

```
systemadmin@gmail.com - Systemadmin@123
```

### Users

```
testuser1@gmail.com - TestUser@1234
testuser2@gmail.com - TestUser2@1234
```

### Store Owners

```
teststore1@gmail.com - Teststore@123
teststore2@gmail.com - Teststore2@123
```

## Project Structure

- `/client` - React frontend application with modern UI components
  - `/src` - Source code for the React application
    - `/api` - API service functions for different user roles
    - `/components` - Reusable UI components including routing and shared elements
    - `/layouts` - Layout components for consistent UI structure
    - `/pages` - Page components organized by user role
    - `/store` - State management
    - `/types` - TypeScript type definitions
- `/server` - Express backend application with PostgreSQL database
  - `/controller` - API controllers for different user roles
  - `/db` - Database configuration and schema
  - `/middleware` - Authentication and validation middleware
  - `/routes` - API routes organized by user role
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions for auth and other services
  - `/supabase` - Database migrations and configuration

## Tech Stack

### Frontend (Client)

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI components (based on Radix UI)
- React Query for data fetching
- React Hook Form with Zod validation
- React Router for navigation
- Axios for API requests

### Backend (Server)

- Node.js with Express
- TypeScript
- PostgreSQL database
- Drizzle ORM for database operations
- JWT for authentication
- bcrypt for password hashing
- Row Level Security (RLS) for data protection
- Supabase for database migrations

## Setup and Installation

### Prerequisites

- Node.js (version 18 or higher)
- PostgreSQL database
- npm or bun package manager

### Client

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   bun dev
   ```

4. The application will be available at `http://localhost:5173`

### Server

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   bun install
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
   # or
   bun run db:migration
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. The API server will be available at `http://localhost:3000`

## Database

The application uses PostgreSQL with Drizzle ORM. The database schema includes:

- User authentication and authorization with role-based access
- Store management system with owner capabilities
- Row Level Security (RLS) for data protection
- Automated triggers for maintaining data integrity

### Database Management

```bash
# Generate migration files
npm run db:push
# or
bun run db:push

# Apply migrations
npm run db:migration
# or
bun run db:migration

# Open Drizzle Studio to view/edit data
npm run db:studio
# or
bun run db:studio
```

## Features

- Multi-role authentication system (admin, store owner, user)
- User management (signup, login, profile management)
- Store creation and management for store owners
- Product listing and catalog management
- Role-based access control
- Secure API endpoints with JWT authentication
- Modern UI with responsive design based on Shadcn UI
- Data fetching with React Query for optimized performance
- Form validation with Zod
- PostgreSQL database with Row Level Security for data protection

## Application Flow

1. **Authentication**: Users can register or login based on their role
2. **Admin**: Can manage all users and stores in the system
3. **Store Owner**: Can create and manage their stores and products
4. **User**: Can browse stores, view products, and interact with the platform

## License

This project is licensed under the MIT License.
