'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, Fragment } from 'react';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  
  // We want to render children on all pages
  // This component just prevents duplicate rendering
  return <Fragment>{children}</Fragment>;
}
