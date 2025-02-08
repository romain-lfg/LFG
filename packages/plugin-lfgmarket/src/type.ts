import { BigNumber } from "@ethersproject/bignumber";

export interface JobDetails {
    employer: string;
    employee: string;
    payment: BigNumber;
    status: number;
    deadline: BigNumber;
    description: string;
  }
