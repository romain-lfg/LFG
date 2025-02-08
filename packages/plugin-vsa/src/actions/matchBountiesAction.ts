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

import {matchBounties } from "@elizaos/nillion-core";

const Handlebars = require('handlebars');


async function processMatchBounties() {
    console.log("Matching bounties");
    matchBounties("0");
}


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
            processMatchBounties();
        } 
        catch (error) {
            console.error("Error matching bounties:", error);
            if (callback) {
                callback({
                    text: `Error matching bounties: ${error.message}`,
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