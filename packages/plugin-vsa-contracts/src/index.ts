import { Plugin, Action, Provider, IAgentRuntime } from "@elizaos/core";
import { LfgMarketService } from "./services/LfgMarketService";
import { acceptJobAction } from "./actions_unfinished/acceptJobAction";
import { completeJobAction } from "./actions_unfinished/completeJobAction";
import { submitRatingAction } from "./actions_unfinished/submitRatingAction";
import { releasePaymentAction } from "./actions_unfinished/releasePaymentAction";
import { initiateDisputeAction } from "./actions_unfinished/initiateDisputeAction";
import { getUserReputationAction } from "./actions_unfinished/getUserReputationAction";
import { getJobDetailsAction } from "./actions_unfinished/getJobDetailsAction";
import { createBountyAction } from "./actions_unfinished/createBountyAction";
import { getBountiesAction } from "./actions_unfinished/getBountiesAction";
import { matchBountiesAction } from "./actions_unfinished/matchBountiesAction";
import { createUserProfileAction } from "./actions_unfinished/createUserProfileAction";


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
        //acceptJobAction, 
        //completeJobAction, 
        //submitRatingAction, 
        //releasePaymentAction, 
        //initiateDisputeAction,
        //getUserReputationAction,
        //getJobDetailsAction,
        //createBountyAction,
        //getBountiesAction,
        //createUserProfileAction,
        matchBountiesForUserAction,
        createLivingDocumentAction,
        testAction,
        helpAction
    ],
    services: [lfgMarketService]
};

export default vsaContractsPlugin;
