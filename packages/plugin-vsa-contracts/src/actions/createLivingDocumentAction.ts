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

import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { CompletedJobData, JobData } from "../type";

import { createBounty } from "@elizaos/nillion-core";
import { getLivingDocument, updateLivingDocument } from "@elizaos/supabase";

const Handlebars = require('handlebars');
const userAuthId = "123e4567-e89b-12d3-a456-426614174000";








export const createLivingDocumentAction: Action = {
    name: "CREATE_LIVING_DOCUMENT",
    description: "Create a new living document",
    similes: ["CREATE_LIVING_DOCUMENT", "NEW_LIVING_DOCUMENT", "LIVING_DOCUMENT_CREATION"],
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
    
        console.log("Create Living Document action handler called");
        const livingDocument = await getLivingDocument(userAuthId);
        const document = livingDocument.living_document?.join('\n') || '';
        const createLivingDocumentTemplate = `
            The current living document is:
            ${document}

            given the following information about the user, create a living document for the user:
            {{recentMessages}}

            The living document is a json markdown block that holds an array of information strings.
            Each information string is a string that describes the user's information. it is always prefixed with a number 
            that indicates its order based on what order the user shared the information in recent messages.
            


            For any relevant piece of information create a short sentence that describes the user's information.
            Duplicate information is not allowed.
            The living document should be in the following format:
            {
                "living_document": [
                    "12: information string 1",
                    "13: information string 2",
                    "14: information string 3"
                ]
            }
            if a more recent message (orderwise) contradicts the information in the living document, update the living document to reflect the new information 
            (remove the old information and add the new information).
            MAKE ABSOLUTELY SURE TO NOT DUPLICATE INFORMATION. (if a user says he is good at rust, 
            and later says he is pretty bad at rust, that contradicts, only keep the new information)

            Also double check that no information is lost, as in only delete an entry if you replace it with a new one.

            When you replace an entry, make sure to update the order to reflect that this is new information.
            For example if the living document contains:
            "12: user is not happy" and recent messages contain new information that the user is happy,
            you should replace the old information and update the order to "X: user is happy" 
            (where X is the order of the new information in the recent messages)
            ABSOLUTELY ENSURE that the order matches the appearance of the information in the recent messages.
            do not keep the old order if you replace an entry.
            If the information is old and not replaced by new information keep its order.
        `;
    
        try {
            const context = composeContext({
                state,
                template: createLivingDocumentTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            })); //outputs the initial living document
    
            console.log(content);
            await updateLivingDocument(userAuthId, content.living_document);
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