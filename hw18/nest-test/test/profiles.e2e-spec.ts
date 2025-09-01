import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.profile.deleteMany({});
  });

  afterAll(async () => {
    await prisma.profile.deleteMany({});
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /profiles', () => {
    it('should create a profile successfully with valid token (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('authorization', 'Bearer test')
        .send({ email: 'a@b.io', displayName: 'Ann' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'a@b.io');
      expect(response.body).toHaveProperty('displayName', 'Ann');
    });

    it('should reject request without authorization token (401)', async () => {
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .send({ email: 'a@b.io', displayName: 'Ann' })
        .expect(401);

      expect(response.body).toHaveProperty(
        'message',
        'Authorization header must be "Bearer test"',
      );
    });

    it('should reject request with invalid authorization token (401)', async () => {
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('authorization', 'Bearer invalid')
        .send({ email: 'a@b.io', displayName: 'Ann' })
        .expect(401);

      expect(response.body).toHaveProperty(
        'message',
        'Authorization header must be "Bearer test"',
      );
    });

    it('should reject request with invalid email format (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('authorization', 'Bearer test')
        .send({ email: 'invalid-email', displayName: 'Ann' })
        .expect(400);

      expect(Array.isArray(response.body.message)).toBe(true);
      expect(response.body.message).toContain(
        'Email must be a valid email address',
      );
    });

    it('should handle duplicate email (409)', async () => {
      await request(app.getHttpServer())
        .post('/profiles')
        .set('authorization', 'Bearer test')
        .send({ email: 'a@b.io', displayName: 'Ann' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('authorization', 'Bearer test')
        .send({ email: 'a@b.io', displayName: 'Another Ann' })
        .expect(409);

      expect(response.body).toHaveProperty(
        'message',
        'Profile with this email already exists',
      );
    });
  });

  describe('GET /profiles', () => {
    it('should return all profiles', async () => {
      await prisma.profile.create({
        data: { email: 'user1@test.com', displayName: 'User 1' },
      });
      await prisma.profile.create({
        data: { email: 'user2@test.com', displayName: 'User 2' },
      });

      const response = await request(app.getHttpServer())
        .get('/profiles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('email', 'user1@test.com');
      expect(response.body[1]).toHaveProperty('email', 'user2@test.com');
    });
  });
});
