import { BigNumber } from "@ethersproject/bignumber";

export interface JobDetails {
    employer: string;
    employee: string;
    payment: BigNumber;
    status: number;
    deadline: BigNumber;
    description: string;
  }

export interface RatingData {
  user: string;
    jobId: number;
    rating: number;
  }

export interface PaymentData {
  user: string;
  jobId: number;
}

export interface DisputeData {
  user: string;
  jobId: number;
}

export interface JobData {
  user: string;
  description: string;
  deadline: number;
  payment: number;
}

export interface CompletedJobData {
  userAddress: string;
  bountyId: number;
}

export interface AcceptedJobData {
  userAddress: string;
  bountyId: number;
}

export interface JobDetailsData {
  jobId: number;
}

export interface OtherUserData {
  user: string;
}

export interface UserData { //Placeholder for the user data TODO: replace with the actual user data
  name: string;
  address: string;
  skills: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  timeZone: string;
  minimumBountyValue: string;
  walletAddress: string;
}
