import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ModelProvider, EntitlementSource, UsageMetrics, AppSettings } from '@/types';

type AppState = {
  proEntitled: boolean;
  entitlementSource: EntitlementSource;
  daily: UsageMetrics;
  settings: AppSettings;
  
  setEntitlement: (entitled: boolean, source: EntitlementSource) => void;
  incrementUsage: (type: 'chat' | 'prompt' | 'fileSummary') => void;
  checkAndResetDaily: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  canUseFeature: (feature: 'chat' | 'prompt' | 'fileSummary' | 'voice' | 'memory') => boolean;
};

const getNextMidnight = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      proEntitled: false,
      entitlementSource: null,
      daily: {
        chatCount: 0,
        promptCount: 0,
        fileSummaryCount: 0,
        resetAtISO: getNextMidnight(),
      },
      settings: {
        provider: 'openai',
        memoryEnabled: false,
        voiceEnabled: false,
      },

      setEntitlement: (entitled, source) => {
        set({ proEntitled: entitled, entitlementSource: source });
      },

      incrementUsage: (type) => {
        const state = get();
        state.checkAndResetDaily();
        
        set((state) => ({
          daily: {
            ...state.daily,
            chatCount: type === 'chat' ? state.daily.chatCount + 1 : state.daily.chatCount,
            promptCount: type === 'prompt' ? state.daily.promptCount + 1 : state.daily.promptCount,
            fileSummaryCount: type === 'fileSummary' ? state.daily.fileSummaryCount + 1 : state.daily.fileSummaryCount,
          },
        }));
      },

      checkAndResetDaily: () => {
        const state = get();
        const now = new Date();
        const resetAt = new Date(state.daily.resetAtISO);

        if (now >= resetAt) {
          set({
            daily: {
              chatCount: 0,
              promptCount: 0,
              fileSummaryCount: 0,
              resetAtISO: getNextMidnight(),
            },
          });
        }
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      canUseFeature: (feature) => {
        const state = get();
        
        if (state.proEntitled) {
          return true;
        }

        switch (feature) {
          case 'chat':
            return state.daily.chatCount < 10;
          case 'prompt':
            return state.daily.promptCount < 3;
          case 'fileSummary':
            return state.daily.fileSummaryCount < 2;
          case 'voice':
          case 'memory':
            return false;
          default:
            return false;
        }
      },
    }),
    {
      name: 'briefly-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
