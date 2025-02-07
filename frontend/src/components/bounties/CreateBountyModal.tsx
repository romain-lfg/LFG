'use client';

import { useState } from 'react';
import { 
  IconX, 
  IconCurrencyEthereum, 
  IconPlus, 
  IconChevronDown,
  IconWallet,
  IconClock,
  IconCheck,
  IconBrandGithub
} from '@tabler/icons-react';

interface CreateBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Popular skills shown by default
const popularSkills = [
  'React', 'TypeScript', 'Solidity', 'Node.js', 'Web3.js', 'GraphQL',
  'Smart Contracts', 'DeFi', 'NFT', 'Security',
];

// Additional skills in dropdown
const additionalSkills = [
  'Python', 'Rust', 'Go', 'AWS', 'Docker', 'Kubernetes',
  'Testing', 'DevOps', 'CI/CD', 'MongoDB', 'PostgreSQL',
  'Redis', 'Machine Learning', 'AI', 'Data Science',
];



export default function CreateBountyModal({ isOpen, onClose }: CreateBountyModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    reward: {
      amount: '',
      token: 'ETH',
      chainId: 1, // Ethereum Mainnet
    },
    requirements: {
      skills: [] as string[],
      estimatedTimeInHours: '',
      deadline: '',
    },
    completionCriteria: '',
    repositoryUrl: '',
  });
  
  // Mock wallet connection - replace with actual wallet integration
  const [walletAddress, setWalletAddress] = useState('0x742...3ab4');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'approving' | 'sending' | 'done'>('idle');

  if (!isOpen) return null;

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      
      // Update form requirements.skills
      setForm(prevForm => ({
        ...prevForm,
        requirements: {
          ...prevForm.requirements,
          skills: newSkills
        }
      }));
      
      return newSkills;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Approve escrow contract to spend ETH
      setSubmitStatus('approving');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock approval
      
      // 2. Send ETH to escrow and create bounty
      setSubmitStatus('sending');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock transaction
      
      // 3. Success
      setSubmitStatus('done');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Show success state
      
      onClose();
    } catch (error) {
      console.error('Error creating bounty:', error);
      // TODO: Show error message
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('idle');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div 
        className="relative min-h-screen flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
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
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
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
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the bounty requirements and expectations..."
                required
              />
            </div>

            {/* Connected Wallet */}
            <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center space-x-3">
                <IconWallet className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-white">Connected Wallet</div>
                  <div className="text-sm text-gray-400">{walletAddress}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                <span className="text-sm text-gray-300">Connected</span>
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Required Skills
              </label>
              <div className="space-y-3">
                {/* Popular skills */}
                <div className="flex flex-wrap gap-2">
                  {popularSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedSkills.includes(skill)
                          ? 'bg-indigo-400/20 text-indigo-400 ring-1 ring-indigo-400/30'
                          : 'bg-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.12]'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>

                {/* More skills dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsSkillsDropdownOpen(!isSkillsDropdownOpen)}
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.12] transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center">
                      <IconPlus className="h-4 w-4 mr-2" />
                      Add More Skills
                    </span>
                    <IconChevronDown className={`h-4 w-4 transition-transform ${isSkillsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isSkillsDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full rounded-lg bg-gray-800 border border-white/[0.05] shadow-lg">
                      <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                        {additionalSkills.map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleSkillToggle(skill)}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                              selectedSkills.includes(skill)
                                ? 'bg-indigo-400/20 text-indigo-400'
                                : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Completion Criteria */}
            <div>
              <label htmlFor="completionCriteria" className="block text-sm font-medium text-gray-300">
                Completion Criteria
              </label>
              <textarea
                id="completionCriteria"
                value={form.completionCriteria}
                onChange={e => setForm(prev => ({ ...prev, completionCriteria: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., PR merged to main branch, all tests passing"
                required
              />
            </div>

            {/* Repository URL */}
            <div>
              <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-300">
                Repository URL
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <IconBrandGithub className="h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="repositoryUrl"
                  value={form.repositoryUrl}
                  onChange={e => setForm(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                  className="flex-1 rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-300">
                Estimated Hours
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <input
                  type="number"
                  id="estimatedHours"
                  value={form.requirements.estimatedTimeInHours}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    requirements: {
                      ...prev.requirements,
                      estimatedTimeInHours: e.target.value
                    }
                  }))}
                  className="block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="40"
                  min="1"
                  step="1"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-400">hrs</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Enter the estimated time to complete this bounty in hours
              </p>
            </div>

            {/* Reward */}
            <div>
              <label htmlFor="reward" className="block text-sm font-medium text-gray-300">
                Reward (ETH)
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconCurrencyEthereum className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="reward"
                  value={form.reward}
                  onChange={e => setForm(prev => ({ ...prev, reward: e.target.value }))}
                  className="block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-300">
                Deadline
              </label>
              <input
                type="datetime-local"
                id="deadline"
                value={form.deadline}
                onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value }))}
                className="mt-1 block w-full rounded-lg bg-white/[0.06] border border-white/[0.05] px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium 
                  ${!isSubmitting ? 'hover:from-indigo-500 hover:to-purple-500' : 'opacity-80 cursor-not-allowed'}
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  flex items-center space-x-2
                `}
              >
                {submitStatus === 'idle' && (
                  <>
                    <IconPlus className="h-4 w-4" />
                    <span>Create Bounty</span>
                  </>
                )}
                {submitStatus === 'approving' && (
                  <>
                    <span>Approving...</span>
                    <IconWallet className="h-4 w-4 animate-pulse" />
                  </>
                )}
                {submitStatus === 'sending' && (
                  <>
                    <span>Creating Bounty...</span>
                    <IconClock className="h-4 w-4 animate-spin" />
                  </>
                )}
                {submitStatus === 'done' && (
                  <>
                    <span>Bounty Created!</span>
                    <IconCheck className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
