'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IconHome,
  IconBriefcase,
  IconRobot,
  IconPlus,
  IconChartBar
} from '@tabler/icons-react';
import CreateBountyModal from '@/components/bounties/CreateBountyModal';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: IconHome },
  { name: 'Bounties', href: '/dashboard/bounties', icon: IconBriefcase },
  { name: 'VSA Profile', href: '/dashboard/profile', icon: IconRobot },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex">
      {/* Side Navigation */}
      <nav className="fixed inset-y-0 left-0 w-64 z-50 bg-gray-900/50 backdrop-blur-xl border-r border-white/[0.05] flex flex-col">
        <div className="flex h-16 shrink-0 items-center px-4 border-b border-white/[0.05]">
          <div className="container">
            <Link 
              href="/"
              className="flex items-center text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text hover:from-indigo-300 hover:to-purple-400 transition-all"
            >
              LFG
            </Link>
          </div>
        </div>
        <div className="px-2 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group relative flex items-center gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 mb-1
                  ${isActive 
                    ? 'text-white bg-white/[0.06]' 
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <Icon 
                  className={`h-5 w-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`} 
                  aria-hidden="true" 
                />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="navbar-button w-full flex items-center justify-center gap-x-2"
          >
            <IconPlus className="h-5 w-5" />
            Create Bounty
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        <div className="sticky top-0 z-40 h-16 bg-gray-900/50 backdrop-blur-xl border-b border-white/[0.05]">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-white">
              {navigation.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                <span className="text-sm text-gray-300">VSA Active</span>
              </div>
              <div className="text-sm text-gray-300">
                0x742...3ab4
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Create Bounty Modal */}
      <CreateBountyModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
