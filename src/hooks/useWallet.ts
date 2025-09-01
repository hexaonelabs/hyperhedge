import { useState } from "react";
import {
  useAccount,
  useDisconnect,
  useWalletClient,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { modal } from "../config/appkit";
import { arbitrum } from "viem/chains";


export function useWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();
  const [error, setError] = useState<string | null>(null);

  const openConnectModal = () => {
    modal.open();
  };

  const disconnectWallet = () => {
    disconnect();
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  // Constantes pour les chainIds recommandés pour Hyperliquid
  const SUPPORTED_CHAIN_IDS = [1337, arbitrum.id, 11155111]; // 1337 (Hyperliquid), Arbitrum et Sepolia

  // Fonction pour vérifier et changer de réseau si nécessaire
  const ensureCorrectNetwork = async (requireChainId?: number) => {
    if (!isConnected || !chainId) {
      throw new Error("Wallet not connected");
    }

    const targetChainId = requireChainId || SUPPORTED_CHAIN_IDS[0];

    if (
      !SUPPORTED_CHAIN_IDS.includes(chainId) ||
      (requireChainId && chainId !== requireChainId)
    ) {
      try {
        await new Promise((resolve, reject) => {
          switchChain(
            { chainId: targetChainId },
            {
              onSuccess: () => {
                console.log(`Switched to chainId ${targetChainId}`);
                resolve(true);
              },
              onError: (error) => {
                console.error("Failed to switch network:", error);
                reject(error);
              },
            }
          );
        });
        return true;
      } catch (switchError) {
        console.error("Failed to switch network:", switchError);
        throw new Error(
          `Please switch to chainId ${targetChainId} to use Hyperliquid features`
        );
      }
    }
    return true;
  };

  const signStringMessage = async (message: string) => {
    if (!isConnected || !address || !walletClient) {
      throw new Error("Wallet not connected");
    }

    try {
      const signature = await walletClient.signMessage({
        account: address.toLocaleLowerCase() as `0x${string}`,
        message,
      });
      return signature;
    } catch (err) {
      console.error("Failed to sign message:", err);
      throw new Error("Message signing failed");
    }
  };

  return {
    address,
    isConnected,
    chainId,
    error,
    walletClient,

    // Actions
    openConnectModal,
    disconnectWallet,
    clearError,
    ensureCorrectNetwork,
    signStringMessage,
  };
}
