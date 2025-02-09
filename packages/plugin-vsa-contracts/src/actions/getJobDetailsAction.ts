import { Action, composeContext, elizaLogger, generateObjectDeprecated, HandlerCallback, IAgentRuntime, Memory, ModelClass, ServiceType, State } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { JobDetailsData } from "../type";

const dataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "jobId": 1
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- user

Respond with a JSON markdown block containing only the extracted values.`;

function isJobDetailsData(
    content: JobDetailsData
): content is JobDetailsData {
    return (
        typeof content.jobId === "number"
    );
}

async function processJobDetailsData(jobDetailsData: JobDetailsData, runtime: IAgentRuntime) {
    elizaLogger.info("Fetching job details for job id ", jobDetailsData.jobId);

    const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
    const jobDetails = await service.market.getJobDetails(jobDetailsData.jobId);
    return jobDetails;
}

export const getJobDetailsAction: Action = {
    name: "GET_DETAILS",
    similes: ["GET_DETAILS", "JOB_DETAILS", "GET_JOB_DETAILS"],
    description: "Gets the details of a specific job",
    
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

        elizaLogger.info("Get job details action handler called");

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
    
            if (!isJobDetailsData(content)) {
                const requiredParameters = ["jobId"];
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
                const jobDetailsDataFilled: JobDetailsData = {
                    jobId: content.jobId
                };
    
                // Call the function to process the rating
                const jobDetails = await processJobDetailsData(jobDetailsDataFilled, runtime);
                if (callback) {
                    const jobDetailsString = JSON.stringify({
                        ...jobDetails,
                        payment: jobDetails.payment.toString(),
                        deadline: jobDetails.deadline.toString()
                    }, null, 2)
                    callback({
                        text: `Job Details: ${jobDetailsString}`,
                        content: {
                            success: true,
                            jobDetailsDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("Job details data is valid");
        
                const jobDetailsDataFilled: JobDetailsData = {
                    jobId: content.jobId
                };
                const jobDetails = await processJobDetailsData(jobDetailsDataFilled, runtime);
                if (callback) {
                    const jobDetailsString = JSON.stringify({
                        ...jobDetails,
                        payment: jobDetails.payment.toString(),
                        deadline: jobDetails.deadline.toString()
                    }, null, 2)
                    callback({
                        text: `Job Details: ${jobDetailsString}`,
                        content: {
                            success: true,
                            jobDetailsDataFilled,
                        },
                    });
                }
                return false;
            }
        } catch (error: any) {
            elizaLogger.error("Error getting job details with error", error);
            if (callback) {
                callback({
                    text: `Error getting job details with error: ${error.message}`,
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
                content: { text: "Get the details for a specific job" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Fetched job details.",
                    action: "GET_DETAILS"
                }
            }
        ]
    ]
};