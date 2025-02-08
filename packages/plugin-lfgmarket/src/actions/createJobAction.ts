import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const user = "fred";
const description = "Create a job";
const deadline = 1712832000;
const payment = "1"; // 1 ETH

export const createJobAction: Action = {
    name: "CREATE_JOB",
    similes: ["MAKE_JOB", "GENERATE_JOB"],
    description: "Creates a job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.createJob(user, description, deadline, payment);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Create a new job on the job bounty marketplace" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Creating bounty posting",
                    action: "CREATE_JOB"
                }
            }
        ]
    ]
};