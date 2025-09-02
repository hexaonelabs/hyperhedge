import { HyperliquidConfig } from "../types";

export async function getHyperliquidConfig(): Promise<HyperliquidConfig | null> {
  try {
    const stored = localStorage.getItem("hyperliquid-config");
    if (!stored) return null;
    const parsedConfig: HyperliquidConfig = JSON.parse(stored);
    return parsedConfig;
  } catch (error) {
    console.error("Error loading Hyperliquid configuration:", error);
    return null;
  }
}

export async function setHyperliquidConfig(
  config: HyperliquidConfig
): Promise<void> {
  localStorage.setItem("hyperliquid-config", JSON.stringify(config));
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
