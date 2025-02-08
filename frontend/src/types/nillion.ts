import { z } from 'zod';

// Zod schema for runtime validation
export const BountySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  reward: z.object({
    amount: z.string(),
    token: z.string(),
    chainId: z.number()
  }),
  requirements: z.object({
    skills: z.array(z.string()),
    estimatedTimeInHours: z.string(),
    deadline: z.string()
  }),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  creator: z.object({
    address: z.string(),
    name: z.string().optional()
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

// TypeScript type derived from the schema
export type Bounty = z.infer<typeof BountySchema>;

export interface PaginatedBountyResponse {
  items: Bounty[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BountyListParams {
  owner?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  skills?: string[];
}
