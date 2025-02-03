import { Plugin } from "@elizaos/core";
import { createUserProfileAction } from "./actions";
export * as actions from "./actions/index.ts";


export const vsaPlugin: Plugin = {
    name: "vsa",
    description: "VSA plugin",
    actions: [createUserProfileAction], //[addressAction, launchTokenAction, testAction],
    evaluators: [],
    providers: [], //[walletProvider],
};

export default vsaPlugin;