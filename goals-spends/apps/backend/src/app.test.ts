import request from 'supertest';
import app from './app';
import { loadCanonicalUserData, estimateMonthlyExpenses } from './data/canonicalUser';

describe('estimateMonthlyExpenses', () => {
  it('normalizes by the actual date range instead of summing every transaction as if it were one month', () => {
    const canonical = loadCanonicalUserData();
    const monthlyExpenses = estimateMonthlyExpenses(canonical);
    const totalAcrossAllMonths = canonical.transactions.reduce((sum, t) => sum + t.amount, 0);

    // The canonical dataset spans many months of transactions; a correct monthly figure
    // must be a small fraction of the raw multi-month sum, not (accidentally) equal to it.
    expect(monthlyExpenses).toBeLessThan(totalAcrossAllMonths / 2);
    expect(monthlyExpenses).toBeGreaterThan(0);
  });
});

describe('GET /health', () => {
  it('reports service liveness', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('GET /api/auth/user', () => {
  it('returns a user whose identity matches the canonical dataset', async () => {
    const canonical = loadCanonicalUserData();
    const res = await request(app).get('/api/auth/user');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(canonical.email);
    expect(res.body.data.id).toBe(canonical.user_id);
  });
});

describe('GET /api/goals', () => {
  it('returns one goal per canonical goal, with matching amounts and deadlines', async () => {
    const canonical = loadCanonicalUserData();
    const res = await request(app).get('/api/goals');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(canonical.goals.length);

    const byName = Object.fromEntries(res.body.data.map((g: any) => [g.name, g]));
    for (const canonicalGoal of canonical.goals) {
      expect(byName[canonicalGoal.name]).toBeDefined();
      expect(byName[canonicalGoal.name].targetAmount).toBe(canonicalGoal.target_amount);
      expect(byName[canonicalGoal.name].currentAmount).toBe(canonicalGoal.current_amount);
      expect(byName[canonicalGoal.name].targetDate).toBe(canonicalGoal.deadline);
    }
  });
});

describe('GET /api/goals/:id', () => {
  it('404s for an unknown goal id', async () => {
    const res = await request(app).get('/api/goals/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('200s for a known goal id', async () => {
    const list = await request(app).get('/api/goals');
    const firstId = list.body.data[0].id;

    const res = await request(app).get(`/api/goals/${firstId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(firstId);
  });
});

describe('POST /api/goals/:id/contribute', () => {
  it('adds the contributed amount to currentAmount and recomputes progress', async () => {
    const list = await request(app).get('/api/goals');
    const goal = list.body.data[0];

    const res = await request(app).post(`/api/goals/${goal.id}/contribute`).send({ amount: 1000 });

    expect(res.status).toBe(200);
    expect(res.body.data.currentAmount).toBe(goal.currentAmount + 1000);
    expect(res.body.data.progress).toBeCloseTo((res.body.data.currentAmount / goal.targetAmount) * 100, 1);
  });
});

describe('GET /api/dashboard/summary', () => {
  it('returns numeric headline figures', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.netWorth).toBe('number');
    expect(typeof res.body.data.monthlyIncome).toBe('number');
  });
});
