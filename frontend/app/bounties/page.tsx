'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBounties } from '@/hooks/useBounties';
import { useFeature } from '@/hooks/useFeature';
import { mockBounties } from '@/mocks/bounties';
import CreateBountyModal from '@/components/bounties/CreateBountyModal';
import BountySkeleton from '@/components/bounties/BountySkeleton';
import BountyError from '@/components/bounties/BountyError';

export default function BountyBoard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isNillionEnabled = useFeature('nillion.enabled');
  
  const {
    data: bountyData,
    isLoading,
    error,
    refetch
  } = useBounties();

  // Use Nillion data if enabled, otherwise fall back to mock data
  const bounties = isNillionEnabled ? bountyData?.items : mockBounties;
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header Section */}
      <section className="pt-24 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-3 py-1 border border-indigo-400 rounded-full text-indigo-400 text-sm">
              Explore Opportunities
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
              Available Bounties
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-12">
              Find the perfect bounty for your skills and earn rewards through our VSA platform
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Post a Bounty
              </button>
              <button className="border border-indigo-400 hover:bg-indigo-900/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Filter Bounties
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bounties Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Loading State */}
            {isLoading && (
              <>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <BountySkeleton key={i} />
                ))}
              </>
            )}

            {/* Error State */}
            {error && (
              <div className="col-span-full">
                <BountyError onRetry={() => refetch()} />
              </div>
            )}

            {/* Data State */}
            {!isLoading && !error && bounties?.map((bounty) => (
              <Link
                key={bounty.id}
                href={`/bounties/${bounty.id}`}
                className="flex flex-col p-6 rounded-xl border border-indigo-900/50 bg-gradient-to-b from-indigo-950/50 to-transparent hover:border-indigo-500/50 transition-colors min-h-[24rem] group"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{bounty.title}</h3>
                    <span className="px-3 py-1 bg-indigo-900/50 rounded-full text-indigo-300 text-sm">
                      {bounty.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4 line-clamp-2">{bounty.description}</p>
                  
                  {/* Skills Required */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2">Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {bounty.requirements.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-indigo-900/30 rounded-md text-indigo-300 text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reward */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-indigo-400 mb-2">Reward</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white">
                        {parseFloat(bounty.reward.amount) / 1e18} {bounty.reward.token}
                      </span>
                    </div>
                  </div>

                  {/* Time Estimate */}
                  {bounty.requirements.estimatedTimeInHours && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-2">Estimated Time</h4>
                      <span className="text-gray-300">
                        {bounty.requirements.estimatedTimeInHours} hours
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-indigo-900/30">
                  <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-700 group-hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all text-center">
                    View Details
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Create Bounty Modal */}
      <CreateBountyModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </main>
  );
}
