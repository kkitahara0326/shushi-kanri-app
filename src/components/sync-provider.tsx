'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { initialSyncFromFirestore } from '@/lib/storage';

type SyncContextValue = { isSynced: boolean };

const SyncContext = createContext<SyncContextValue>({ isSynced: false });

export function useSync() {
  return useContext(SyncContext);
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isSynced, setSynced] = useState(false);

  useEffect(() => {
    initialSyncFromFirestore().then(() => setSynced(true));
  }, []);

  return <SyncContext.Provider value={{ isSynced }}>{children}</SyncContext.Provider>;
}
