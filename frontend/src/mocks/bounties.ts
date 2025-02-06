/**
 * Mock bounty data for development
 */

import { Bounty } from '../types/bounty';

export const mockBounties: Bounty[] = [
  {
    id: '1',
    title: 'Implement Smart Contract Testing Suite',
    description: 'Create a comprehensive testing suite for our escrow smart contract using Hardhat and Chai.',
    reward: {
      amount: '500000000000000000', // 0.5 ETH in wei
      token: 'ETH',
      chainId: 11155111 // Sepolia
    },
    requirements: {
      skills: ['Solidity', 'Hardhat', 'Testing'],
      experienceLevel: 'intermediate',
      estimatedTimeInHours: 20,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    },
    status: 'open',
    createdBy: '0x1234567890123456789012345678901234567890',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionCriteria: 'All tests passing with 95%+ coverage',
    repositoryUrl: 'https://github.com/example/smart-contracts'
  },
  {
    id: '2',
    title: 'Build Telegram Bot Integration',
    description: 'Develop a Telegram bot that allows users to interact with their VSAs and receive notifications.',
    reward: {
      amount: '1000000000000000000', // 1 ETH in wei
      token: 'ETH',
      chainId: 11155111 // Sepolia
    },
    requirements: {
      skills: ['Node.js', 'Telegram API', 'TypeScript'],
      experienceLevel: 'intermediate',
      estimatedTimeInHours: 30,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
    },
    status: 'open',
    createdBy: '0x1234567890123456789012345678901234567890',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionCriteria: 'Bot deployed and handling all specified commands',
    repositoryUrl: 'https://github.com/example/telegram-bot'
  },
  {
    id: '3',
    title: 'Design VSA Dashboard UI',
    description: 'Create a modern and intuitive dashboard for VSA management using Next.js and TailwindCSS.',
    reward: {
      amount: '750000000000000000', // 0.75 ETH in wei
      token: 'ETH',
      chainId: 11155111 // Sepolia
    },
    requirements: {
      skills: ['React', 'TailwindCSS', 'UI/UX'],
      experienceLevel: 'advanced',
      estimatedTimeInHours: 25,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days from now
    },
    status: 'open',
    createdBy: '0x1234567890123456789012345678901234567890',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionCriteria: 'Responsive design implemented and approved',
    repositoryUrl: 'https://github.com/example/frontend'
  }
];
