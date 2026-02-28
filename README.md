# Taskio API Clone by Yosev

> QuickNotes: API Specs are available at **[here](https://github.com/yosmisyael/ecode-techtest-taskio/blob/main/api.spec.md)**. Too lazy to install and experience this app? Try deployed API version **[here: Base URL API: https://taskio.elyos.me](https://taskio.elyos.me)!**

## Description
**Taskio API** is a high-performance, scalable Task Management system designed for modern productivity workflows. Built with a focus on security, efficiency, and developer experience, this API provides a robust foundation for building task-oriented applications.

### Key Features

- **Secure JWT Authentication**: Industry-standard JSON Web Token implementation for secure, stateless user authentication and authorization.
- **Advanced Task Management**: Full-featured CRUD operations for tasks with support for titles, descriptions, pin favourite, and status tracking.
- **Smart Categorization**: Organize tasks effortlessly into categories, enabling users to maintain a clear overview of different project areas.
- **Intelligent Image Uploads**: Integrated image handling for tasks, featuring an automated replacement mechanism that cleans up orphaned files to maintain storage efficiency.
- **Enterprise-Grade Architecture**: Leverages NestJS's modular architecture, providing a highly maintainable and testable codebase.
- **Performance First**: support pagination, filtering, flexible search by category or task title, even filter by task deadline!
- **Prisma & PostgreSQL**: Utilizes the powerful Prisma ORM for type-safe database interactions with PostgreSQL, ensuring data integrity and performance.

## Setup & Running

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL connection string

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev

# Build for production
npm run build
npm run start:prod
```

**Environment Variables**:

| Variable                 | Description                  | Default                                                              |
| ------------------------ | ---------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`           | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/taskio?schema=public` |
| `JWT_SECRET`             | Secret key for JWT signing   | `default-secret`                                                     |
| `JWT_EXPIRATION_SECONDS` | Token expiration in seconds  | `86400` (24 hours)                                                   |
| `PORT`                   | Server port                  | `3000`                                                               |

### Tech
- Node (NestJS)
- Postgresql
- JWT
