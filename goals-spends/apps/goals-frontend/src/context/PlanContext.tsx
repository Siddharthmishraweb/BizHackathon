import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { extractErrorMessage, fetchComprehensivePlan } from '@/api/client';
import { demoProfiles, defaultProfileId, type DemoProfile } from '@/data/profiles';
import { loadCustomGoals, saveCustomGoals, clearCustomGoals } from '@/utils/goalStorage';
import type { ComprehensivePlan, Goal, UserData } from '@/types';

interface PlanContextValue {
  profiles: DemoProfile[];
  activeProfile: DemoProfile;
  userData: UserData;
  plan: ComprehensivePlan | null;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectProfile: (profileId: string) => void;
  addGoal: (goal: Goal) => Promise<ComprehensivePlan>;
  deleteGoal: (goalName: string) => Promise<ComprehensivePlan>;
  resetGoals: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

function findProfile(id: string): DemoProfile {
  return demoProfiles.find((p) => p.id === id) ?? demoProfiles[0];
}

// Custom goals (added/deleted by the user) are layered on top of the bundled demo data —
// the rest of the profile (transactions, income, assets, liabilities) is never touched.
function buildUserData(profile: DemoProfile): UserData {
  const customGoals = loadCustomGoals(profile.id);
  return { ...profile.data, goals: customGoals ?? profile.data.goals };
}

export function PlanProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileId] = useState(defaultProfileId);
  const [userData, setUserData] = useState<UserData>(() => buildUserData(findProfile(defaultProfileId)));
  const [plan, setPlan] = useState<ComprehensivePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const mutatingRef = useRef(false);
  const requestIdRef = useRef(0);
  const [error, setError] = useState<string | null>(null);

  const activeProfile = findProfile(activeProfileId);

  const load = useCallback(async (data: UserData) => {
    const reqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await fetchComprehensivePlan(data);
      if (requestIdRef.current !== reqId) return; // a newer request/profile switch superseded this one
      setPlan(result);
    } catch (err) {
      if (requestIdRef.current !== reqId) return;
      setError(extractErrorMessage(err));
    } finally {
      if (requestIdRef.current === reqId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const data = buildUserData(findProfile(activeProfileId));
    setUserData(data);
    load(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProfileId]);

  const refresh = useCallback(() => load(userData), [load, userData]);

  const selectProfile = useCallback((profileId: string) => {
    setActiveProfileId(profileId);
  }, []);

  const addGoal = useCallback(
    async (goal: Goal) => {
      if (mutatingRef.current) throw new Error('Still saving your last change — try again in a moment.');
      if (userData.goals.some((g) => g.name.trim().toLowerCase() === goal.name.trim().toLowerCase())) {
        throw new Error(`A goal named "${goal.name}" already exists — pick a different name.`);
      }
      const updated: UserData = { ...userData, goals: [...userData.goals, goal] };
      const reqId = ++requestIdRef.current;
      mutatingRef.current = true;
      setMutating(true);
      try {
        const newPlan = await fetchComprehensivePlan(updated);
        if (requestIdRef.current === reqId) {
          setUserData(updated);
          setPlan(newPlan);
          saveCustomGoals(activeProfileId, updated.goals);
        }
        return newPlan;
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      } finally {
        mutatingRef.current = false;
        if (requestIdRef.current === reqId) setMutating(false);
      }
    },
    [userData, activeProfileId]
  );

  const deleteGoal = useCallback(
    async (goalName: string) => {
      if (mutatingRef.current) throw new Error('Still saving your last change — try again in a moment.');
      const updated: UserData = { ...userData, goals: userData.goals.filter((g) => g.name !== goalName) };
      const reqId = ++requestIdRef.current;
      mutatingRef.current = true;
      setMutating(true);
      try {
        const newPlan = await fetchComprehensivePlan(updated);
        if (requestIdRef.current === reqId) {
          setUserData(updated);
          setPlan(newPlan);
          saveCustomGoals(activeProfileId, updated.goals);
        }
        return newPlan;
      } catch (err) {
        throw new Error(extractErrorMessage(err));
      } finally {
        mutatingRef.current = false;
        if (requestIdRef.current === reqId) setMutating(false);
      }
    },
    [userData, activeProfileId]
  );

  const resetGoals = useCallback(async () => {
    clearCustomGoals(activeProfileId);
    const data = buildUserData(activeProfile);
    setUserData(data);
    await load(data);
  }, [activeProfileId, activeProfile, load]);

  const value = useMemo(
    () => ({
      profiles: demoProfiles,
      activeProfile,
      userData,
      plan,
      loading,
      mutating,
      error,
      refresh,
      selectProfile,
      addGoal,
      deleteGoal,
      resetGoals,
    }),
    [activeProfile, userData, plan, loading, mutating, error, refresh, selectProfile, addGoal, deleteGoal, resetGoals]
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within a PlanProvider');
  return ctx;
}

