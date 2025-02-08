'use client';

import { useParams, useRouter } from 'next/navigation';
import { IconBrandGithub, IconClock, IconCalendar, IconTrophy, IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { FeatureGate } from '@/hooks/useFeature';
import { mockBounties } from '@/mocks/bounties';
import { Bounty } from '@/types/bounty';

export default function BountyDetail() {
  const { id } = useParams();
  const bounty = mockBounties.find(b => b.id === id) as Bounty;

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
      {/* Header Section */}
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
          {/* Status Badge */}
          <div className="mb-6">
            <span className="px-3 py-1 bg-indigo-900/50 rounded-full text-indigo-300 text-sm">
              {bounty.status}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-6">{bounty.title}</h1>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Reward */}
            <div className="p-4 rounded-xl border border-indigo-900/50 bg-indigo-950/30">
              <div className="flex items-center gap-2 mb-2">
                <IconTrophy className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-indigo-400">Reward</h3>
              </div>
              <p className="text-xl font-bold">
                {parseFloat(bounty.reward.amount) / 1e18} {bounty.reward.token}
              </p>
            </div>

            {/* Time Estimate */}
            <div className="p-4 rounded-xl border border-indigo-900/50 bg-indigo-950/30">
              <div className="flex items-center gap-2 mb-2">
                <IconClock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-indigo-400">Time Estimate</h3>
              </div>
              <p className="text-xl font-bold">
                {bounty.requirements.estimatedTimeInHours} hours
              </p>
            </div>

            {/* Deadline */}
            <div className="p-4 rounded-xl border border-indigo-900/50 bg-indigo-950/30">
              <div className="flex items-center gap-2 mb-2">
                <IconCalendar className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-indigo-400">Deadline</h3>
              </div>
              <p className="text-xl font-bold">
                {bounty.requirements.deadline ? 
                  new Date(bounty.requirements.deadline).toLocaleDateString() : 
                  'No deadline'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">{bounty.description}</p>
            </div>
          </div>

          {/* Skills Required */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {bounty.requirements.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-indigo-900/30 rounded-full text-indigo-300 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Completion Criteria */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Completion Criteria</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">{bounty.completionCriteria}</p>
            </div>
          </div>

          {/* Repository Link */}
          {bounty.repositoryUrl && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Repository</h2>
              <a
                href={bounty.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <IconBrandGithub className="h-5 w-5" />
                <span>View Repository</span>
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <FeatureGate 
              featurePath="bounties.apply"
              fallback={
                <button 
                  className="flex-1 bg-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                  disabled
                  title="Coming soon"
                >
                  Apply for Bounty (Coming Soon)
                </button>
              }
            >
              {bounty.status === 'open' && (
                <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Apply for Bounty
                </button>
              )}
            </FeatureGate>
            <FeatureGate
              featurePath="bounties.contact"
              fallback={
                <button 
                  className="flex-1 border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
                  disabled
                  title="Coming soon"
                >
                  Contact Creator (Coming Soon)
                </button>
              }
            >
              <button className="flex-1 border border-indigo-400 hover:bg-indigo-900/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Contact Creator
              </button>
            </FeatureGate>
          </div>
        </div>
      </div>
    </main>
  );
}
