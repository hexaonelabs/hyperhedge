import { HyperliquidConfig } from "../types";
import { SecureKeyManager } from "./SecureKeyManager";

export async function getHyperliquidConfig(
  signStringMessage: (message: string) => Promise<string>
): Promise<HyperliquidConfig | null> {
  try {
    const stored = localStorage.getItem("hyperliquid-config");
    if (!stored) return null;
 
    const signature = await signStringMessage("HyperHedge-Config-Encrypt");
    const decryptedJSON = await SecureKeyManager.decrypt(stored, signature);

    if (!decryptedJSON) {
      console.error("Failed to decrypt configuration data");
      return null;
    }
    const parsedConfig: HyperliquidConfig = JSON.parse(decryptedJSON);
    return parsedConfig;
  } catch (error) {
    console.error("Error loading Hyperliquid configuration:", error);
    return null;
  }
}

export async function setHyperliquidConfig(
  signStringMessage: (message: string) => Promise<string>,
  config: HyperliquidConfig
): Promise<void> {
  const signature = await signStringMessage("HyperHedge-Config-Encrypt");
  const encryptedConfig = await SecureKeyManager.encrypt(JSON.stringify(config), signature);
  localStorage.setItem("hyperliquid-config", encryptedConfig);
}

/**
 * Vérifie si une configuration Hyperliquid existe
 * @returns true si une configuration existe
 */
export function hasHyperliquidConfig(): boolean {
  const savedConfig = localStorage.getItem("hyperliquid-config");
  return !!savedConfig;
}

/**
 * Supprime la configuration Hyperliquid du localStorage
 */
export function clearHyperliquidConfig(): void {
  localStorage.removeItem("hyperliquid-config");
}
