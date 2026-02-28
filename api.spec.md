# Task Management API Specification

**Base URL**: `http://localhost:3000`

All successful responses follow a uniform structure:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

All error responses follow:

```json
{
  "statusCode": 4xx | 5xx,
  "message": "Error description" | ["validation", "errors"],
  "error": "ERROR_NAME",
  "path": "/endpoint",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Authentication

### Register

- **Method**: `POST`
- **Route**: `/auth/register`
- **Headers**: `Content-Type: application/json`
- **Auth Required**: No

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field      | Type   | Required | Constraints        |
| ---------- | ------ | -------- | ------------------ |
| `name`     | string | Yes      | Non-empty          |
| `email`    | string | Yes      | Valid email format |
| `password` | string | Yes      | Min 6 characters   |

**Success Response** (`201 Created`):

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:

| Status | Condition                |
| ------ | ------------------------ |
| 400    | Validation errors        |
| 409    | Email already registered |

---

### Login

- **Method**: `POST`
- **Route**: `/auth/login`
- **Headers**: `Content-Type: application/json`
- **Auth Required**: No

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

| Field      | Type   | Required | Constraints        |
| ---------- | ------ | -------- | ------------------ |
| `email`    | string | Yes      | Valid email format |
| `password` | string | Yes      | Non-empty          |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "profileImage": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:

| Status | Condition           |
| ------ | ------------------- |
| 400    | Validation errors   |
| 401    | Invalid credentials |

---

### Logout

- **Method**: `POST`
- **Route**: `/auth/logout`
- **Headers**: `Content-Type: application/json`
- **Auth Required**: No (client-side token discard)

**Request Body**: None

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Logged out successfully. Please discard your token on the client side."
  }
}
```

---

## User Profile

> All User Profile endpoints require authentication.

### Get Profile

- **Method**: `GET`
- **Route**: `/users/profile`
- **Headers**: `Authorization: Bearer <token>`

**Request Body**: None

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "/uploads/profiles/image.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:

| Status | Condition      |
| ------ | -------------- |
| 401    | Unauthorized   |
| 404    | User not found |

---

### Update Name

- **Method**: `PATCH`
- **Route**: `/users/profile/name`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body**:

```json
{
  "name": "Jane Doe"
}
```

| Field  | Type   | Required | Constraints |
| ------ | ------ | -------- | ----------- |
| `name` | string | Yes      | Non-empty   |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "john@example.com",
    "profileImage": null
  }
}
```

**Error Responses**:

| Status | Condition        |
| ------ | ---------------- |
| 400    | Validation error |
| 401    | Unauthorized     |

---

### Reset Password

- **Method**: `POST`
- **Route**: `/users/profile/reset-password`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body**:

```json
{
  "oldPassword": "secret123",
  "newPassword": "newsecret456"
}
```

| Field         | Type   | Required | Constraints      |
| ------------- | ------ | -------- | ---------------- |
| `oldPassword` | string | Yes      | Non-empty        |
| `newPassword` | string | Yes      | Min 6 characters |

**Success Response** (`201 Created`):

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "message": "Password updated successfully"
  }
}
```

**Error Responses**:

| Status | Condition                     |
| ------ | ----------------------------- |
| 400    | Validation error              |
| 401    | Current password is incorrect |
| 404    | User not found                |

---

### Upload Profile Image

- **Method**: `POST`
- **Route**: `/users/profile/upload-image`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request Body** (multipart form-data):

| Field   | Type | Required | Constraints                           |
| ------- | ---- | -------- | ------------------------------------- |
| `image` | file | Yes      | Max 5MB; jpg, jpeg, png, gif, or webp |

> **Note**: When uploading a new image, the server automatically deletes the user's previously uploaded profile image from disk to prevent storage bloat.

**Success Response** (`201 Created`):

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profileImage": "/uploads/profiles/a1b2c3d4.jpg"
  }
}
```

**Error Responses**:

| Status | Condition                          |
| ------ | ---------------------------------- |
| 400    | No file / invalid type / too large |
| 401    | Unauthorized                       |
| 404    | User not found                     |

---

## Categories

> All Category endpoints require authentication. Users can only access their own categories.

### Create Category

- **Method**: `POST`
- **Route**: `/categories`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body**:

```json
{
  "name": "Work"
}
```

| Field  | Type   | Required | Constraints |
| ------ | ------ | -------- | ----------- |
| `name` | string | Yes      | Non-empty   |

**Success Response** (`201 Created`):

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Work",
    "userId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:

| Status | Condition                    |
| ------ | ---------------------------- |
| 400    | Validation error             |
| 401    | Unauthorized                 |
| 409    | Category name already exists |

---

### List All Categories

- **Method**: `GET`
- **Route**: `/categories`
- **Headers**: `Authorization: Bearer <token>`

**Request Body**: None

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": "uuid",
      "name": "Work",
      "userId": "uuid",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "_count": {
        "tasks": 5
      }
    }
  ]
}
```

---

### Get Category by ID

- **Method**: `GET`
- **Route**: `/categories/:id`
- **Headers**: `Authorization: Bearer <token>`

**Path Parameters**:

| Param | Type   | Description   |
| ----- | ------ | ------------- |
| `id`  | string | Category UUID |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Work",
    "userId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "_count": {
      "tasks": 5
    }
  }
}
```

**Error Responses**:

| Status | Condition          |
| ------ | ------------------ |
| 401    | Unauthorized       |
| 404    | Category not found |

---

### Update Category

- **Method**: `PATCH`
- **Route**: `/categories/:id`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Path Parameters**:

| Param | Type   | Description   |
| ----- | ------ | ------------- |
| `id`  | string | Category UUID |

**Request Body**:

```json
{
  "name": "Personal"
}
```

| Field  | Type   | Required | Constraints |
| ------ | ------ | -------- | ----------- |
| `name` | string | No       | Non-empty   |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "name": "Personal",
    "userId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:

| Status | Condition                    |
| ------ | ---------------------------- |
| 400    | Validation error             |
| 401    | Unauthorized                 |
| 404    | Category not found           |
| 409    | Category name already exists |

---

### Delete Category

- **Method**: `DELETE`
- **Route**: `/categories/:id`
- **Headers**: `Authorization: Bearer <token>`

**Path Parameters**:

| Param | Type   | Description   |
| ----- | ------ | ------------- |
| `id`  | string | Category UUID |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Category deleted successfully"
  }
}
```

**Error Responses**:

| Status | Condition          |
| ------ | ------------------ |
| 401    | Unauthorized       |
| 404    | Category not found |

---

## Tasks

> All Task endpoints require authentication. Users can only access their own tasks.

### Create Task

- **Method**: `POST`
- **Route**: `/tasks`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Request Body**:

```json
{
  "title": "Complete project report",
  "details": "Finish the Q4 report with all metrics",
  "deadline": "2025-03-15T23:59:59.000Z",
  "categoryId": "uuid",
  "isStarred": true
}
```

| Field        | Type    | Required | Constraints                       |
| ------------ | ------- | -------- | --------------------------------- |
| `title`      | string  | Yes      | Non-empty                         |
| `details`    | string  | No       |                                   |
| `deadline`   | string  | No       | ISO 8601 date string              |
| `categoryId` | string  | No       | UUID of an existing user category |
| `isStarred`  | boolean | No       | Defaults to `false`               |

**Success Response** (`201 Created`):

```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "uuid",
    "title": "Complete project report",
    "details": "Finish the Q4 report with all metrics",
    "deadline": "2025-03-15T23:59:59.000Z",
    "isCompleted": false,
    "isStarred": true,
    "userId": "uuid",
    "categoryId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "category": {
      "id": "uuid",
      "name": "Work",
      "userId": "uuid",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses**:

| Status | Condition                              |
| ------ | -------------------------------------- |
| 400    | Validation error                       |
| 401    | Unauthorized                           |
| 404    | Category not found / not owned by user |

---

### List Tasks (with Pagination, Filters, Search)

- **Method**: `GET`
- **Route**: `/tasks`
- **Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

| Param          | Type   | Default | Description                                                                          |
| -------------- | ------ | ------- | ------------------------------------------------------------------------------------ |
| `page`         | number | 1       | Page number (min 1)                                                                  |
| `limit`        | number | 10      | Items per page (min 1)                                                               |
| `categoryId`   | string | —       | Filter by category UUID                                                              |
| `search`       | string | —       | Partial text match on task title (case-insensitive)                                  |
| `deadlineFrom` | string | —       | ISO 8601 date — filter tasks with deadline >= value                                  |
| `deadlineTo`   | string | —       | ISO 8601 date — filter tasks with deadline <= value                                  |
| `completed`    | string | —       | `"true"` = completed only, `"false"` = uncompleted only, `"all"` or omit = all tasks |

**Example**: `GET /tasks?page=1&limit=10&categoryId=uuid&search=report&completed=false`

**Sorting**: Starred (pinned) tasks always appear first, then sorted by creation date descending.

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Complete project report",
        "details": "...",
        "deadline": "2025-03-15T23:59:59.000Z",
        "isCompleted": false,
        "isStarred": true,
        "userId": "uuid",
        "categoryId": "uuid",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "category": { "id": "uuid", "name": "Work", "...": "..." }
      }
    ],
    "meta": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "totalPages": 3
    }
  }
}
```

---

### Task History (Completed Tasks)

- **Method**: `GET`
- **Route**: `/tasks/history`
- **Headers**: `Authorization: Bearer <token>`

**Query Parameters**: Same as List Tasks (except `completed` is forced to `"true"`).

**Example**: `GET /tasks/history?page=1&limit=10`

**Success Response** (`200 OK`): Same structure as List Tasks, filtered to completed tasks only.

---

### Get Task by ID

- **Method**: `GET`
- **Route**: `/tasks/:id`
- **Headers**: `Authorization: Bearer <token>`

**Path Parameters**:

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Task UUID   |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "title": "Complete project report",
    "details": "Finish the Q4 report with all metrics",
    "deadline": "2025-03-15T23:59:59.000Z",
    "isCompleted": false,
    "isStarred": true,
    "userId": "uuid",
    "categoryId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "category": { "id": "uuid", "name": "Work", "...": "..." }
  }
}
```

**Error Responses**:

| Status | Condition      |
| ------ | -------------- |
| 401    | Unauthorized   |
| 404    | Task not found |

---

### Update Task

- **Method**: `PATCH`
- **Route**: `/tasks/:id`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Path Parameters**:

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Task UUID   |

**Request Body** (all fields optional):

```json
{
  "title": "Updated title",
  "details": "Updated details",
  "deadline": "2025-04-01T00:00:00.000Z",
  "categoryId": "uuid",
  "isStarred": false,
  "isCompleted": true
}
```

| Field         | Type    | Required | Constraints                       |
| ------------- | ------- | -------- | --------------------------------- |
| `title`       | string  | No       |                                   |
| `details`     | string  | No       |                                   |
| `deadline`    | string  | No       | ISO 8601 date string              |
| `categoryId`  | string  | No       | UUID of an existing user category |
| `isStarred`   | boolean | No       |                                   |
| `isCompleted` | boolean | No       |                                   |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "title": "Updated title",
    "details": "Updated details",
    "deadline": "2025-04-01T00:00:00.000Z",
    "isCompleted": true,
    "isStarred": false,
    "userId": "uuid",
    "categoryId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z",
    "category": { "id": "uuid", "name": "Work", "...": "..." }
  }
}
```

**Error Responses**:

| Status | Condition                  |
| ------ | -------------------------- |
| 400    | Validation error           |
| 401    | Unauthorized               |
| 404    | Task or category not found |

---

### Toggle Task Completion

- **Method**: `PATCH`
- **Route**: `/tasks/:id/toggle-complete`
- **Headers**: `Authorization: Bearer <token>`

**Path Parameters**:

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Task UUID   |

**Request Body**: None

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid",
    "title": "Complete project report",
    "details": "...",
    "deadline": "2025-03-15T23:59:59.000Z",
    "isCompleted": true,
    "isStarred": true,
    "userId": "uuid",
    "categoryId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z",
    "category": { "...": "..." }
  }
}
```

**Error Responses**:

| Status | Condition      |
| ------ | -------------- |
| 401    | Unauthorized   |
| 404    | Task not found |

---

### Delete Task

- **Method**: `DELETE`
- **Route**: `/tasks/:id`
- **Headers**: `Authorization: Bearer <token>`

**Path Parameters**:

| Param | Type   | Description |
| ----- | ------ | ----------- |
| `id`  | string | Task UUID   |

**Success Response** (`200 OK`):

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Task deleted successfully"
  }
}
```

**Error Responses**:

| Status | Condition      |
| ------ | -------------- |
| 401    | Unauthorized   |
| 404    | Task not found |

---

## Database Schema

### User

| Column          | Type     | Constraints        |
| --------------- | -------- | ------------------ |
| `id`            | UUID     | PK, auto-generated |
| `email`         | String   | Unique             |
| `name`          | String   |                    |
| `password`      | String   | Hashed (bcrypt)    |
| `profile_image` | String?  | Nullable           |
| `created_at`    | DateTime | Auto-set           |
| `updated_at`    | DateTime | Auto-updated       |

### Category

| Column       | Type     | Constraints                      |
| ------------ | -------- | -------------------------------- |
| `id`         | UUID     | PK, auto-generated               |
| `name`       | String   | Unique per user (name + user_id) |
| `user_id`    | UUID     | FK → User (cascade delete)       |
| `created_at` | DateTime | Auto-set                         |
| `updated_at` | DateTime | Auto-updated                     |

### Task

| Column         | Type      | Constraints                        |
| -------------- | --------- | ---------------------------------- |
| `id`           | UUID      | PK, auto-generated                 |
| `title`        | String    |                                    |
| `details`      | String?   | Nullable                           |
| `deadline`     | DateTime? | Nullable                           |
| `is_completed` | Boolean   | Default: `false`                   |
| `is_starred`   | Boolean   | Default: `false`                   |
| `user_id`      | UUID      | FK → User (cascade delete)         |
| `category_id`  | UUID?     | FK → Category (set null on delete) |
| `created_at`   | DateTime  | Auto-set                           |
| `updated_at`   | DateTime  | Auto-updated                       |

---

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
