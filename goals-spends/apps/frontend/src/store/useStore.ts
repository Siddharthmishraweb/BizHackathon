import { create } from 'zustand';
import type { User, MarketItem, AIInsight } from '@/types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  marketData: MarketItem[];
  aiInsights: AIInsight[];
  sidebarCollapsed: boolean;
  setUser: (user: User) => void;
  setAuthenticated: (v: boolean) => void;
  setMarketData: (data: MarketItem[]) => void;
  setAIInsights: (data: AIInsight[]) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  marketData: [],
  aiInsights: [],
  sidebarCollapsed: false,
  setUser: (user) => set({ user }),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setMarketData: (data) => set({ marketData: data }),
  setAIInsights: (data) => set({ aiInsights: data }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
