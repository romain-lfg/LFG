import { Service, ServiceType, IAgentRuntime } from "@elizaos/core";
import { WebSocket } from 'ws';
import { WebSocketProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { LfgMarket } from "../core/LfgMarket";

// Declare the MARKET service type
declare module "@elizaos/core" {
    interface ServiceTypeMap {
        market: Service & LfgMarketService;
    }

    export enum ServiceType {
        LFG_MARKET = "lfg_market"
    }
}

export class LfgMarketService extends Service {
    private wsConnection: WebSocket | null = null;
    private currentBlock = 0;
    private runtime!: IAgentRuntime;
    market: LfgMarket = null as unknown as LfgMarket;

    static get serviceType(): ServiceType {
        return ServiceType.LFG_MARKET;
    }

    get serviceType(): ServiceType {
        return ServiceType.LFG_MARKET;
    }

    // Remove unnecessary constructor
    // constructor() {
    //     super();
    // }

    async initialize(runtime: IAgentRuntime): Promise<void> {
        this.runtime = runtime;

        // Get WebSocket URL with multiple fallback options
        let wsUrl = runtime.getSetting("MARKET_ETHEREUM_WS_URL")

        let rpcUrl = runtime.getSetting("MARKET_EVM_PROVIDER_URL") 
                    

        // Debug logging
        console.log('MarketService initialize - URLs:', {
            wsUrl,
            rpcUrl
        });

        if (!wsUrl && !rpcUrl) {
            throw new Error("Missing both MARKET_ETHEREUM_WS_URL and MARKET_EVM_PROVIDER_URL envs");
        }

        // If we only have RPC URL, derive WS URL
        if (!wsUrl && rpcUrl) {
            wsUrl = rpcUrl.replace('https://', 'wss://');
            console.log('Using derived WebSocket URL:', wsUrl);
        }

        if (!wsUrl) {
            throw new Error("No WebSocket URL available after all fallbacks");
        }

        // Initialize wallet and providers
        const walletKey = runtime.getSetting("MARKET_EVM_PRIVATE_KEY") 
        if (!walletKey) throw new Error("Missing MARKET_EVM_PRIVATE_KEY env");

        // Initialize provider
        console.log('Initializing WebSocketProvider with URL:', wsUrl);
        const provider = new WebSocketProvider(wsUrl as string);
        const wallet = new Wallet(walletKey, provider);

        // Initialize Market instance with Contract instance
        this.market = new LfgMarket(
            wallet
        );

        // Setup WebSocket connection
        console.log('Setting up WebSocket connection to:', wsUrl);
        this.wsConnection = new WebSocket(wsUrl);
        this.setupWebSocketHandlers();
    }

    private setupWebSocketHandlers(): void {
        if (!this.wsConnection) return;

        this.wsConnection.on('open', () => {
            console.log('WebSocket connection established');
            // Subscribe to new blocks
            this.wsConnection?.send(JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_subscribe',
                params: ['newHeads']
            }));
        });

        this.wsConnection.on('message', async (data: string) => {
            const message = JSON.parse(data);
            if (message.params?.result?.number) {
                this.currentBlock = Number.parseInt(message.params.result.number, 16);
            }
        });

        this.wsConnection.on('error', (error) => {
            console.error('WebSocket error:', error);
        });

        this.wsConnection.on('close', () => {
            console.log('WebSocket connection closed');
            // Attempt to reconnect after a delay
            setTimeout(() => this.initialize(this.runtime), 5000);
        });
    }

    async stop(): Promise<void> {
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
    }
}