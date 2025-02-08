import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const jobId = 1;

export const getJobDetailsAction: Action = {
    name: "GET_DETAILS",
    similes: ["GET_DETAILS", "JOB_DETAILS", "GET_JOB_DETAILS"],
    description: "Gets the details of a specific job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const jobDetails = await service.market.getJobDetails(jobId);
        return jobDetails;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Get the details of a specific job" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Fetched job details",
                    action: "GET_DETAILS"
                }
            }
        ]
    ]
};