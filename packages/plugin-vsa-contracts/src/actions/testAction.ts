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

import {createLivingDocumentAction} from "./createLivingDocumentAction";

const Handlebars = require('handlebars');

export const testAction: Action = {
    name: "TEST_ACTION",
    description: "Test action",
    similes: ["TEST_ACTION", "TEST_ACTION", "TEST_ACTION"],
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
    
        console.log("TEST ACTION CALLED");
    
        try {
            await createLivingDocumentAction.handler(runtime, message, state, {_options}, callback);
            return false;
            
        } catch (error) {
            console.error("Error creating living document:", error);
            if (callback) {
                callback({
                    text: `Error creating living document: ${error.message}`,
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
                    text: "I want to create a living document",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;