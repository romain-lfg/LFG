//pnpm start --"character=characters/vsa.character.json"
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

import { storeUserData, retrieveUserData, testFn } from "@elizaos/nillion-core";
//pnpm start --"charachters=charachters/vsa.character.json"

const Handlebars = require('handlebars');

interface UserData { //Placeholder for the user data TODO: replace with the actual user data
    name: string;
    sex: string;
    age: number;
    location: string;
    interests: string[];
}


const userDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "name": "John Smith",
    "sex": "male",
    "age": 25,
    "location": "New York, USA", 
    "interests": ["reading", "hiking", "photography"]
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the user: >>>(DO NOT RENAME THE KEYS)<<<
- Name 
- Sex
- Age
- Location
- List of interests

Respond with a JSON markdown block containing only the extracted values.`;

const missingUserDataTemplate = `Here are the user data parameters I have confirmed:

{{#each confirmed}}
- {{@key}}: {{this}}
{{/each}}

The following required parameters are missing:
{{#each missing}}
- {{this}}
{{/each}}

Please provide values for the missing parameters to proceed with the user profile creation.`;

function isUserData(
    content: UserData
): content is UserData {
    return (
        typeof content.name === "string" &&
        typeof content.sex === "string" &&
        typeof content.age === "number" &&
        typeof content.location === "string" &&
        Array.isArray(content.interests) &&
        content.interests.every(interest => typeof interest === "string")
    );
}

async function processUserProfile(userData: UserData) {
    console.log("Processing user profile:", userData);
    await storeUserData(userData);
}


export const createUserProfileAction: Action = {
    name: "CREATE_USER_PROFILE",
    description: "Create a user profile",
    similes: ["CREATE_USER", "NEW_USER", "USER_PROFILE"],
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
    
        console.log("Create user profile action handler called");
    
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
                const requiredParameters = ["name", "sex", "age", "location", "interests"];
                const confirmed = {};
                const missing = [];
    
                // Check for confirmed and missing parameters
                for (const param of requiredParameters) {
                    if (userData[param] != null && userData[param] != "null") {
                        console.log("udata. " + param + " = " + userData[param]);
                        confirmed[param] = userData[param];
                    } else {
                        missing.push(param);
                    }
                }
    
                // If there are missing parameters, ask the user for them
                if (missing.length > 0) {
                    const missingParamsList = missing.join(", ");
                    const promptMessage = `Please provide the following missing information: ${missingParamsList}.`;
    
                    if (callback) {
                        callback({
                            text: promptMessage,
                            content: {
                                success: false,
                                error: "Missing required token parameters",
                            },
                        });
                    }
                    return false; // Exit the handler to avoid looping
                }
    
                // Create user data
                const userDataFilled: UserData = {
                    name: content.name,
                    sex: content.sex,
                    age: content.age,
                    location: content.location,
                    interests: content.interests,
                };
    
                // Call the function to process the user profile
                await processUserProfile(userDataFilled);
                if (callback) {
                    callback({
                        text: `Successfully created user profile`,
                        content: {
                            success: true,
                            userDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("USER DATA IS VALID");
                return false;
            }
        } catch (error) {
            console.error("Error creating user profile:", error);
            if (callback) {
                callback({
                    text: `Error creating user profile: ${error.message}`,
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
                    text: "How do i get started?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "give me some personal information",
                    action: "CREATE_USER_PROFILE",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;