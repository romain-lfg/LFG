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

import {matchBountiesUser } from "@elizaos/nillion-core";

const Handlebars = require('handlebars');

const userAdress = "0xi29299100";

export const matchBountiesAction: Action = {
    name: "MATCH_BOUNTIES",
    description: "Match bounties",
    similes: ["MATCH_BOUNTIES", "MATCH_AVAILABLE_BOUNTIES", "AVAILABLE_BOUNTIES"],
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

        console.log("Match bounties action handler called");
    
        try {
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
        catch (error: any) {
            console.error("Error matching bounties:", error);
            if (callback) {
                callback({
                    text: `Error matching bounties: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
        return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to see if there are any bounties that match my skills",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me match some bounties",
                    action: "MATCH_BOUNTIES",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;