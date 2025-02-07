'use client';

import { useState } from 'react';
import { IconBriefcase, IconCheck, IconClock, IconHourglass } from '@tabler/icons-react';

type BountyStatus = 'active' | 'applied' | 'completed';

const bounties = [
  {
    id: 1,
    title: 'Smart Contract Security Review',
    description: 'Perform a security audit of our new DeFi protocol smart contracts. Looking for vulnerabilities and potential optimizations.',
    reward: '0.8 ETH',
    status: 'active' as BountyStatus,
    timeLeft: '3 days',
    skills: ['Solidity', 'Security', 'DeFi'],
  },
  {
    id: 2,
    title: 'Frontend Bug Fix',
    description: 'Fix rendering issues in our dApp dashboard. Issues with MetaMask connection and transaction history display.',
    reward: '0.3 ETH',
    status: 'completed' as BountyStatus,
    completedDate: '1 day ago',
    skills: ['React', 'Web3', 'TypeScript'],
    rating: 5,
  },
  {
    id: 3,
    title: 'API Integration',
    description: 'Integrate our smart contracts with The Graph for better data indexing and querying capabilities.',
    reward: '0.7 ETH',
    status: 'completed' as BountyStatus,
    completedDate: '3 days ago',
    skills: ['GraphQL', 'Node.js', 'Ethereum'],
    rating: 4,
  },
  {
    id: 4,
    title: 'NFT Marketplace Feature',
    description: 'Add batch minting functionality to our NFT marketplace. Should support ERC-721 and ERC-1155 tokens.',
    reward: '1.2 ETH',
    status: 'applied' as BountyStatus,
    appliedDate: '2 days ago',
    skills: ['Solidity', 'NFT', 'React'],
  },
];

const getStatusColor = (status: BountyStatus) => {
  switch (status) {
    case 'active':
      return 'bg-indigo-400/10 text-indigo-400';
    case 'applied':
      return 'bg-yellow-400/10 text-yellow-400';
    case 'completed':
      return 'bg-emerald-400/10 text-emerald-400';
  }
};

const getStatusLabel = (status: BountyStatus) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'applied':
      return 'Applied';
    case 'completed':
      return 'Completed';
  }
};

export default function BountiesPage() {
  const [filter, setFilter] = useState<'all' | BountyStatus>('all');
  
  const filteredBounties = bounties.filter(bounty => {
    if (filter === 'all') return true;
    return bounty.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-2">
        {(['all', 'active', 'applied', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === status
                ? 'bg-white/[0.06] text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Bounties Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredBounties.map((bounty) => (
          <div
            key={bounty.id}
            className="relative group rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20 hover:border-white/[0.1] transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{bounty.title}</h3>
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">{bounty.description}</p>
              </div>
              <div className="flex items-center">
                <div className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bounty.status)}`}>
                  {getStatusLabel(bounty.status)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {bounty.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 rounded-md text-xs font-medium bg-white/[0.06] text-gray-300"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-300">
                <IconBriefcase className="h-4 w-4 mr-1" />
                {bounty.reward}
              </div>
              {bounty.status === 'active' && (
                <div className="flex items-center text-gray-300">
                  <IconClock className="h-4 w-4 mr-1" />
                  {bounty.timeLeft} left
                </div>
              )}
              {bounty.status === 'applied' && (
                <div className="flex items-center text-gray-300">
                  <IconHourglass className="h-4 w-4 mr-1" />
                  Applied {bounty.appliedDate}
                </div>
              )}
              {bounty.status === 'completed' && (
                <div className="flex items-center text-gray-300">
                  <IconCheck className="h-4 w-4 mr-1" />
                  Completed {bounty.completedDate}
                </div>
              )}
            </div>

            {bounty.status === 'completed' && bounty.rating && (
              <div className="mt-4 text-sm text-gray-300">
                Rating: {bounty.rating} / 5
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
