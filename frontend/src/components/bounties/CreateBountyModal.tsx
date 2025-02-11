'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { Bounty } from '@/lib/api/client';

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bounty: Bounty) => void;
}

export default function CreateBountyModal({ isOpen, onClose, onSubmit }: CreateBountyModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [reward, setReward] = useState('');
  const [customRequirement, setCustomRequirement] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bounty: Bounty = {
      title,
      description,
      requirements,
      reward: parseFloat(reward),
    };
    onSubmit(bounty);
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setRequirements([]);
    setReward('');
    onClose();
  };

  const handleRequirementToggle = (requirement: string) => {
    setRequirements(prev => 
      prev.includes(requirement)
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    );
  };

  const handleCustomRequirementAdd = () => {
    if (customRequirement && !requirements.includes(customRequirement)) {
      setRequirements(prev => [...prev, customRequirement]);
      setCustomRequirement('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-gray-900/90 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.05]">
            <h2 className="text-xl font-semibold text-white">Create New Bounty</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Smart Contract Security Review"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the bounty requirements and expectations..."
                required
              />
            </div>

            {/* Reward */}
            <div>
              <label htmlFor="reward" className="block text-sm font-medium text-gray-300">
                Reward (ETH)
              </label>
              <input
                type="number"
                id="reward"
                value={reward}
                onChange={e => setReward(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.1"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Requirements
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Solidity', 'Smart Contracts', 'Security', 'DeFi', 'NFT', 'Web3.js', 'React', 'Node.js'].map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleRequirementToggle(skill)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      requirements.includes(skill)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customRequirement}
                  onChange={e => setCustomRequirement(e.target.value)}
                  className="flex-1 rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add custom requirement..."
                />
                <button
                  type="button"
                  onClick={handleCustomRequirementAdd}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Bounty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
