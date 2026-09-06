import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlanProvider, usePlan } from '@/context/PlanContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastViewport } from '@/components/ui/Toast';
import { Layout } from '@/components/layout/Layout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Dashboard } from '@/pages/Dashboard';
import { Goals } from '@/pages/Goals';
import { Forecast } from '@/pages/Forecast';
import { Recommendations } from '@/pages/Recommendations';
import { Simulator } from '@/pages/Simulator';
import { Insights } from '@/pages/Insights';
import { WhatIf } from '@/pages/WhatIf';

function AppShell() {
  const { plan, loading, error, refresh } = usePlan();

  if (loading && !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-axis-gradient-soft">
        <LoadingScreen />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-axis-gradient-soft px-4">
        <ErrorBanner message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/whatif" element={<WhatIf />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <PlanProvider>
      <ToastProvider>
        <AppShell />
        <ToastViewport />
      </ToastProvider>
    </PlanProvider>
  );
}
