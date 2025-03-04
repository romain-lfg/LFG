import { Plugin, Action, Provider, IAgentRuntime } from "@elizaos/core";
import { LfgMarketService } from "./services/LfgMarketService";
import { acceptJobAction } from "./actions/acceptJobAction";
import { completeJobAction } from "./actions/completeJobAction";
import { submitRatingAction } from "./actions/submitRatingAction";
import { releasePaymentAction } from "./actions/releasePaymentAction";
import { initiateDisputeAction } from "./actions/initiateDisputeAction";
import { getUserReputationAction } from "./actions/getUserReputationAction";
import { getJobDetailsAction } from "./actions/getJobDetailsAction";
import { createBountyAction } from "./actions/createBountyAction";
import { getBountiesAction } from "./actions/getBountiesAction";
import { matchBountiesAction } from "./actions/matchBountiesAction";
import { createUserProfileAction } from "./actions/createUserProfileAction";
import { matchBountiesForUserAction } from "./actions/matchBountiesForUserAction";
import { createLivingDocumentAction } from "./actions/createLivingDocumentAction";
import { testAction } from "./actions/testAction";
import { helpAction } from "./actions/helpAction";
// Create a single instance of the service

const lfgMarketService = new LfgMarketService();

export const vsaContractsPlugin: Plugin = {
    name: "vsa-contracts-plugin",
    description: "Contract interaction job bounties marketplace plugin",
    actions: [
        acceptJobAction, 
        completeJobAction, 
        submitRatingAction, 
        releasePaymentAction, 
        initiateDisputeAction,
        getUserReputationAction,
        getJobDetailsAction,
        createBountyAction,
        getBountiesAction,
        createUserProfileAction,
        matchBountiesForUserAction,
        createLivingDocumentAction,
        testAction,
        helpAction
    ],
    services: [lfgMarketService]
};

export default vsaContractsPlugin;
