'use client';

import { ReactNode } from 'react';
import { AppPrivyProvider } from '@/providers/PrivyProvider';
import QueryProvider from '@/providers/QueryProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AppPrivyProvider>
        {children}
      </AppPrivyProvider>
    </QueryProvider>
  );
}
