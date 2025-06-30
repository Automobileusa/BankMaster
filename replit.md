# KeyBank Banking Simulation - replit.md

## Overview

A pixel-perfect banking dashboard simulation styled like KeyBank's UI, built with React, TypeScript, Express.js, and PostgreSQL. The application features a secure login system with two-factor authentication via email, comprehensive banking functionality including account management, transfers, bill payments, and transaction tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/building
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom KeyBank color variables (red: #c8102e, blue: #004785)
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Chart.js for account balance visualization

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Email-based OTP verification system using Nodemailer/SendGrid
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **API Design**: RESTful endpoints with comprehensive error handling

### Database Schema
- **users**: User accounts with credentials and profile information
- **accounts**: Banking accounts (checking, savings, credit) with balances
- **transactions**: Transaction history with categorization
- **payees**: Bill payment recipients
- **bill_payments**: Scheduled and completed bill payments
- **check_orders**: Check ordering system
- **otp_codes**: Time-limited verification codes for 2FA

## Key Components

### Authentication System
- **Login Page**: Pixel-perfect recreation of KeyBank's login interface
- **Two-Factor Authentication**: Email-based OTP with 10-minute expiration
- **Session Management**: Secure session handling with PostgreSQL storage
- **Logout**: Proper session cleanup and redirection

### Banking Dashboard
- **Account Cards**: Visual representation of account balances and types
- **Balance Chart**: Historical balance visualization using Chart.js
- **Transaction Table**: Filterable transaction history with search capabilities
- **Quick Actions**: Modal-based transfers, bill payments, and check ordering

### Modal System
- **Transfer Modal**: Internal account-to-account transfers
- **Bill Payment Modal**: Schedule payments to registered payees
- **External Transfer Modal**: Zelle-style external transfers
- **Checkbook Modal**: Order physical checks with style and quantity options

## Data Flow

1. **Authentication Flow**:
   - User submits credentials → Server validates → OTP sent via email → User verifies OTP → Session established

2. **Dashboard Data Flow**:
   - Client requests account data → Server queries database → Returns structured JSON → Client renders UI components

3. **Transaction Flow**:
   - User initiates action via modal → Client validates input → Server processes transaction → Database updated → Client refreshes data

4. **Real-time Updates**:
   - TanStack Query manages cache invalidation after mutations
   - Automatic refetch of account balances and transaction history

## External Dependencies

### Email Service
- **Primary**: Nodemailer with Gmail SMTP (support@autosmobile.us)
- **Configuration**: Environment variables for SMTP credentials
- **Templates**: HTML email templates matching KeyBank branding

### Database
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Database migrations and schema management
- **Connection**: Environment variable DATABASE_URL required

### UI Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Consistent iconography throughout the application
- **React Hook Form**: Form validation and submission handling

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement and fast builds
- **TypeScript Checking**: Continuous type checking during development
- **Replit Integration**: Cartographer and runtime error overlay plugins

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Static Assets**: Served by Express in production mode

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SMTP_USER`: Email service username (default: support@autosmobile.us)
- `SMTP_PASS`: Email service password (default: arjf hitm vydd nrjc)
- `ADMIN_EMAIL`: Recipient for OTP codes (default: support@cbelko.net)
- `NODE_ENV`: Environment mode (development/production)

### Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production assets
- `npm start`: Start production server
- `npm run db:push`: Push database schema changes

## Changelog

```
Changelog:
- June 30, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```