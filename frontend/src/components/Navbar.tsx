'use client';

import Link from 'next/link';
import { LoginButton, LogoutButton, UserProfile, AuthStatus } from '@/components/auth';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
      <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text hover:from-indigo-300 hover:to-purple-400 transition-all"
            >
              LFG
            </Link>
            <div className="flex items-center space-x-8">
              {/* Public links - always visible */}
              <Link
                href="/bounties"
                className="navbar-link"
              >
                Bounties
              </Link>
              
              {/* Authenticated-only links with AuthStatus component */}
              <AuthStatus 
                authenticatedComponent={
                  <Link href="/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                }
              />
              
              {/* User profile for authenticated users */}
              <AuthStatus 
                authenticatedComponent={<UserProfile showEmail={false} />}
              />
              
              {/* Login/Logout buttons */}
              <LoginButton>
                Get Started
              </LoginButton>
              
              <LogoutButton variant="secondary">
                Disconnect
              </LogoutButton>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
