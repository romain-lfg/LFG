import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 to-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text"
          >
            LFG
          </Link>
          <div className="flex items-center space-x-6">
            <Link
              href="/bounties"
              className="text-white hover:text-indigo-400 transition-colors"
            >
              Bounties
            </Link>
            <Link
              href="/dashboard"
              className="text-white hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
