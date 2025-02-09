import { Action, composeContext, elizaLogger, generateObjectDeprecated, HandlerCallback, IAgentRuntime, Memory, ModelClass, ServiceType, State } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { AcceptedJobData, CompletedJobData } from "../type";

const dataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "user": "0xf94563b7013384EB4b3243D37250068Ee483857a",
    "jobId": 1
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- user

Respond with a JSON markdown block containing only the extracted values.`;

function isAcceptedJobData(
    content: AcceptedJobData
): content is AcceptedJobData {
    if (!isAddress(content.user)) {
        elizaLogger.error("Invalid user address");
        return false;
    }
    return (
        typeof content.user === "string" &&
        isAddress(content.user) &&
        typeof content.jobId === "number"
    );
}

async function processAcceptedJobData(acceptedJobData: AcceptedJobData, runtime: IAgentRuntime) {
    elizaLogger.info("Processing job acceptance for:", acceptedJobData.user);

    const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
    const tx = await service.market.acceptJob(acceptedJobData.user, acceptedJobData.jobId);
}

export const acceptJobAction: Action = {
    name: "ACCEPT_JOB",
    similes: ["TAKE_JOB", "START_JOB"],
    description: "Accepts a job",
    
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

        elizaLogger.info("Accept job action handler called");

        try {
            const context = composeContext({
                state,
                template: dataTemplate,
            });
    
            const content = (await generateObjectDeprecated({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            }));
    
            if (!isAcceptedJobData(content)) {
                const requiredParameters = ["user", "jobId"];
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

                if (missing.length > 0) {
                    const missingParamsList = missing.join(", ");
                    const promptMessage = `Please provide the following missing information: ${missingParamsList}.`;
    
                    if (callback) {
                        callback({
                            text: "Please provide the following missing information: " + missingParamsList, //promptMessage,
                            content: {
                                success: false,
                                error: "Missing required payment parameters",
                            },
                        });
                    }
                    return false; // Exit the handler to avoid looping
                }
    
                // Create rating data
                const acceptedJobDataFilled: AcceptedJobData = {
                    user: content.user,
                    jobId: content.jobId
                };
    
                // Call the function to process the rating
                await processAcceptedJobData(acceptedJobDataFilled, runtime);
                if (callback) {
                    callback({
                        text: `Successfully accepted a job.`,
                        content: {
                            success: true,
                            acceptedJobDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("Accepted job data is valid");
                if (callback) {
                    callback({
                        text: `Thank you. You have successfully accepted a job.`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                const acceptedJobDataFilled: AcceptedJobData = {
                    user: content.user,
                    jobId: content.jobId
                };
                await processAcceptedJobData(acceptedJobDataFilled, runtime);
                return false;
            }
        } catch (error: any) {
            elizaLogger.error("Error accepting a job with error", error);
            if (callback) {
                callback({
                    text: `Error accepting a job with error: ${error.message}`,
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
                content: { text: "I want to accept a job on the job bounty marketplace." }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Successfully accepted job",
                    action: "ACCEPT_JOB"
                }
            }
        ]
    ]
};