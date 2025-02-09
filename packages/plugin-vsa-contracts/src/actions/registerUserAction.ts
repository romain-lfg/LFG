import { Action, composeContext, elizaLogger, generateObjectDeprecated, HandlerCallback, IAgentRuntime, Memory, ModelClass, ServiceType, State } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import { UserData } from "../type";
import { getAddress, isAddress } from "@ethersproject/address";

const userDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "user": "0xf94563b7013384EB4b3243D37250068Ee483857a",
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- user

Respond with a JSON markdown block containing only the extracted values.`;

function isUserData(
    content: UserData
): content is UserData {
    if (!isAddress(content.user)) {
        elizaLogger.error("Invalid user address");
        return false;
    }
    return (
        typeof content.user === "string" &&
        isAddress(content.user)
    );
}

async function processUserData(userData: UserData, runtime: IAgentRuntime) {
    elizaLogger.info("Processing new user address:", userData.user);

    const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
    const tx = await service.market.registerUser(userData.user);
}

export const registerUserAction: Action = {
    name: "REGISTER_USER",
    similes: ["APPLY_USER", "MAKE_USER", "GENERATE_USER"],
    description: "Registers the user on the LFG marketplace",
    
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

        elizaLogger.info("Register user action handler called");

        try {
            const context = composeContext({
                state,
                template: userDataTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            }));
    
            if (!isUserData(content)) {
                console.log("No user address detected yet");
                const userData = content;
                const requiredParameter = "user";
    
                // Check for confirmed and missing parameters
                if (userData[requiredParameter] != null && isAddress(userData[requiredParameter])) {
                    console.log("userData." + requiredParameter + " = " + userData[requiredParameter]);
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

                // Create user data
                let userDataFilled: UserData;
                try {
                    userDataFilled = {
                        user: getAddress(content.user)
                    };
                } catch (error) {
                    elizaLogger.error("Invalid user address");
                    return false;
                }

    
                // Call the function to process the user profile
                await processUserData(userDataFilled, runtime);
                if (callback) {
                    callback({
                        text: `Successfully added user.`,
                        content: {
                            success: true,
                            userDataFilled,
                        },
                    });
                }

                return true;
            } else {
                console.log("User address detected.");
                if (callback) {
                    callback({
                        text: `Thank you. Your address has been added to the LFG marketplace.`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                
                // Create user data
                let userDataFilled: UserData;
                try {
                    userDataFilled = {
                        user: getAddress(content.user)
                    };
                } catch (error) {
                    elizaLogger.error("Invalid user address");
                    return false;
                }

                processUserData(userDataFilled, runtime);
                return false;
            }
        } catch (error: any) {
            elizaLogger.error("Error querying user address:", error);
            if (callback) {
                callback({
                    text: `Error querying user address: ${error.message}`,
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
                content: { text: "I would like to register to the Nexus job bounty marketplace" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Please provide your public address in the format '0x...'.",
                    action: "REGISTER_USER"
                }
            }
        ]
    ]
};