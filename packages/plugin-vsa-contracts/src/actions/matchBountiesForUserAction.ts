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
import { getLivingDocument, updateLivingDocument, getBounties } from "@elizaos/supabase";
const userAuthId = "123e4567-e89b-12d3-a456-426614174000";

const Handlebars = require('handlebars');

interface BountyData { //Placeholder for the user data TODO: replace with the actual user data
    walletAddress: string;
}

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
    const matches = await matchBountiesUser(bountyData.walletAddress);
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
    suppressInitialMessage: true,
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
    
        console.log("Match bounties for user action handler called");
    
        try {

            const bounties = await getBounties();
            let bountiesText = "";
            for (const bounty of bounties) {
                bountiesText += `User Auth ID: ${bounty.user_auth_id}\n`;
                bountiesText += `Created At: ${bounty.created_at}\n`;
                bountiesText += `Title: ${bounty.title}\n`;
                bountiesText += `Description: ${bounty.description}\n`;
                bountiesText += `Required Skills: ${bounty.required_skills.join(", ")}\n`;
                bountiesText += `Owner Address: ${bounty.owner_address}\n`;
                bountiesText += `Due Date: ${bounty.date_due}\n`;
                bountiesText += `Estimated Time: ${bounty.estimated_time} hours\n`;
                bountiesText += `ID: ${bounty.id}\n`;
                bountiesText += `Reward Amount: ${bounty.reward_amount} ETH\n`;
                bountiesText += `State: ${bounty.state}\n`;
                bountiesText += "----END OF BOUNTY----\n\n";
            }
            console.log("Available bounties:", bountiesText);

            const livingDocument = await getLivingDocument(userAuthId);
            const livingDocumentString = JSON.stringify(livingDocument, null, 2);
            console.log("Living document:", livingDocument);

            const matchmakingTemplate = `
                

                compare each bounty in the following document :::${bountiesText}::: with the user's available data in the following document :::${livingDocumentString}:::
                For each bounty, calculate a score between 0 and 100 based on how well the user fits the bounty requirements and the user's skills and interests
                also take into account the recent messages.

                If the user mentions that he is bad at something, that should be taken into account.
                
                Respond with a JSON markdown block, make sure to include the bounty id, score, description, and reason for the score.
                For the description, only include the bounty description, not the user's data.

                MAKE ABSOLUTELY SURE THAT YOU INCLUDE EACH BOUNTIES DESCRIPTION IN THE RESPONSE.
            
                Example response:
                \`\`\`json
                {
                    "matches": "[
                        {
                            bountyId: 1,
                            score: 40%,
                            description: "bounty description",
                            reason: "good fit because X"
                        }
                    ]"
                }
                \`\`\``;

            const context = composeContext({
                state,
                template: matchmakingTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            }));
    
            console.log(content);
            // Sort matches by score in descending order
            content.matches.sort((a, b) => parseInt(b.score) - parseInt(a.score));

            if (callback) {
                let matchText = "Here are the bounties that match your skills, sorted by best match:\n\n";
                
                for (const match of content.matches) {
                    matchText += `Bounty ID: ${match.bountyId}\n`;
                    matchText += `Match Score: ${match.score}%\n`;
                    matchText += `Description: ${match.description}\n`;
                    matchText += `Reason: ${match.reason}\n`;
                    matchText += "-------------------\n";
                }

                if (content.matches.length === 0 || content.matches[0].score < 50) {
                    matchText = "No bounties currently match your skills. Please try again later as new bounties are posted.";
                }

                callback({
                    text: matchText,
                    content: { matches: content.matches }
                });
            }

            return true;
           
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
                    text: "I will see which bounties i can find that match your skills",
                    action: "MATCH_BOUNTIES",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;