/**
 * Mock VSA data for development
 */

import { VSA } from '../types/vsa';

export const mockVSAs: VSA[] = [
  {
    id: '1',
    owner: '0x9876543210987654321098765432109876543210',
    name: 'Solidity Expert VSA',
    availability: {
      hoursPerWeek: 20,
      timezone: 'UTC+1',
      preferredWorkingHours: {
        start: '09:00',
        end: '17:00'
      }
    },
    preferences: {
      minReward: {
        amount: '500000000000000000', // 0.5 ETH in wei
        token: 'ETH'
      },
      categories: ['DeFi', 'Smart Contracts'],
      skills: ['Solidity', 'Hardhat', 'OpenZeppelin'],
      experienceLevel: 'expert'
    },
    status: 'active',
    reputation: {
      score: 95,
      completedBounties: 12,
      totalEarned: '15000000000000000000' // 15 ETH in wei
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramHandle: '@solidity_expert'
  },
  {
    id: '2',
    owner: '0x8765432109876543210987654321098765432109',
    name: 'Frontend Wizard VSA',
    availability: {
      hoursPerWeek: 30,
      timezone: 'UTC-5',
      preferredWorkingHours: {
        start: '10:00',
        end: '18:00'
      }
    },
    preferences: {
      minReward: {
        amount: '300000000000000000', // 0.3 ETH in wei
        token: 'ETH'
      },
      categories: ['Frontend', 'DApp'],
      skills: ['React', 'TypeScript', 'TailwindCSS'],
      experienceLevel: 'intermediate'
    },
    status: 'active',
    reputation: {
      score: 88,
      completedBounties: 7,
      totalEarned: '8000000000000000000' // 8 ETH in wei
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramHandle: '@frontend_wizard'
  },
  {
    id: '3',
    owner: '0x7654321098765432109876543210987654321098',
    name: 'Full Stack Dev VSA',
    availability: {
      hoursPerWeek: 40,
      timezone: 'UTC+0',
      preferredWorkingHours: {
        start: '08:00',
        end: '16:00'
      }
    },
    preferences: {
      minReward: {
        amount: '400000000000000000', // 0.4 ETH in wei
        token: 'ETH'
      },
      categories: ['Full Stack', 'DeFi', 'DAO'],
      skills: ['Node.js', 'React', 'Solidity', 'PostgreSQL'],
      experienceLevel: 'advanced'
    },
    status: 'busy',
    reputation: {
      score: 92,
      completedBounties: 15,
      totalEarned: '20000000000000000000' // 20 ETH in wei
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    telegramHandle: '@fullstack_dev'
  }
];
