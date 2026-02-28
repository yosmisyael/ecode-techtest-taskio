import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Task Management API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let userId: string;
  let categoryId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply exact same global configurations as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();

    // Clean DB before running tests
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Optional: Clean up again after tests
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('1. Authentication (/auth)', () => {
    it('POST /auth/register - should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.statusCode).toBe(201);
      expect(res.body.message).toBe('Success');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();

      userId = res.body.data.user.id;
    });

    it('POST /auth/register - should fail with duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('CONFLICT');
    });

    it('POST /auth/login - should login user and return token', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();

      accessToken = res.body.data.accessToken;
    });

    it('POST /auth/logout - should logout user successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .send();

      expect(res.status).toBe(200);
      expect(res.body.data.message).toMatch(/Logged out successfully/);
    });
  });

  describe('2. User Profile (/users)', () => {
    it('GET /users/profile - should get current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.name).toBe('Test User');
    });

    it('PATCH /users/profile/name - should update user name', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/profile/name')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('POST /users/profile/reset-password - should reset password', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/profile/reset-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          oldPassword: 'password123',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.message).toBe('Password updated successfully');

      // Re-login to get new token and verify new password works
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'newpassword456',
        });
      accessToken = loginRes.body.data.accessToken;
    });

    it('POST /users/profile/upload-image - should upload profile image', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/profile/upload-image')
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('image', Buffer.from('fake image content'), 'profile.jpg');

      expect(res.status).toBe(201);
      expect(res.body.data.profileImage).toMatch(/^\/uploads\/profiles\//);
    });
  });

  describe('3. Categories (/categories)', () => {
    it('POST /categories - should create a new category', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Work');
      expect(res.body.data.userId).toBe(userId);

      categoryId = res.body.data.id;
    });

    it('POST /categories - should fail if category name exists for user', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work' });

      expect(res.status).toBe(409);
    });

    it('GET /categories - should list categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Work');
    });

    it('GET /categories/:id - should get single category', async () => {
      const res = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(categoryId);
    });

    it('PATCH /categories/:id - should update category', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Work Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Work Updated');
    });
  });

  describe('4. Tasks (/tasks)', () => {
    it('POST /tasks - should create a new task without category', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Learn NestJS',
          details: 'Build an API',
          isStarred: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Learn NestJS');
      expect(res.body.data.isStarred).toBe(true);
      expect(res.body.data.isCompleted).toBe(false);

      taskId = res.body.data.id;
    });

    it('POST /tasks - should create a new task with category', async () => {
      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Write Tests',
          categoryId: categoryId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.categoryId).toBe(categoryId);
    });

    it('GET /tasks - should list tasks with default pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(2);
      expect(res.body.data.meta.total).toBe(2);
      // Verify starred task comes first
      expect(res.body.data.tasks[0].title).toBe('Learn NestJS');
      expect(res.body.data.tasks[0].isStarred).toBe(true);
    });

    it('GET /tasks - should filter by categoryId', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks?categoryId=${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Write Tests');
    });

    it('GET /tasks - should search by title', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks?search=NestJS')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].title).toBe('Learn NestJS');
    });

    it('GET /tasks/:id - should get single task', async () => {
      const res = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
    });

    it('PATCH /tasks/:id - should update task', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Learn NestJS Advanced' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Learn NestJS Advanced');
    });

    it('PATCH /tasks/:id/toggle-complete - should toggle task completion', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/toggle-complete`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isCompleted).toBe(true);
    });

    it('GET /tasks/history - should list only completed tasks', async () => {
      const res = await request(app.getHttpServer())
        .get('/tasks/history')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
      expect(res.body.data.tasks[0].id).toBe(taskId);
      expect(res.body.data.tasks[0].isCompleted).toBe(true);
    });

    it('DELETE /tasks/:id - should delete task', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Task deleted successfully');

      // Verify deletion
      const getRes = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('5. Cleanup (/categories)', () => {
    it('DELETE /categories/:id - should delete category and cascade/set null rules', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);

      // Verify deletion
      const getRes = await request(app.getHttpServer())
        .get(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(getRes.status).toBe(404);
    });
  });
});
