import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import Handlebars from 'handlebars';

const user = "fred";
const jobId = 1;

export const initiateDisputeAction: Action = {
    name: "INITIATE_DISPUTE",
    similes: ["START_DISPUTE", "REGISTER_DISPUTE"],
    description: "Completes a job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.initiateDispute(user, jobId);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Initiates a dispute for a specific job that was not correctly completed by the employee" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Initiated a dispute for job",
                    action: "INITIATE_DISPUTE"
                }
            }
        ]
    ]
};