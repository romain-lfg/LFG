'use client';

import { useParams } from 'next/navigation';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { useBounty } from '@/hooks/useBounty';
import BountySkeleton from '@/components/bounties/BountySkeleton';
import BountyError from '@/components/bounties/BountyError';

export default function BountyDetail() {
  const { id } = useParams();
  const {
    data: bounty,
    isLoading,
    error,
    refetch
  } = useBounty(decodeURIComponent(id as string));

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <BountySkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <BountyError onRetry={() => refetch()} />
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!bounty) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bounty Not Found</h1>
          <p className="text-gray-400">The bounty you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/bounties"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-8 group"
          >
            <IconArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Bounties</span>
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6">{bounty.title}</h1>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-300">{bounty.description}</p>
          </div>

          {/* Reward */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Reward</h2>
            <p className="text-gray-300">{bounty.reward} ETH</p>
          </div>

          {/* Required Skills */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {bounty.requirements.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-indigo-900/50 rounded-full text-indigo-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
