import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const user = "fred";
const jobId = 1;

export const acceptJobAction: Action = {
    name: "ACCEPT_JOB",
    similes: ["TAKE_JOB"],
    description: "Creates a job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.acceptJob(user, jobId);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Accept a job on the job bounty marketplace" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Accepting job",
                    action: "ACCEPT_JOB"
                }
            }
        ]
    ]
};