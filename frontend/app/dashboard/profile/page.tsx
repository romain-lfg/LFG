'use client';

import { useState } from 'react';
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">VSA Profile</h1>
          <p className="text-gray-300 mt-1">Configure your Virtual Synergy Agent</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 rounded-lg bg-white/[0.06] text-white hover:bg-white/[0.12] transition-all"
        >
          <IconSettings className="h-5 w-5" />
        </button>
      </div>

      {/* Status Card */}
      <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-600/20 to-purple-600/20 flex items-center justify-center">
              <IconCpu className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">VSA Status</h2>
              <p className="text-gray-300">Last active {vsaProfile.lastActive}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            vsaProfile.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-yellow-400/10 text-yellow-400'
          }`}>
            {vsaProfile.status.charAt(0).toUpperCase() + vsaProfile.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <IconBrain className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-medium text-white">Skills & Experience</h2>
          </div>
          {isEditing && (
            <button className="px-3 py-1 rounded-lg bg-white/[0.06] text-white hover:bg-white/[0.12] transition-all flex items-center space-x-1">
              <IconPlus className="h-4 w-4" />
              <span>Add Skill</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vsaProfile.skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div>
                <h3 className="font-medium text-white">{skill.name}</h3>
                <p className="text-sm text-gray-300">{skill.level} · {skill.years} years</p>
              </div>
              {isEditing && (
                <button className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-300 hover:text-white transition-all">
                  <IconX className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20">
        <div className="flex items-center space-x-2 mb-6">
          <IconCode className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Tech Stack</h2>
        </div>
        <div className="space-y-6">
          {Object.entries(vsaProfile.techStack).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-gray-300 mb-3 capitalize">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full text-sm bg-white/[0.06] text-gray-300"
                  >
                    {item}
                  </span>
                ))}
                {isEditing && (
                  <button className="px-3 py-1 rounded-full bg-white/[0.06] text-gray-300 hover:bg-white/[0.12] hover:text-white transition-all flex items-center space-x-1">
                    <IconPlus className="h-3 w-3" />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20">
        <div className="flex items-center space-x-2 mb-6">
          <IconSettings className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-medium text-white">Preferences</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Bounty Preferences</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300">Minimum Bounty Value</label>
                <input
                  type="number"
                  value={vsaProfile.preferences.minBountyValue}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.5 ETH"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300">Max Concurrent Bounties</label>
                <input
                  type="number"
                  value={vsaProfile.preferences.maxConcurrentBounties}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="2"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Working Hours</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-300">Start Time</label>
                  <input
                    type="time"
                    value={vsaProfile.preferences.workingHours.start}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">End Time</label>
                  <input
                    type="time"
                    value={vsaProfile.preferences.workingHours.end}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-300">Timezone</label>
                <input
                  type="text"
                  value={vsaProfile.preferences.workingHours.timezone}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="UTC+1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
