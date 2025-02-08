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

import { storeUserData, retrieveUserData, testFn } from "@elizaos/nillion-core";

const Handlebars = require('handlebars');


async function getAvailableBounties() {
    console.log("Getting available bounties");
    testFn();
}


export const getBountiesAction: Action = {
    name: "GET_BOUNTIES",
    description: "Get available bounties",
    similes: ["GET_BOUNTIES", "GET_AVAILABLE_BOUNTIES", "AVAILABLE_BOUNTIES"],
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
    
        console.log("Get bounties action handler called");
    
        try {
            getAvailableBounties();
        } 
        catch (error) {
            console.error("Error retrieving bounties:", error);
            if (callback) {
                callback({
                    text: `Error retrieving bounties: ${error.message}`,
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