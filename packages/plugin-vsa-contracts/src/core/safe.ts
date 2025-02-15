import { IAgentRuntime } from "@elizaos/core";
import Safe from "@safe-global/protocol-kit";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";

const chain = avalancheFuji;

export const deployNewSafe = async (userAddress: string, runtime: IAgentRuntime) => {
    const saltNonce = Math.trunc(Math.random() * 10 ** 10).toString(); // Random 10-digit integer

    const provider = runtime.getSetting("VSA_CONTRACTS_EVM_PROVIDER_URL") as string
    const signer = runtime.getSetting("VSA_CONTRACTS_EVM_PRIVATE_KEY") as string

    const protocolKit = await Safe.init({
      provider: provider,
      signer: signer,
      predictedSafe: {
        safeAccountConfig: {
          owners: [userAddress],
          threshold: 1,
        },
        safeDeploymentConfig: {
          saltNonce,
        },
      },
    });
  
    const safeAddress = await protocolKit.getAddress();
  
    const deploymentTransaction =
      await protocolKit.createSafeDeploymentTransaction();
  
    const safeClient = await protocolKit.getSafeProvider().getExternalSigner();
  
    const transactionHash = await safeClient?.sendTransaction({
      to: deploymentTransaction.to as `0x${string}`,
      value: BigInt(deploymentTransaction.value),
      data: deploymentTransaction.data as `0x${string}`,
      chain: chain,
    });
  
    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });
  
    await publicClient?.waitForTransactionReceipt({
      hash: transactionHash as `0x${string}`,
    });

    console.log(`A new Safe multisig was successfully deployed on ${chain.name}. You can see it live at https://app.safe.global/home?safe=sep:${safeAddress}. The saltNonce used was ${saltNonce}.`);
  
    return safeAddress;
  };
  