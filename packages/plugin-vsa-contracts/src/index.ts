import { Plugin, Action, Provider, IAgentRuntime } from "@elizaos/core";
import { createJobAction } from "./actions/createJobAction";
import { LfgMarketService } from "./services/LfgMarketService";
import { registerUserAction } from "./actions/registerUserAction";
import { acceptJobAction } from "./actions/acceptJobAction";
import { completeJobAction } from "./actions/completeJobAction";
import { submitRatingAction } from "./actions/submitRatingAction";
import { releasePaymentAction } from "./actions/releasePaymentAction";
import { initiateDisputeAction } from "./actions/initiateDisputeAction";
import { getUserReputationAction } from "./actions/getUserReputationAction";
import { getJobDetailsAction } from "./actions/getJobDetailsAction";
// Create a single instance of the service

const lfgMarketService = new LfgMarketService();

export const vsaContractsPlugin: Plugin = {
    name: "vsa-contracts-plugin",
    description: "Contract interaction job bounties marketplace plugin",
    actions: [
        registerUserAction, 
        createJobAction,
        acceptJobAction, 
        completeJobAction, 
        submitRatingAction, 
        releasePaymentAction, 
        initiateDisputeAction,
        getUserReputationAction,
        getJobDetailsAction
    ],
    services: [lfgMarketService]
};

export default vsaContractsPlugin;
