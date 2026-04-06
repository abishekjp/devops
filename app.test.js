const request = require('supertest');
const app = require('./app');

describe('DevSecOps Web Application', () => {

  describe('GET /', () => {
    it('should return application info', async () => {
      const res = await request(app).get('/').set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.application).toBe('DevSecOps');
      expect(res.body.status).toBe('running');
      expect(res.body.endpoints).toBeDefined();
    });

    it('should return HTML when requested', async () => {
      const res = await request(app).get('/').set('Accept', 'text/html');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health').set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });

    it('should return HTML when requested', async () => {
      const res = await request(app).get('/health').set('Accept', 'text/html');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('System Health');
    });
  });

  describe('GET /api/status', () => {
    it('should return API operational status', async () => {
      const res = await request(app).get('/api/status').set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
      expect(res.body.api).toBe('operational');
      expect(res.body.version).toBe('1.0.0');
    });

    it('should return HTML when requested', async () => {
      const res = await request(app).get('/api/status').set('Accept', 'text/html');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('API Status');
    });
  });

  describe('GET /api/data', () => {
    it('should return 401 without authorization', async () => {
      const res = await request(app).get('/api/data').set('Accept', 'application/json');
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Unauthorized — invalid or missing API key');
    });

    it('should return 401 with wrong API key', async () => {
      const res = await request(app)
        .get('/api/data')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer wrong-key');
      expect(res.statusCode).toBe(401);
    });

    it('should return 200 with valid API key in header', async () => {
      const res = await request(app)
        .get('/api/data')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer demo-authorization-value`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should return 200 with valid API key in query param', async () => {
      const res = await request(app)
        .get('/api/data?key=demo-authorization-value')
        .set('Accept', 'application/json');
      expect(res.statusCode).toBe(200);
    });

    it('should return HTML when requested', async () => {
      const res = await request(app)
        .get('/api/data?key=demo-authorization-value')
        .set('Accept', 'text/html');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('<!DOCTYPE html>');
      expect(res.text).toContain('Secured Data Payload');
    });
  });

  describe('GET /unknown-route', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/does-not-exist');
      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });

});
