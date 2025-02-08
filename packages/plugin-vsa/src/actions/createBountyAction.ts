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

interface BountyData { //Placeholder for the user data TODO: replace with the actual user data
    title: string;
    owner: string;
    description: string;
    longDescription: string;
    amount: string;
    token: string;
    chainId: string;
    requiredSkills: string[];
    datePosted: string;
    dueDate: string;
    state: string;
    estimatedTime: string;
}



const bountyDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "title": "Build a DeFi Dashboard",
    "description": "Create a dashboard to track DeFi positions",
    "longDescription": "Create a dashboard to track DeFi positions",
    "amount": "1000000000",
    "token": "USDC",
    "requiredSkills": ["React", "Web3.js", "TypeScript"],
    "datePosted": "2024-01-15",
    "dueDate": "2024-02-15", 
    "estimatedTime": "80",
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<<
>>>ONLY USE DATA FROM MESSAGES AFTER THE LAST TIME THE USER ASKED TO CREATE A BOUNTY, if you cannot find the information after the last time the user asked to create a bounty, use null<<<
- title
- Description
- longDescription
- amount
- token
- requiredSkills
- datePosted
- dueDate
- estimatedTime

Respond with a JSON markdown block containing only the extracted values.`;


function isBountyData(
    content: BountyData
): content is BountyData {
    return (
        typeof content.title === "string" &&
        typeof content.description === "string" &&
        typeof content.longDescription === "string" &&
        typeof content.amount === "string" &&
        typeof content.token === "string" &&
        Array.isArray(content.requiredSkills) &&
        content.requiredSkills.every(skill => typeof skill === "string") &&
        typeof content.datePosted === "string" &&
        typeof content.dueDate === "string" &&
        typeof content.estimatedTime === "string"
    );
}

async function processBounty(bountyData: BountyData) {
    console.log("Processing new Bounty creation:", bountyData);
    const bountyDataFormat = {
        title: { $allot: bountyData.title },
        owner: { $allot: "0x1234567890123456789012345678901234567890" },
        requiredSkills: bountyData.requiredSkills.map(skill => ({ $allot: skill })),
        datePosted: { $allot: bountyData.datePosted },
        dueDate: { $allot: bountyData.dueDate },
        state: { $allot: "Open" },
        estimatedTime: { $allot: bountyData.estimatedTime },
        description: { $allot: bountyData.description },
        longDescription: { $allot: bountyData.longDescription },
        bountyId: { $allot: "00000000-0000-0000-0000-000000000000" },
        reward: {
          amount: { $allot: bountyData.amount },
          token: { $allot: bountyData.token },
          chainId: { $allot: "11192" },
        },
    };
    await createBounty(bountyDataFormat);
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
                const requiredParameters = ["title", "description", "longDescription", "rewardAmount", "rewardToken", "requiredSkills", "datePosted", "dueDate", "estimatedTime"];
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
                const missingUserDataTemplate = `Here are the user data parameters I have confirmed:

                {{#each confirmed}}
                - {{@key}}: {{this}}
                {{/each}}
                
                The following required parameters are missing:
                {{#each missing}}
                - {{this}}
                {{/each}}
                
                Please provide values for the missing parameters to proceed with the user profile creation.`;

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
                const bountyDataFilled: BountyData = {
                    title: content.title,
                    description: content.description,
                    longDescription: content.longDescription,
                    amount: content.amount,
                    token: content.token,
                    chainId: content.chainId,
                    requiredSkills: content.requiredSkills,
                    datePosted: content.datePosted,
                    dueDate: content.dueDate,
                    state: content.state,
                    estimatedTime: content.estimatedTime,
                    owner: content.owner,
                };
    
                // Call the function to process the user profile
                await processBounty(bountyDataFilled);
                if (callback) {
                    callback({
                        text: `Successfully created bounty`,
                        content: {
                            success: true,
                            bountyDataFilled,
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
                processBounty(content);
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