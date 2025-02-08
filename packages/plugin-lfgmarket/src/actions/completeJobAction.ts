import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const user = "fred";
const jobId = 1;

export const completeJobAction: Action = {
    name: "COMPLETE_JOB",
    similes: ["FINISH_JOB", "END_JOB"],
    description: "Completes a job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.completeJob(user, jobId);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Complete a specific job on the job bounty marketplace" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Completing job for user",
                    action: "COMPLETE_JOB"
                }
            }
        ]
    ]
};