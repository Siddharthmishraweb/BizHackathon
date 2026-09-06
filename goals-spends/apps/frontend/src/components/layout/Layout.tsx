import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { authApi } from '@/utils/api';
import Sidebar from './Sidebar';
import Header from './Header';
import type { User } from '@/types';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sidebarCollapsed, setUser } = useStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getUser() as any;
        if (res.success) setUser(res.data as User);
      } catch { /* ignore */ }
    };
    fetchUser();
  }, [setUser]);

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orbs */}
      <div className="bg-orb w-96 h-96 top-0 left-1/4" style={{ background: '#6366f1' }} />
      <div className="bg-orb w-80 h-80 bottom-0 right-1/4" style={{ background: '#8b5cf6' }} />
      <div className="bg-orb w-64 h-64 top-1/2 right-0" style={{ background: '#06b6d4' }} />

      <Sidebar />

      {/* Main content */}
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 flex flex-col min-h-screen min-w-0"
      >
        <Header />
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}
