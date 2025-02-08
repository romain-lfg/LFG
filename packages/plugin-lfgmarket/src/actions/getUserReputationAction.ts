import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const userId = "fred";

export const getUserReputationAction: Action = {
    name: "GET_REPUTATION",
    similes: ["GET_USER_REPUTATION", "GET_USER_DETAILS", "GET_USER_RATING"],
    description: "Gets the reputation of a user",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const userReputation = await service.market.getUserReputation(userId);
        return userReputation;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Get the reputation rating of a specific user" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Fetched user reputation",
                    action: "GET_REPUTATION"
                }
            }
        ]
    ]
};