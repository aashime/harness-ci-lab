const request = require('supertest');
const { app, add, multiply } = require('./app');

describe('API Endpoints', () => {
  test('GET / returns welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Welcome to Harness CI Lab!');
  });

  test('GET /health returns healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/info returns app info', async () => {
    const response = await request(app).get('/api/info');
    expect(response.status).toBe(200);
    expect(response.body.app).toBe('harness-ci-lab');
    expect(response.body.version).toBe('1.0.0');
  });
});

describe('Math Functions', () => {
  test('add function works correctly', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });

  test('multiply function works correctly', () => {
    expect(multiply(2, 3)).toBe(6);
    expect(multiply(-2, 3)).toBe(-6);
    expect(multiply(0, 5)).toBe(0);
  });
});
