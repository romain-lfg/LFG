import { Action, IAgentRuntime, Memory, ServiceType } from "@elizaos/core";
import { LfgMarketService } from "../services/LfgMarketService";

const user = "fred";
const jobId = 1;

export const releasePaymentAction: Action = {
    name: "RELEASE_PAYMENT",
    similes: ["PAY_USER", "PAY_EMPLOYEE","COMPLETE_PAYMENT"],
    description: "Releases escrowed funds for a successful completion of a job",

    validate: async (runtime: IAgentRuntime, _message: Memory) => {
        // Validate settings are present
        return runtime.getSetting("lfgmarket.walletPrivateKey") !== undefined;
    },

    handler: async (runtime: IAgentRuntime, _message: Memory) => {
        const service = runtime.getService(ServiceType.LFG_MARKET) as LfgMarketService;
        const tx = await service.market.releasePayment(user, jobId);
        return true;
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "Releases funds escrowed in the contract to the employee that fulfilled the job's tasks" }
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Released escrowed funds",
                    action: "RELEASE_PAYMENT"
                }
            }
        ]
    ]
};