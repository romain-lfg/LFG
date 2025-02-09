import { Action, composeContext, elizaLogger, generateObjectDeprecated, HandlerCallback, IAgentRuntime, Memory, ModelClass, ServiceType, State } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { RatingData, UserData } from "../type";

const userDataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "user": "0xf94563b7013384EB4b3243D37250068Ee483857a",
    "jobId": 1,
    "rating": 5
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- user

Respond with a JSON markdown block containing only the extracted values.`;

function isRatingData(
    content: RatingData
): content is RatingData {
    if (!isAddress(content.user)) {
        elizaLogger.error("Invalid user address");
        return false;
    }
    return (
        typeof content.user === "string" &&
        isAddress(content.user) &&
        typeof content.jobId === "number" &&
        typeof content.rating === "number"
    );
}

async function processRatingData(ratingData: RatingData, runtime: IAgentRuntime) {
    elizaLogger.info("Processing rating submitted by user address:", ratingData.user);

    const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
    const tx = await service.market.submitRating(ratingData.user, ratingData.jobId, ratingData.rating);
}

export const submitRatingAction: Action = {
    name: "SUBMIT_RATING",
    similes: ["COMPLETE_RATING", "RATE_EMPLOYEE","CREATE_RATING"],
    description: "Submits a rating for the user counterparty of the job",
    
    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: unknown,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        elizaLogger.info("Submit rating action handler called");

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
    
            if (!isRatingData(content)) {
                const requiredParameters = ["user", "jobId", "rating"];
                const confirmed: Record<string, any> = {};
                const missing: string[] = [];
    
                // Check for confirmed and missing parameters
                for (const param of requiredParameters) {
                    if (content[param] != null) {
                        console.log("content. " + param + " = " + content[param]);
                        confirmed[param] = content[param];
                    } else {
                        missing.push(param);
                    }
                }

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
                                error: "Missing required rating parameters",
                            },
                        });
                    }
                    return false; // Exit the handler to avoid looping
                }
    
                // Create rating data
                const ratingDataFilled: RatingData = {
                    user: content.user,
                    jobId: content.jobId,
                    rating: content.rating
                };
    
                // Call the function to process the rating
                await processRatingData(ratingDataFilled, runtime);
                if (callback) {
                    callback({
                        text: `Successfully processed user rating.`,
                        content: {
                            success: true,
                            ratingDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("Rating data is valid");
                if (callback) {
                    callback({
                        text: `Thank you. You have successfully submitted a user rating.`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                const ratingDataFilled: RatingData = {
                    user: content.user,
                    jobId: content.jobId,
                    rating: content.rating
                };
                await processRatingData(ratingDataFilled, runtime);
                return false;
            }
        } catch (error: any) {
            elizaLogger.error("Error submitting rating with error", error);
            if (callback) {
                callback({
                    text: `Error submitting rating with error: ${error.message}`,
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
                content: { text: "Please submit a rating for the employee of the job with jobId {{jobId}}" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Submitted rating for the employee",
                    action: "SUBMIT_RATING"
                }
            },
            {
                user: "{{user1}}",
                content: { text: "Please submit a rating for the employer of the job with jobId {{jobId}}" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Submitted rating for the employer",
                    action: "SUBMIT_RATING"
                }
            }
        ]
    ]
};