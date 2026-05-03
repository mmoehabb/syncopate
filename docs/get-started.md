# Getting Started with Syncoboard

Welcome to the Syncoboard monorepo! Follow these steps to get your local development environment up and running.

## Prerequisites

- Node.js (v20)
- `bun` (latest stable)
- PostgreSQL (or Docker to run it)

## Setup Instructions

### 1. Install Dependencies

Run the following command at the root of the project:

```bash
bun install
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
bun run db:migrate:dev

# Or, if you need to push changes during prototyping
bun run db:push

# Seed the database
bun run db:seed
```

### 4. Start the Application

Start the frontend Next.js server locally:

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.
