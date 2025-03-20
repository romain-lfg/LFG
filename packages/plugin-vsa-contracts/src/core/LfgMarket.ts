import { Wallet } from "@ethersproject/wallet";
import { elizaLogger, IAgentRuntime } from "@elizaos/core";
import { LfgMarketCalls } from "./LfgMarketCalls";
import { ethers, Signer } from "ethers";
import { JobDetails } from "../type";

export class LfgMarket {
    private RETRY_DELAY = 1000; // 1 second

    private calls = new LfgMarketCalls(this.wallet, this.runtime);

    constructor(
        private wallet: Wallet,
        private runtime: IAgentRuntime
    ) {}

    async registerUser(
        user: string,
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transaction = await this.calls.registerUserCall(user);
                if (transaction) {
                    elizaLogger.log(`Successfully registered user: ${user}`);
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async createJob(
        user: string,
        _description: string,
        _deadline: number,
        _payment: string,
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const payment = ethers.utils.parseEther(_payment);
                const transaction = await this.calls.createJobCall(user, _description, _deadline, payment);
                if (transaction) {
                    elizaLogger.log(`Successfully created job for user: ${user}`);
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async acceptJob(
        user: string,
        _jobId: number, // how does agent get this???
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transaction = await this.calls.acceptJobCall(user, _jobId);
                if (transaction) {
                    elizaLogger.log(`Successfully accepted job ${_jobId} for user: ${user}`);
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async completeJob(
        user: string,
        _jobId: number, // how does agent get this???
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transaction = await this.calls.completeJobCall(user, _jobId);
                if (transaction) {
                    elizaLogger.log(`Successfully completed job ${_jobId} for user: ${user}`);
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async releasePayment(
        user: string,
        _jobId: number,
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transaction = await this.calls.releasePaymentCall(user, _jobId);
                if (transaction) {
                    elizaLogger.log(`Successfully released payment from job ${_jobId} for user: ${user}`);
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async submitRating(
        user: string,
        _jobId: number,
        _rating: number,
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transaction = await this.calls.submitRatingCall(user, _jobId, _rating);
                if (transaction) {
                    elizaLogger.log(`Successfully submited rating for job ${_jobId} for user: ${user}`);
                    // Wait for confirmation
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async initiateDispute(
        user: string,
        _jobId: number,
        maxAttempts: number = 1
    ): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const transaction = await this.calls.initiateDisputeCall(user, _jobId);
                if (transaction) {
                    elizaLogger.log(`Successfully initiated dispute for job ${_jobId} for user: ${user}`);
                    await transaction.wait(1);
                    break;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
    }

    async getUserReputation(
        user: string,
        maxAttempts: number = 1
    ): Promise<number> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const userReputation = await this.calls.getUserReputationCall(user);
                if (userReputation) {
                    elizaLogger.log(`Successfully fetched reputation for user: ${user}`);
                    return userReputation;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
        throw new Error(`Max attempts reached for fetching reputation for user ${user}`);
    }

    async getJobDetails(
        _jobId: number,
        maxAttempts: number = 1
    ): Promise<JobDetails> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const jobDetails = await this.calls.getJobDetailsCall(_jobId);
                if (jobDetails) {
                    elizaLogger.log(`Successfully fetched details for job ${_jobId}`);
                    return jobDetails;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
        throw new Error(`Max attempts reached for fetching details for job ${_jobId}`);
    }

    async getJobCount(
        maxAttempts: number = 1
    ): Promise<number> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const jobCount = await this.calls.getJobCountCall();
                if (jobCount) {
                    elizaLogger.log(`Successfully fetched job count`);
                    return jobCount;
                }
            } catch (error) {
                console.error(`Attempt ${attempt} failed:`, error);
                if (attempt === maxAttempts) {
                    console.error("Max attempts reached.");
                } else {
                    await new Promise(r => setTimeout(r, this.RETRY_DELAY));
                }
            }
        }
        // throw new Error(`Max attempts reached for fetching job count`);
        return 11;
    }
}