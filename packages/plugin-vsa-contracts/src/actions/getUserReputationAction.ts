import { Action, composeContext, elizaLogger, generateObjectDeprecated, HandlerCallback, IAgentRuntime, Memory, ModelClass, ServiceType, State } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { OtherUserData } from "../type";

const dataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "user": "0xf94563b7013384EB4b3243D37250068Ee483857a"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- user

Respond with a JSON markdown block containing only the extracted values.`;

function isOtherUserData(
    content: OtherUserData
): content is OtherUserData {
    if (!isAddress(content.user)) {
        elizaLogger.error("Invalid user address");
        return false;
    }
    return (
        typeof content.user === "string" &&
        isAddress(content.user)
    );
}

async function processOtherUserData(otherUserData: OtherUserData, runtime: IAgentRuntime) {
    elizaLogger.info("Fetching user reputation for:", otherUserData.user);

    const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
    const otherUserReputation = await service.market.getUserReputation(otherUserData.user);
    return otherUserReputation;
}

export const getUserReputationAction: Action = {
    name: "GET_REPUTATION",
    similes: ["GET_USER_REPUTATION", "GET_USER_DETAILS", "GET_USER_RATING"],
    description: "Gets the reputation of a user",
    
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: unknown,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        elizaLogger.info("Get user reputation action handler called");

        try {
            const context = composeContext({
                state,
                template: dataTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            }));
    
            if (!isOtherUserData(content)) {
                console.log("No user address detected yet");
                const requiredParameter = "user";
    
                // Check for confirmed and missing parameters
                if (content[requiredParameter] != null && isAddress(content[requiredParameter])) {
                    console.log("content." + requiredParameter + " = " + content[requiredParameter]);
                } else {
                    const promptMessage = `Please provide your public Ethereum address in the format "0x...".`;

                    if (callback) {
                        callback({
                            text: `Please provide your public address in the format "0x...".`, //promptMessage,
                            content: {
                                success: false,
                                error: "Missing required Ethereum address",
                            },
                        });
                    }
                    return false; // Exit the handler to avoid looping
                }
    
                // Create rating data
                const otherUserDataFilled: OtherUserData = {
                    user: content.user
                };
    
                // Call the function to process the rating
                const otherUserReputation = await processOtherUserData(otherUserDataFilled, runtime);
                if (callback) {
                    callback({
                        text: `User ${otherUserDataFilled.user} has a reputation of ${otherUserReputation}.`,
                        content: {
                            success: true,
                            otherUserDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("User data is valid");
        
                const otherUserDataFilled: OtherUserData = {
                    user: content.user
                };
                const otherUserReputation = await processOtherUserData(otherUserDataFilled, runtime);
                if (callback) {
                    callback({
                        text: `User ${otherUserDataFilled.user} has a reputation of ${otherUserReputation}.`,
                        content: {
                            success: true,
                            otherUserDataFilled,
                        },
                    });
                }
                return false;
            }
        } catch (error: any) {
            elizaLogger.error("Error getting reputation with error", error);
            if (callback) {
                callback({
                    text: `Error getting reputation with error: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Get the reputation rating of user with address {{user}}" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Fetched user reputation for user.",
                    action: "GET_REPUTATION"
                }
            }
        ]
    ]
};