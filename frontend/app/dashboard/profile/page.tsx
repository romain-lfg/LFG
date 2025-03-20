'use client';

import { useState, useEffect } from 'react';
import { IconBrain, IconCode, IconCpu, IconSettings, IconPlus, IconX } from '@tabler/icons-react';

// Mock data - this would come from your backend
const vsaProfile = {
  status: 'active',
  lastActive: '2 minutes ago',
  skills: [
    { name: 'React', level: 'Expert', years: 4 },
    { name: 'TypeScript', level: 'Expert', years: 3 },
    { name: 'Solidity', level: 'Intermediate', years: 2 },
    { name: 'Node.js', level: 'Advanced', years: 4 },
    { name: 'Web3.js', level: 'Advanced', years: 2 },
  ],
  preferences: {
    minBountyValue: 0.5,
    maxConcurrentBounties: 2,
    preferredChains: ['Ethereum', 'Polygon', 'Arbitrum'],
    workingHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'UTC+1',
    },
  },
  techStack: {
    frameworks: ['Next.js', 'Hardhat', 'Express'],
    languages: ['JavaScript', 'TypeScript', 'Solidity', 'Python'],
    tools: ['Git', 'Docker', 'AWS'],
  },
};

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
const skillLevels: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function VSAProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render on client-side to avoid SSR issues with auth context
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Return a loading state during SSR
  if (!isMounted) {
    return <div className="max-w-7xl mx-auto space-y-6">Loading profile...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Static content for build */}
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-white">VSA Profile</h2>
        <p className="text-gray-400 mt-2">This is a static version for build purposes.</p>
        <p className="text-gray-400 mt-2">The actual profile will be loaded at runtime.</p>
      </div>
    </div>
  );
}
