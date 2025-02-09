import { BigNumber } from "@ethersproject/bignumber";

export interface JobDetails {
    employer: string;
    employee: string;
    payment: BigNumber;
    status: number;
    deadline: BigNumber;
    description: string;
  }

export interface UserData {
  user: string;
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
  user: string;
  jobId: number;
}

export interface AcceptedJobData {
  user: string;
  jobId: number;
}
