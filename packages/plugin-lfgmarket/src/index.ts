import { Plugin, Action, Provider, IAgentRuntime } from "@elizaos/core";
import { createJobAction } from "./actions/createJobAction";
import { friendAction } from "./actions/friendAction";
import { LfgMarketService } from "./services/LfgMarketService";
import { registerUserAction } from "./actions/registerUserAction";
// Create a single instance of the service

const lfgMarketService = new LfgMarketService();

export const lfgMarketPlugin: Plugin = {
    name: "lfg-market-plugin",
    description: "Marketplace for job bounties plugin",
    actions: [registerUserAction],
    services: [lfgMarketService]
};

export default lfgMarketPlugin;
