import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { ethers, Signer, Wallet } from "ethers";
import { LFG_MARKET_ABI } from "./abi";
import { LFG_MARKET_ADDRESS } from "./addresses";
import { JobDetails } from "../type";

export class LfgMarketCalls {
  wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }
  
  async registerUserCall(user: string): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      console.log('registerUserCall', user.toLowerCase());
      const tx = await contract.registerUser(user.toLowerCase());
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }
  
  async createJobCall(
    user: string,
    _description: string,
    _deadline: number,
    payment: BigNumber
  ): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const tx = await contract.createJob(user, _description, _deadline, {
        value: payment
      });
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }
  
  async acceptJobCall(
    user: string,
    _jobId: number
  ): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const tx = await contract.acceptJob(user, _jobId);
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }
  
  async completeJobCall(
    user: string,
    _jobId: number
  ): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const tx = await contract.completeCall(user, _jobId);
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }
  
  async releasePaymentCall(
    user: string,
    _jobId: number
  ): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const tx = await contract.releasePayment(user, _jobId);
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }
  
  async submitRatingCall(
    user: string,
    _jobId: number,
    _rating: number
  ): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const tx = await contract.submitRating(user, _jobId, _rating);
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }
  
  async initiateDisputeCall(
    user: string,
    _jobId: number
  ): Promise<ethers.ContractTransaction> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const tx = await contract.initiateDispute(user, _jobId);
      return tx;
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  async getUserReputationCall(_user: string): Promise<number> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const userReputation = await contract.getUserReputation(_user);
      return userReputation;
    } catch (error) {
      console.error('Failed to get user reputation for user:', _user, error);
      throw error;
    }
  }

  async getJobDetailsCall(_jobId: number): Promise<JobDetails> {
    try {
      const contract = new Contract(LFG_MARKET_ADDRESS, LFG_MARKET_ABI, this.wallet);
      const jobDetails = await contract.getJobDetails(_jobId);
      
      return {
        employer: jobDetails.employer,
        employee: jobDetails.employee,
        payment: jobDetails.payment,
        status: jobDetails.status,
        deadline: jobDetails.deadline,
        description: jobDetails.description
      };
    } catch (error) {
      console.error('Failed to get job details for job:', _jobId, error);
      throw error;
    }
  }
}
