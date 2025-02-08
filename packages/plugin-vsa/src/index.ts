import { Plugin } from "@elizaos/core";
import { createBountyAction, createUserProfileAction, getBountiesAction, matchBountiesAction } from "./actions";
export * as actions from "./actions/index.ts";


export const vsaPlugin: Plugin = {
    name: "vsa",
    description: "VSA plugin",
    actions: [createUserProfileAction, createBountyAction, getBountiesAction, matchBountiesAction], //[addressAction, launchTokenAction, testAction],
    evaluators: [],
    providers: [], //[walletProvider],
};

export default vsaPlugin;