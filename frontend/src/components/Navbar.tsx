import Link from 'next/link';
import { LoginButton } from './LoginButton';

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
              <Link
                href="/bounties"
                className="navbar-link"
              >
                Bounties
              </Link>
              <Link
                href="/dashboard"
                className="navbar-link"
              >
                Dashboard
              </Link>
              <LoginButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
