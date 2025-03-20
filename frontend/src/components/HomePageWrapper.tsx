'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface HomePageWrapperProps {
  children: ReactNode;
}

export default function HomePageWrapper({ children }: HomePageWrapperProps) {
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // Only render the home page content when we're actually on the home page route
    // This prevents the home page from appearing on other pages
    setShouldRender(pathname === '/');
  }, [pathname]);
  
  // Using this approach ensures that the component is only rendered client-side
  // after the pathname has been properly determined
  return shouldRender ? children : null;
}
