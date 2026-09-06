import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Portfolio from '@/pages/Portfolio';
import Transactions from '@/pages/Transactions';
import Goals from '@/pages/Goals';
import TaxOptimizer from '@/pages/TaxOptimizer';
import Insurance from '@/pages/Insurance';
import AIAdvisor from '@/pages/AIAdvisor';
import Investments from '@/pages/Investments';
import Profile from '@/pages/Profile';

function App() {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/tax" element={<TaxOptimizer />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
