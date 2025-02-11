'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, Bounty } from '@/lib/api/client';
import CreateBountyModal from '@/components/bounties/CreateBountyModal';
import BountySkeleton from '@/components/bounties/BountySkeleton';
import BountyError from '@/components/bounties/BountyError';

export default function BountyBoard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadBounties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getBounties();
      setBounties(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load bounties'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBounties();
    const intervalId = setInterval(loadBounties, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, []);

  const handleCreateBounty = async (bounty: Bounty) => {
    try {
      await apiClient.createBounty(bounty);
      await loadBounties(); // Refresh the list
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create bounty:', err);
    }
  };

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
              Find the perfect bounty for your skills and earn rewards
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Post a Bounty
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
                <BountyError onRetry={loadBounties} />
              </div>
            )}

            {/* Data State */}
            {!isLoading && !error && bounties.map((bounty) => (
              <Link
                key={bounty.title}
                href={`/bounties/${encodeURIComponent(bounty.title)}`}
                className="block p-6 rounded-xl border border-indigo-900/50 bg-indigo-950/30 hover:border-indigo-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{bounty.title}</h3>
                    <p className="text-gray-400 line-clamp-2">{bounty.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <span>{bounty.reward} ETH</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {bounty.requirements.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-300"
                    >
                      {skill}
                    </span>
                  ))}
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
        onSubmit={handleCreateBounty}
      />