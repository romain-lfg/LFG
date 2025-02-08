import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const user = "fred";
const jobId = 1;
const rating = 5;  

export const submitRatingAction: Action = {
    name: "SUBMIT_RATING",
    similes: ["COMPLETE_RATING", "RATE_EMPLOYEE","CREATE_RATING"],
    description: "Submits a rating for the user counterparty of the job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.submitRating(user, jobId, rating);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Submits a rating for the employee of the job" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Submitted rating for the employee",
                    action: "RELEASE_PAYMENT"
                }
            },
            {
                user: "{{user1}}",
                content: { text: "Submits a rating for the employer of the job" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Submitted rating for the employer",
                    action: "SUBMIT_RATING"
                }
            }
        ]
    ]
};