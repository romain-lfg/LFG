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

const Handlebars = require('handlebars');

interface userData { //Placeholder for the user data TODO: replace with the actual user data
    username: string;
}



const userDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

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


function isUserData(
    content: userData
): content is userData {
    return (
        typeof content.username === "string"
    );
}

async function processUserData(userData: userData) {
    console.log("Processing new User data:", userData);
    
}


export const faggotAction: Action = {
    name: "CREATE_FRIEND",
    description: "Create a new bounty",
    similes: ["MAKE_FRIEND", "GET_FRIEND"],
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
                template: userDataTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            }));
    
            console.log("content stage mate");
            console.log(content);
    
            if (!isUserData(content)) {
                console.log("NOT IS USER DATA");
                const userData = content;
                const requiredParameters = ["username"];
                const confirmed: Record<string, any> = {};
                const missing: string[] = [];
    
                // Check for confirmed and missing parameters
                for (const param of requiredParameters) {
                    if (userData[param] != null && userData[param] != "null") {
                        console.log("userData. " + param + " = " + userData[param]);
                        confirmed[param] = userData[param];
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
                        text: `Successfully SPAT ON THAT THANG`,
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
                        text: `Successfully SPAT ON THAT THANG`,
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
        } catch (error: any) {
            console.error("Error creating user data:", error);
            if (callback) {
                callback({
                    text: `Error creating user data: ${error.message}`,
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
                    text: "I want to create a user",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I will need some information to create a user",
                    action: "CREATE_USER",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;