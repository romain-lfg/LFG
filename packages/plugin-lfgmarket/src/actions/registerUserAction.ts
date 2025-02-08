import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const user = "fred";
const jobId = 1;

export const registerUserAction: Action = {
    name: "REGISTER_USER",
    similes: ["APPLY_USER", "MAKE_USER", "GENERATE_USER"],
    description: "Registers the user on the LFG marketplace",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.registerUser(user);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Register a new profile for me on the LFG marketplace" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Registering user to the LFG marketplace",
                    action: "REGISTER_USER"
                }
            }
        ]
    ]
};