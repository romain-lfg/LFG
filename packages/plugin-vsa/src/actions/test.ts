//pnpm start --"character=characters/nexus.character.json"
import {
    Action,
    ActionExample,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    HandlerCallback,
    composeContext,
    generateObjectDeprecated,
} from "@elizaos/core";

import {  } from "@elizaos/nillion-core";
import { createBounty } from "@elizaos/nillion-core";

const Handlebars = require('handlebars');

interface userData { //Placeholder for the user data TODO: replace with the actual user data
    username: string;
}



const bountyDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "username": "John Doe",
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- username

Respond with a JSON markdown block containing only the extracted values.`;


function isBountyData(
    content: userData
): content is userData {
    return (
        typeof content.username === "string"
    );
}

async function processUserData(userData: userData) {
    console.log("Processing new User data:", userData);
    
}


export const createBountyAction: Action = {
    name: "CREATE_BOUNTY",
    description: "Create a new bounty",
    similes: ["CREATE_BOUNTY", "NEW_BOUNTY", "BOUNTY_CREATION"],
    validate: async (_runtime: IAgentRuntime, _message: Memory) => {
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: unknown,
        callback?: HandlerCallback
    ): Promise<boolean> => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }
    
        console.log("Create bounty action handler called");
    
        try {
            const context = composeContext({
                state,
                template: bountyDataTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            }));
    
            console.log("content stage mate");
            console.log(content);
    
            if (!isBountyData(content)) {
                console.log("NOT IS USER DATA");
                const bountyData = content;
                const requiredParameters = ["username"];
                const confirmed = {};
                const missing = [];
    
                // Check for confirmed and missing parameters
                for (const param of requiredParameters) {
                    if (bountyData[param] != null && bountyData[param] != "null") {
                        console.log("bountyData. " + param + " = " + bountyData[param]);
                        confirmed[param] = bountyData[param];
                    } else {
                        missing.push(param);
                    }
                }


                //TODO add a correct context composition for the missing user data
                // If there are missing parameters, ask the user for them a
                if (missing.length > 0) {
                    const missingParamsList = missing.join(", ");
                    const promptMessage = `Please provide the following missing information: ${missingParamsList}.`;
    
                    if (callback) {
                        callback({
                            text: "Please provide the following missing information: " + missingParamsList, //promptMessage,
                            content: {
                                success: false,
                                error: "Missing required token parameters",
                            },
                        });
                    }
                    return false; // Exit the handler to avoid looping
                }
    
                // Create user data
                const userDataFilled: userData = {
                    username: content.username,
                };
    
                // Call the function to process the user profile
                await processUserData(userDataFilled);
                if (callback) {
                    callback({
                        text: `Successfully created bounty`,
                        content: {
                            success: true,
                            userDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("USER DATA IS VALID");
                if (callback) {
                    callback({
                        text: `Successfully created bounty`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                const userDataFilled: userData = {
                    username: content.username,
                };
                processUserData(userDataFilled);
                return false;
            }
        } catch (error) {
            console.error("Error creating bounty:", error);
            if (callback) {
                callback({
                    text: `Error creating bounty: ${error.message}`,
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
                content: {
                    text: "I want to create a bounty",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I will need some information to create a bounty",
                    action: "CREATE_BOUNTY",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;