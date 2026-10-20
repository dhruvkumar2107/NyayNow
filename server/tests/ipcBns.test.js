const express = require('express');
const request = require('supertest');
const router = require('../routes/ipcBns');
const util = require('../utils/ipcBnsData');

describe('IPC-to-BNS reference data (util)', () => {
  test('seed map loads with items and review metadata', () => {
    expect(Array.isArray(util.IPC_BNS_MAP.items)).toBe(true);
    expect(util.IPC_BNS_MAP.items.length).toBeGreaterThan(0);
    expect(util.IPC_BNS_META.reviewStatus).toBe('pending-counsel-review');
    expect(util.IPC_BNS_META.legalReview).toBe(true);
  });

  test('every entry carries a pending review status and both sections', () => {
    for (const item of util.IPC_BNS_MAP.items) {
      expect(item.reviewStatus).toBe('pending-counsel-review');
      expect(item.ipc).toBeTruthy();
      expect(item.bns).toBeTruthy();
    }
  });

  test('lookup resolves by section number and ignores IPC/BNS labels', () => {
    expect(util.getIpcBnsEntry('420').bns).toBe('318');
    expect(util.getIpcBnsEntry('IPC 302').bns).toBe('103');
    expect(util.getIpcBnsEntry('9999')).toBeNull();
  });

  test('search matches titles and section numbers', () => {
    const byTitle = util.searchIpcBns('murder');
    expect(byTitle.length).toBeGreaterThan(0);
    const byNumber = util.searchIpcBns('302');
    expect(byNumber.some((i) => i.ipc === '302')).toBe(true);
  });
});

describe('GET /api/ipc-bns', () => {
  const app = express();
  app.use('/api/ipc-bns', router);

  test('returns the reference map with a disclaimer', async () => {
    const res = await request(app).get('/api/ipc-bns');
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.meta.disclaimer).toMatch(/pending review|counsel|advocate/i);
  });

  test('filters by category', async () => {
    const res = await request(app)
      .get('/api/ipc-bns')
      .query({ category: 'Offences against property' });
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(res.body.items.every((i) => i.category === 'Offences against property')).toBe(true);
  });

  test('supports single-section lookup and 404s for unknown sections', async () => {
    const one = await request(app).get('/api/ipc-bns/420');
    expect(one.status).toBe(200);
    expect(one.body.item.bns).toBe('318');

    const missing = await request(app).get('/api/ipc-bns/9999');
    expect(missing.status).toBe(404);
  });
});
