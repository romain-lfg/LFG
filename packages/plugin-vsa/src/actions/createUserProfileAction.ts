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

import { createUser } from "@elizaos/nillion-core";
//pnpm start --"charachters=charachters/vsa.character.json"

const Handlebars = require('handlebars');

interface UserData { //Placeholder for the user data TODO: replace with the actual user data
    name: string;
    address: string;
    skills: string[];
    workingHoursStart: string;
    workingHoursEnd: string;
    timeZone: string;
    minimumBountyValue: string;
}


const userDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "name": "John Smith",
    "address": "0xoawdajp",
    "skills": [typescript, nodejs, c#],
    "workingHoursStart": "8am",
    "workingHoursEnd": "16pm",
    "timeZone": "UTC",
    "minimumBountyValue": "0"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the user: >>>(DO NOT RENAME THE KEYS)<<<
>>>ONLY USE DATA FROM MESSAGES AFTER THE LAST TIME THE USER ASKED TO CREATE A USER PROFILE, if you cannot find the information after the last time the user asked to create a user profile, use null<<<
- Name 
- Address
- Skills
- WorkingHoursStart
- WorkingHoursEnd
- TimeZone
- MinimumBountyValue

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
        typeof content.address === "string" &&
        Array.isArray(content.skills) &&
        content.skills.every(skill => typeof skill === "string") &&
        typeof content.workingHoursStart === "string" &&
        typeof content.workingHoursEnd === "string" &&
        typeof content.timeZone === "string" &&
        typeof content.minimumBountyValue === "string"
    );
}

async function processUserProfile(userData: UserData) {
    console.log("Processing user profile:", userData);
    const userDataFormat = {
        name: { $allot: userData.name },
        address: { $allot: userData.address },
        skills: userData.skills.map(skill => ({ $allot: skill })),
        workingHoursStart: { $allot: userData.workingHoursStart },
        workingHoursEnd: { $allot: userData.workingHoursEnd },
        timeZone: { $allot: userData.timeZone },
        minimumBountyValue: { $allot: userData.minimumBountyValue },
      };
    await createUser(userDataFormat);
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
                const requiredParameters = ["name", "address", "skills", "workingHoursStart", "workingHoursEnd", "timeZone", "minimumBountyValue"];
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
                    address: content.address,
                    skills: content.skills,
                    workingHoursStart: content.workingHoursStart,
                    workingHoursEnd: content.workingHoursEnd,
                    timeZone: content.timeZone,
                    minimumBountyValue: content.minimumBountyValue,
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
                if (callback) {
                    callback({
                        text: `Successfully created user profile`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                processUserProfile(content);
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