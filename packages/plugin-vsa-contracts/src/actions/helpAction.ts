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

import { publicActionDocumentation, privateActionDocumentation } from "./DOCUMENTATION";

const Handlebars = require('handlebars');








export const helpAction: Action = {
    name: "AVAILABLE_ACTIONS",
    description: "Get help with the current action",
    similes: ["ACTIONS", "GET_HELP", "HELP", "HELP_ME", "AVAILABLE_ACTIONS", "HELP_WITH_ACTIONS"],
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
    
        console.log("Help action handler called");

        const helpTemplate = `
            The documentation for available actions is:       
            ${publicActionDocumentation}

            using the aforementioned documentation, provide the user with help regarding what actions the agent can perform.
            Cater your response to the user's message.

            Respond with a json markdown block that contains your response.
        `;
        console.log("helpTemplate", helpTemplate);
    
        try {
            const context = composeContext({
                state,
                template: helpTemplate,
            });
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            })); 

            if (true) {
                callback!({
                    text: content.response,
                    content: {
                        success: false,
                        error: "404",
                    },
                });
            }
    
            return false;
            
        } catch (error) {
            console.error("Error:", error);
            if (callback) {
                callback({
                    text: `Error: ${error.message}`,
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
                    text: "I need help, what can you do?",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;