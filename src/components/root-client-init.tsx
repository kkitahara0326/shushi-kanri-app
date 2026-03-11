'use client';

import { useEffect } from 'react';
import { initialSyncFromFirestore } from '@/lib/storage';

export function RootClientInit() {
  useEffect(() => {
    void initialSyncFromFirestore();
  }, []);

  return null;
}

