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
    ServiceType,
} from "@elizaos/core";

import {matchBountiesUser } from "@elizaos/nillion-core";
import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { CompletedJobData, JobData } from "../type";

import { createBounty } from "@elizaos/nillion-core";

const Handlebars = require('handlebars');

interface BountyData { //Placeholder for the user data TODO: replace with the actual user data
    walletAddress: string;
}



const bountyDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "walletAddress": "0x1234567890123456789012345678901234567890"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<<
>>>ONLY USE DATA FROM MESSAGES AFTER THE LAST TIME THE USER ASKED TO CREATE A BOUNTY, if you cannot find the information after the last time the user asked to create a bounty, use null<<<
- walletAddress
Respond with a JSON markdown block containing only the extracted values.`;


function isBountyData(
    content: BountyData
): content is BountyData {
    return (
        typeof content.walletAddress === "string" && content.walletAddress != null &&
        isAddress(content.walletAddress)
    );
}

async function processMatchBounties(bountyData: BountyData, runtime: IAgentRuntime, callback?: HandlerCallback) {
    console.log("Matching bounties");
    const matches = await matchBountiesUser(userAdress);
            console.log("Found matches:", matches);
            let matchText = "Here are the bounties that match your skills:\n\n";
            
            for (const match of await matches) {
                matchText += `Title: ${match.bounty.title}\n`;
                matchText += `Bounty ID: ${match.bounty.bountyId}\n`;
                matchText += `Description: ${match.bounty.longDescription}\n`;
                matchText += `Skills Match: ${match.skillsMatch} out of ${match.bounty.requiredSkills.length} required skills\n`;
                matchText += `Required Skills: ${match.bounty.requiredSkills.join(", ")}\n`;
                matchText += `Reward: ${match.bounty.reward.amount} ${match.bounty.reward.token}\n`;
                matchText += "-------------------\n";
            }

            if ((matches).length === 0) {
                matchText = "No bounties match your skills. Please try again with different skills or wait for new bounties to be posted.";
            }

            if (callback) {
                callback({
                    text: matchText,
                    content: { matches: await matches }
                });
            }

}


export const matchBountiesForUserAction: Action = {
    name: "MATCH_BOUNTIES",
    description: "Match bounties to a user",
    similes: ["MATCH_BOUNTIES", "MATCH_BOUNTIES_FOR_USER", "MATCH_BOUNTIES_FOR_ME"],
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
    
            console.log(content);
    
            if (!isBountyData(content)) {
                console.log("NOT IS USER DATA");
                const bountyData = content;
                const requiredParameters = ["walletAddress"];
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
                    walletAddress: content.walletAddress,
                };
    
                // Call the function to process the user profile
                await processMatchBounties(bountyDataFilled, runtime, callback);
                if (callback) {
                    callback({
                        text: `Successfully matched bounties`,
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
                        text: `Successfully matched bounties`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                processMatchBounties(content, runtime, callback);
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
                    text: "I want to see which bounties match my skills",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I will need your wallet address to match you with the best bounties",
                    action: "MATCH_BOUNTIES",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;