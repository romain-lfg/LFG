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

export const lfgMarketPlugin: Plugin = {
    name: "lfg-market-plugin",
    description: "Marketplace for job bounties plugin",
    actions: [
        registerUserAction, 
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

export default lfgMarketPlugin;
