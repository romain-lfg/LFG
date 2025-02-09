import { Action, composeContext, elizaLogger, generateObjectDeprecated, HandlerCallback, IAgentRuntime, Memory, ModelClass, ServiceType, State } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";
import { isAddress } from "@ethersproject/address";
import { JobData } from "../type";

const dataTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "user": "0xf94563b7013384EB4b3243D37250068Ee483857a",
    "description": "Write a plugin for an Eliza OS agent to help trade tokens on Uniswap.",
    "deadline": 1712985600,
    "payment": 100
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the bounty: >>>(DO NOT RENAME THE KEYS)<<< 
- user

Respond with a JSON markdown block containing only the extracted values.`;

function isJobData(
    content: JobData
): content is JobData {
    if (!isAddress(content.user)) {
        elizaLogger.error("Invalid user address");
        return false;
    }
    return (
        typeof content.user === "string" &&
        isAddress(content.user) &&
        typeof content.description === "string" &&
        typeof content.deadline === "number" &&
        typeof content.payment === "number"
    );
}

async function processJobData(jobData: JobData, runtime: IAgentRuntime) {
    elizaLogger.info("Processing payment for user address:", jobData.user);

    const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
    const tx = await service.market.createJob(jobData.user, jobData.description, jobData.deadline, jobData.payment.toString());
}

export const createJobAction: Action = {
    name: "CREATE_JOB",
    similes: ["MAKE_JOB", "GENERATE_JOB", "REGISTER_JOB"],
    description: "Creates a job",
    
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

        elizaLogger.info("Create job action handler called");

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
    
            if (!isJobData(content)) {
                const requiredParameters = ["user", "description", "deadline", "payment"];
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
                                error: "Missing required job parameters",
                            },
                        });
                    }
                    return false; // Exit the handler to avoid looping
                }
    
                // Create rating data
                const jobDataFilled: JobData = {
                    user: content.user,
                    description: content.description,
                    deadline: content.deadline,
                    payment: content.payment
                };
    
                // Call the function to process the rating
                await processJobData(jobDataFilled, runtime);
                if (callback) {
                    callback({
                        text: `Successfully created a job.`,
                        content: {
                            success: true,
                            jobDataFilled,
                        },
                    });
                }
    
                return true;
            } else {
                console.log("Job data is valid");
                if (callback) {
                    callback({
                        text: `Thank you. You have successfully registered a job.`,
                        content: {
                            success: true,
                            content,
                        },
                    });

                }
                const jobDataFilled: JobData = {
                    user: content.user,
                    description: content.description,
                    deadline: content.deadline,
                    payment: content.payment
                };
                await processJobData(jobDataFilled, runtime);
                return false;
            }
        } catch (error: any) {
            elizaLogger.error("Error creating a job with error", error);
            if (callback) {
                callback({
                    text: `Error creating a job with error: ${error.message}`,
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
                content: { text: "Create a new job on the job bounty marketplace." }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Created bounty.",
                    action: "CREATE_JOB"
                }
            }
        ]
    ]
};