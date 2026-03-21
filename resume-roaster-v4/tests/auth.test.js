require('dotenv').config();
process.env.MONGODB_URI = 'mongodb://localhost:27017/rr-test-auth';
process.env.JWT_SECRET = 'test-secret';

let app, server;
const request = require('supertest');
const mongoose = require('mongoose');

beforeAll(async () => {
  const mod = require('../server');
  app = mod.app; server = mod.server;
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
  if (server) server.close();
});

describe('Register', () => {
  it('creates account and returns message', async () => {
    const res = await request(app).post('/api/auth/register').send({ name:'Saksham', email:'s@test.com', password:'pass123' });
    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/verify/i);
  });
  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({ name:'Saksham', email:'s@test.com', password:'pass123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already/i);
  });
  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({ name:'T', email:'t@t.com', password:'123' });
    expect(res.status).toBe(400);
  });
  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email:'x@x.com' });
    expect(res.status).toBe(400);
  });
});

describe('Login', () => {
  beforeAll(async () => {
    const User = require('../models/User');
    const u = new User({ name:'Login Test', email:'login@test.com', password:'pass123', isVerified: true });
    await u.save();
  });
  it('logs in verified user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'login@test.com', password:'pass123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.password).toBeUndefined();
  });
  it('blocks unverified user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'s@test.com', password:'pass123' });
    expect(res.status).toBe(403);
    expect(res.body.unverified).toBe(true);
  });
  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'login@test.com', password:'wrong' });
    expect(res.status).toBe(401);
  });
  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email:'nobody@test.com', password:'pass123' });
    expect(res.status).toBe(401);
  });
});

describe('Protected routes', () => {
  it('rejects /api/history without token', async () => {
    const res = await request(app).get('/api/history');
    expect(res.status).toBe(401);
  });
  it('rejects /api/roast without token', async () => {
    const res = await request(app).post('/api/roast').send({ text:'hello' });
    expect(res.status).toBe(401);
  });
  it('accepts valid token on /api/auth/me', async () => {
    const login = await request(app).post('/api/auth/login').send({ email:'login@test.com', password:'pass123' });
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ' + login.body.token);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('login@test.com');
  });
  it('rejects tampered token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer faketoken123');
    expect(res.status).toBe(401);
  });
});

describe('Password Reset', () => {
  it('returns success message for known email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email:'login@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeTruthy();
  });
  it('returns same message for unknown email (security)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email:'hacker@test.com' });
    expect(res.status).toBe(200);
  });
  it('rejects reset with invalid token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({ token:'badtoken', password:'newpass123' });
    expect(res.status).toBe(400);
  });
});
