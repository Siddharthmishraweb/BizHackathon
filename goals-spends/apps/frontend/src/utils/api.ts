import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authApi = {
  getUser: () => api.get('/auth/user'),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
  getNetWorthHistory: () => api.get('/dashboard/networth-history'),
  getCashFlow: () => api.get('/dashboard/cashflow'),
  getSpendingBreakdown: () => api.get('/dashboard/spending-breakdown'),
  getAIInsights: () => api.get('/dashboard/ai-insights'),
  getMarketData: () => api.get('/dashboard/market'),
};

export const portfolioApi = {
  getSummary: () => api.get('/portfolio/summary'),
  getHoldings: () => api.get('/portfolio/holdings'),
  getAllocation: () => api.get('/portfolio/allocation'),
};

export const transactionsApi = {
  getAll: (params?: Record<string, string>) => api.get('/transactions', { params }),
  getCategories: () => api.get('/transactions/categories'),
};

export const goalsApi = {
  getAll: () => api.get('/goals'),
  getById: (id: string) => api.get(`/goals/${id}`),
  contribute: (id: string, amount: number) => api.post(`/goals/${id}/contribute`, { amount }),
};

export const taxApi = {
  getSummary: () => api.get('/tax/summary'),
  getRecommendations: () => api.get('/tax/recommendations'),
};

export const insuranceApi = {
  getCoverage: () => api.get('/insurance/coverage'),
};

export const healthApi = {
  getScore: () => api.get('/health-score'),
};

export const investmentsApi = {
  getRecommendations: () => api.get('/investments/recommendations'),
};

export const aiApi = {
  chat: (message: string) => api.post('/ai/chat', { message }),
  getInsights: () => api.get('/ai/insights'),
};

export const toolsApi = {
  calculateFIRE: (data: object) => api.post('/tools/fire', data),
  calculateSIP: (data: object) => api.post('/tools/sip', data),
};

export default api;
