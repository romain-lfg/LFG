import { Plugin, Action, Provider, IAgentRuntime } from "@elizaos/core";
import { createJobAction } from "./actions/createJobAction";
import { faggotAction } from "./actions/faggotAction";
import { LfgMarketService } from "./services/LfgMarketService";
// Create a single instance of the service

const lfgMarketService = new LfgMarketService();

const lfgMarketPlugin: Plugin = {
    name: "lfg-market-plugin",
    description: "Marketplace for job bounties plugin",
    actions: [createJobAction, faggotAction],
    services: [lfgMarketService]
};

export default lfgMarketPlugin;