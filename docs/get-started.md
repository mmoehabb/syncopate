# Getting Started with Syncopate

Welcome to the Syncopate monorepo! Follow these steps to get your local development environment up and running.

## Prerequisites

- Node.js (v20)
- `pnpm` (v10 or later)
- PostgreSQL (or Docker to run it)

## Setup Instructions

### 1. Install Dependencies

Run the following command at the root of the project:

```bash
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the root of the project, or set up a Postgres connection string directly:

```bash
cp .env.example .env
```

Ensure that `DATABASE_URL` is set to your local PostgreSQL instance.

### 3. Database Initialization

Once your PostgreSQL database is running, you can apply the initial schema and seed the database with predefined plans:

```bash
# Apply schema
pnpm db:migrate:dev

# Or, if you need to push changes during prototyping
pnpm db:push

# Seed the database
pnpm db:seed
```

### 4. Start the Application

Start the frontend Next.js server locally:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.
