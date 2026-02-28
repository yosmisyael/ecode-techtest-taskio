<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/ci/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

## Description

**Taskio API** is a high-performance, scalable Task Management system designed for modern productivity workflows. Built with a focus on security, efficiency, and developer experience, this API provides a robust foundation for building task-oriented applications.

### Key Features

- 🔐 **Secure JWT Authentication**: Industry-standard JSON Web Token implementation for secure, stateless user authentication and authorization.
- 📋 **Advanced Task Management**: Full-featured CRUD operations for tasks with support for titles, descriptions, and status tracking.
- 📁 **Smart Categorization**: Organize tasks effortlessly into categories, enabling users to maintain a clear overview of different project areas.
- 🖼️ **Intelligent Image Uploads**: Integrated image handling for tasks, featuring an automated replacement mechanism that cleans up orphaned files to maintain storage efficiency.
- 🏗️ **Enterprise-Grade Architecture**: Leverages NestJS's modular architecture, providing a highly maintainable and testable codebase.
- 💾 **Prisma & PostgreSQL**: Utilizes the powerful Prisma ORM for type-safe database interactions with PostgreSQL, ensuring data integrity and performance.

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
