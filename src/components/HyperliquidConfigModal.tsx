import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  Key,
  Globe,
  User,
  Check,
  AlertTriangle,
  Edit3,
  Eye,
  EyeOff,
  Wand2,
} from "lucide-react";
import { useWallet } from "../hooks/useWallet";
import { useHyperliquidConfig } from "../hooks/useHyperliquidConfig";
import { HyperliquidConfig } from "../types";
import { SecureKeyManager } from "../utils/SecureKeyManager";
import { approveWalletAgent } from "../services/hl-exchange.service";

interface HyperliquidConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HyperliquidConfigModal: React.FC<HyperliquidConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isConnected, address, signStringMessage, walletClient } = useWallet();
  const {
    config,
    isLoading,
    error,
    hasConfig,
    isConfigured,
    saveConfig,
    clearConfig,
  } = useHyperliquidConfig();
  const [step, setStep] = useState(1);
  const [isValid, setIsValid] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [mode, setMode] = useState<"setup" | "edit">(
    isConnected && hasConfig && isConfigured ? "edit" : "setup"
  );
  const [formConfig, setFormConfig] = useState<HyperliquidConfig>(config);

  useEffect(() => {
    const { apiWalletPrivateKey, ...rest } = config;
    if (!apiWalletPrivateKey) {
      setFormConfig({ ...rest, apiWalletPrivateKey: "" });
    } else {
      setFormConfig({ ...rest });
    }
  }, [config]);

  // Validate form
  useEffect(() => {
    const isAddressValid = formConfig.subAccountAddress
      ? ((formConfig.subAccountAddress.length || 0) === 42 &&
          formConfig.subAccountAddress.startsWith("0x")) ||
        false
      : true;
    const hasPrivateKey = (formConfig?.apiWalletPrivateKey?.length || 0) > 0;
    const isPrivateKeyValid =
      (formConfig?.apiWalletPrivateKey?.length || 0) === 64 ||
      (formConfig?.apiWalletPrivateKey?.startsWith("0x") &&
        formConfig?.apiWalletPrivateKey?.length === 66) ||
      false;
    if (hasPrivateKey) {
      setIsValid(isAddressValid && isPrivateKeyValid);
    } else {
      setIsValid(isAddressValid);
    }
  }, [formConfig]);

  const handleSave = async () => {
    if (formConfig.apiWalletPrivateKey) {
      const signature = await signStringMessage("HyperHedge-Config-Encrypt");
      const encodedKey = await SecureKeyManager.encrypt(
        formConfig.apiWalletPrivateKey,
        signature
      );
      saveConfig({ ...formConfig, apiWalletPrivateKey: encodedKey });
    } else {
      saveConfig({
        ...config,
        ...formConfig,
      });
    }
  };

  const handleNext = () => {
    if (step < 4) {
      const newStep = step + 1;
      setStep(newStep);
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSwitchToSetup = () => {
    setMode("setup");
    setStep(1);
  };

  const handleDeleteConfig = () => {
    clearConfig();
    setMode("setup");
    setStep(1);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { apiWalletPrivateKey, ...rest } = config;
            setFormConfig(() => ({ ...rest }));
            onClose();
          }}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-dark-900 border border-dark-700 shadow-2xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Hyperliquid Configuration
                </h3>
                <p className="text-sm text-dark-300">
                  {mode === "edit"
                    ? "Manage your SDK configuration"
                    : "Configure your SDK to interact with Hyperliquid"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected && hasConfig && mode === "setup" && (
                <button
                  onClick={() => setMode("edit")}
                  className="p-2 text-dark-400 hover:text-primary-400 hover:bg-dark-800 rounded-lg transition-colors"
                  title="Switch to edit mode"
                >
                  <Edit3 size={18} />
                </button>
              )}
              <button
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { apiWalletPrivateKey, ...rest } = config;
                  setFormConfig(() => ({ ...rest }));
                  onClose();
                }}
                className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Connection Warning */}
          {!isConnected && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle
                  size={16}
                  className="text-yellow-400 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-yellow-300 text-sm font-medium">
                    Wallet Not Connected
                  </p>
                  <p className="text-yellow-200 text-sm mt-1">
                    Please connect your wallet to manage your Hyperliquid
                    configuration securely.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle
                  size={16}
                  className="text-red-400 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-red-300 text-sm">{error}</p>
                  <button
                    onClick={() => {}}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                <p className="text-primary-300 text-sm">Processing...</p>
              </div>
            </div>
          )}

          {mode === "edit" ? (
            /* Edit Mode - Direct Form */
            <>
              <div className="space-y-6">
                {/* Environment Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Globe className="w-5 h-5 text-primary-400" />
                    <h4 className="text-lg font-medium text-white">
                      Environment
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        setFormConfig({ ...formConfig, isTestnet: false })
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        !formConfig.isTestnet
                          ? "border-primary-500 bg-primary-500/10 text-white"
                          : "border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600"
                      }`}
                    >
                      <div className="text-center">
                        <h5 className="font-medium">Mainnet</h5>
                        <p className="text-xs opacity-75">Production</p>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        setFormConfig({ ...formConfig!, isTestnet: true })
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formConfig.isTestnet
                          ? "border-primary-500 bg-primary-500/10 text-white"
                          : "border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600"
                      }`}
                    >
                      <div className="text-center">
                        <h5 className="font-medium">Testnet</h5>
                        <p className="text-xs opacity-75">Development</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Sub-Account Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-primary-400" />
                    <h4 className="text-lg font-medium text-white">
                      Sub-Account
                    </h4>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-200">
                      Sub-account address
                    </label>
                    <input
                      type="text"
                      value={formConfig.subAccountAddress}
                      onChange={(e) =>
                        setFormConfig({
                          ...formConfig,
                          subAccountAddress: e.target.value as `0x${string}`,
                        })
                      }
                      placeholder="0x..."
                      className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                    {formConfig.subAccountAddress && (
                      <div className="flex items-center space-x-2 text-xs">
                        {(formConfig.subAccountAddress?.length || 0) === 42 &&
                        formConfig.subAccountAddress.startsWith("0x") ? (
                          <>
                            <Check size={14} className="text-primary-400" />
                            <span className="text-primary-400">
                              Valid address
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={14} className="text-red-400" />
                            <span className="text-red-400">
                              Invalid address (expected format: 0x...)
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* API Wallet Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-primary-400" />
                      <h4 className="text-lg font-medium text-white">
                        API Wallet
                      </h4>
                    </div>
                  </div>

                  {/* Configuration Status Card */}
                  {config.apiWalletPrivateKey &&
                    (formConfig.apiWalletPrivateKey?.length ?? -1) === -1 && (
                      <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                              <Check size={16} className="text-primary-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm">
                                API Wallet Configured
                              </p>
                              <p className="text-dark-300 text-xs">
                                Your private key is securely stored
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                setFormConfig({
                                  ...formConfig!,
                                  apiWalletPrivateKey: "",
                                })
                              }
                              className="px-3 py-1.5 text-xs text-dark-300 hover:text-white border border-dark-600 hover:border-dark-500 rounded-lg transition-colors"
                              title="Edit configuration"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Configuration Input */}
                  {(formConfig.apiWalletPrivateKey?.length ?? -1) >= 0 && (
                    <div className="space-y-4">
                      {/* Options Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Automatic Generation Card */}
                        <div className="p-4 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                <Wand2 size={18} className="text-primary-400" />
                              </div>
                              <div>
                                <h5 className="text-white font-medium text-sm">
                                  Authorize Wallet Agent
                                </h5>
                                <p className="text-dark-300 text-xs">
                                  Create and authorize a new API wallet
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (!walletClient) return;
                                const { privateKey } = await approveWalletAgent(walletClient, formConfig.isTestnet)
                                setFormConfig({
                                  ...formConfig!,
                                  apiWalletPrivateKey: privateKey,
                                });
                              }}
                              disabled={!walletClient}
                              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:text-dark-400 text-black rounded-lg transition-colors text-sm font-medium"
                            >
                              {!walletClient ? 'Connect your wallet' : 'Authorize'}
                            </button>
                          </div>
                        </div>

                        {/* Manual Input Card */}
                        <div className="p-4 bg-dark-800/50 border border-dark-700 rounded-xl">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                <Key size={18} className="text-orange-400" />
                              </div>
                              <div>
                                <h5 className="text-white font-medium text-sm">
                                  Existing Private Key
                                </h5>
                                <p className="text-dark-300 text-xs">
                                  Use a private key you already own and have authorized
                                </p>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <input
                                type={showPrivateKey ? "text" : "password"}
                                value={formConfig?.apiWalletPrivateKey || ""}
                                onChange={(e) =>
                                  setFormConfig({
                                    ...formConfig!,
                                    apiWalletPrivateKey: e.target.value,
                                  })
                                }
                                placeholder="Enter your private key..."
                                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                              >
                                {showPrivateKey ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>

                            {/* Validation Status */}
                            {formConfig?.apiWalletPrivateKey && (
                              <div className="flex items-center space-x-2 text-xs">
                                {formConfig.apiWalletPrivateKey.length === 64 ||
                                (formConfig.apiWalletPrivateKey.startsWith("0x") &&
                                  formConfig.apiWalletPrivateKey.length === 66) ? (
                                  <>
                                    <Check size={14} className="text-primary-400" />
                                    <span className="text-primary-400">
                                      Valid private key
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle size={14} className="text-red-400" />
                                    <span className="text-red-400">
                                      Invalid private key (64 hex characters required)
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle
                        size={14}
                        className="text-yellow-400 flex-shrink-0 mt-0.5"
                      />
                      <div className="text-xs text-yellow-200">
                        <p className="font-medium mb-1">Security Notice</p>
                        <p>
                          Your private key is stored locally in your browser
                          only and encrypted with your wallet signature.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Mode Footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-800">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSwitchToSetup}
                    className="px-4 py-2 text-dark-300 hover:text-white border border-dark-600 hover:border-dark-500 rounded-lg transition-colors"
                  >
                    Setup Mode
                  </button>
                  <button
                    onClick={handleDeleteConfig}
                    className="px-4 py-2 text-red-400 hover:text-red-300 border border-red-600/30 hover:border-red-500/50 rounded-lg transition-colors"
                  >
                    Delete Config
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!isValid || isLoading}
                  className="btn-primary text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Update Configuration"}
                </button>
              </div>
            </>
          ) : (
            /* Setup Mode - Step by Step */
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-dark-300">
                    Step {step} of 4
                  </span>
                  <span className="text-sm text-dark-300">
                    {Math.round((step / 4) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-dark-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Content */}
              <div className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Globe className="w-6 h-6 text-primary-400" />
                      <h4 className="text-lg font-medium text-white">
                        Environment
                      </h4>
                    </div>
                    <p className="text-dark-300 text-sm mb-6">
                      Choose the environment you want to operate on.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          setFormConfig({ ...formConfig, isTestnet: false })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          !formConfig.isTestnet
                            ? "border-primary-500 bg-primary-500/10 text-white"
                            : "border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                            <Globe size={16} className="text-white" />
                          </div>
                          <h5 className="font-medium">Mainnet</h5>
                          <p className="text-xs opacity-75">Production</p>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          setFormConfig({ ...formConfig, isTestnet: true })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formConfig?.isTestnet
                            ? "border-primary-500 bg-primary-500/10 text-white"
                            : "border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-8 h-8 mx-auto mb-2 bg-orange-500 rounded-full flex items-center justify-center">
                            <Globe size={16} className="text-white" />
                          </div>
                          <h5 className="font-medium">Testnet</h5>
                          <p className="text-xs opacity-75">Development</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <User className="w-6 h-6 text-primary-400" />
                      <h4 className="text-lg font-medium text-white">
                        Sub-Account
                      </h4>
                    </div>
                    <p className="text-dark-300 text-sm mb-6">
                      Enter your Hyperliquid sub-account address.
                    </p>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-dark-200">
                        Sub-account address
                      </label>
                      <input
                        type="text"
                        value={formConfig?.subAccountAddress}
                        onChange={(e) =>
                          setFormConfig({
                            ...formConfig!,
                            subAccountAddress: e.target.value as `0x${string}`,
                          })
                        }
                        placeholder="0x..."
                        className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      />
                      {formConfig?.subAccountAddress && (
                        <div className="flex items-center space-x-2 text-xs">
                          {formConfig.subAccountAddress.length === 42 &&
                          formConfig.subAccountAddress.startsWith("0x") ? (
                            <>
                              <Check size={14} className="text-primary-400" />
                              <span className="text-primary-400">
                                Valid address
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle
                                size={14}
                                className="text-red-400"
                              />
                              <span className="text-red-400">
                                Invalid address (expected format: 0x...)
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Key className="w-6 h-6 text-primary-400" />
                      <h4 className="text-lg font-medium text-white">
                        API Wallet
                      </h4>
                    </div>
                    <p className="text-dark-300 text-sm mb-6">
                      Configure your API Wallet for Hyperliquid. You can automatically
                      generate a wallet or use an existing private key.
                    </p>

                    {/* Configuration Status Card */}
                    {config.apiWalletPrivateKey &&
                      (formConfig.apiWalletPrivateKey?.length ?? -1) === -1 && (
                        <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <Check size={16} className="text-primary-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">
                                  API Wallet Configured
                                </p>
                                <p className="text-dark-300 text-xs">
                                  Your private key is securely stored
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setFormConfig({
                                  ...formConfig!,
                                  apiWalletPrivateKey: "",
                                })
                              }
                              className="px-3 py-1.5 text-xs text-dark-300 hover:text-white border border-dark-600 hover:border-dark-500 rounded-lg transition-colors"
                              title="Edit configuration"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )}

                    {/* Configuration Input */}
                    {(formConfig.apiWalletPrivateKey?.length ?? -1) >= 0 && (
                      <div className="space-y-4">
                        {/* Options Cards */}
                        <div className="grid grid-cols-1 gap-4">
                          {/* Automatic Generation Card */}
                          <div className="p-4 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-primary-500/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                  <Wand2 size={18} className="text-primary-400" />
                                </div>
                                <div>
                                  <h5 className="text-white font-medium text-sm">
                                    Authorize Wallet Agent
                                  </h5>
                                  <p className="text-dark-300 text-xs">
                                    Create and authorize a new API wallet
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  if (!walletClient) return;
                                  const { privateKey } = await approveWalletAgent(walletClient, formConfig.isTestnet)
                                  setFormConfig({
                                    ...formConfig!,
                                    apiWalletPrivateKey: privateKey,
                                  });
                                }}
                                disabled={!walletClient}
                                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-700 disabled:text-dark-400 text-black rounded-lg transition-colors text-sm font-medium"
                              >
                                {!walletClient ? 'Connect your wallet' : 'Authorize'}
                              </button>
                            </div>
                          </div>

                          {/* Manual Input Card */}
                          <div className="p-4 bg-dark-800/50 border border-dark-700 rounded-xl">
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                  <Key size={18} className="text-orange-400" />
                                </div>
                                <div>
                                  <h5 className="text-white font-medium text-sm">
                                    Existing Private Key
                                  </h5>
                                  <p className="text-dark-300 text-xs">
                                    Use a private key you already own and have authorized
                                  </p>
                                </div>
                              </div>
                              
                              <div className="relative">
                                <input
                                  type={showPrivateKey ? "text" : "password"}
                                  value={formConfig?.apiWalletPrivateKey || ""}
                                  onChange={(e) =>
                                    setFormConfig({
                                      ...formConfig!,
                                      apiWalletPrivateKey: e.target.value,
                                    })
                                  }
                                  placeholder="Enter your private key..."
                                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                                >
                                  {showPrivateKey ? (
                                    <EyeOff size={18} />
                                  ) : (
                                    <Eye size={18} />
                                  )}
                                </button>
                              </div>

                              {/* Validation Status */}
                              {formConfig?.apiWalletPrivateKey && (
                                <div className="flex items-center space-x-2 text-xs">
                                  {formConfig.apiWalletPrivateKey.length === 64 ||
                                  (formConfig.apiWalletPrivateKey.startsWith("0x") &&
                                    formConfig.apiWalletPrivateKey.length === 66) ? (
                                    <>
                                      <Check size={14} className="text-primary-400" />
                                      <span className="text-primary-400">
                                        Valid private key
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle size={14} className="text-red-400" />
                                      <span className="text-red-400">
                                        Invalid private key (64 hex characters required)
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Notice */}
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle
                          size={16}
                          className="text-yellow-400 flex-shrink-0 mt-0.5"
                        />
                        <div className="text-sm text-yellow-200">
                          <p className="font-medium mb-1">
                            Important Security Notice
                          </p>
                          <p>
                            Never share your private key. It is stored locally
                            in your browser only and encrypted with your signature.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Check className="w-6 h-6 text-primary-400" />
                      <h4 className="text-lg font-medium text-white">
                        Summary
                      </h4>
                    </div>
                    <p className="text-dark-300 text-sm mb-6">
                      Review your configuration before saving.
                    </p>

                    <div className="space-y-4 p-4 bg-dark-800/50 rounded-xl border border-dark-700">
                      <div className="flex justify-between items-center">
                        <span className="text-dark-300">Environment:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            formConfig?.isTestnet
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {formConfig?.isTestnet ? "Testnet" : "Mainnet"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-300">Wallet Address:</span>
                        <span className="text-white font-mono text-sm">
                          {address ? (
                            <>
                              {address.slice(0, 6)}...
                              {address.slice(-4)}
                            </>
                          ) : (
                            "Not set"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-300">Sub-account:</span>
                        <span className="text-white font-mono text-sm">
                          {formConfig?.subAccountAddress ? (
                            <>
                              {formConfig.subAccountAddress.slice(0, 6)}...
                              {formConfig.subAccountAddress.slice(-4)}
                            </>
                          ) : (
                            "Not set"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-dark-300">API Key:</span>
                        {formConfig?.apiWalletPrivateKey ? (
                          formConfig.apiWalletPrivateKey.length === 64 ||
                          (formConfig.apiWalletPrivateKey.startsWith("0x") &&
                            formConfig.apiWalletPrivateKey.length === 66) ? (
                            <span className="text-primary-400 text-sm">
                              ✓ Configured
                            </span>
                          ) : (
                            <span className="text-red-400 text-sm">
                              ✗ Invalid API Key
                            </span>
                          )
                        ) : (
                          <span className="text-dark-400 text-sm">
                            Not configured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Setup Mode Footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-800">
                <button
                  onClick={handlePrevious}
                  disabled={step === 1 || isLoading}
                  className="px-4 py-2 text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-3">
                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      disabled={
                        isLoading ||
                        (step === 2 &&
                          formConfig.subAccountAddress &&
                          (formConfig.subAccountAddress.length !== 42 ||
                            !formConfig.subAccountAddress.startsWith("0x"))) ||
                        (step === 3 &&
                          formConfig?.apiWalletPrivateKey &&
                          (!formConfig?.apiWalletPrivateKey ||
                            (formConfig.apiWalletPrivateKey.length !== 64 &&
                              !(
                                formConfig.apiWalletPrivateKey.startsWith(
                                  "0x"
                                ) &&
                                formConfig.apiWalletPrivateKey.length === 66
                              )))) ||
                        false
                      }
                      className="btn-primary text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={!isValid || isLoading}
                      className="btn-primary text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Saving..." : "Save Configuration"}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HyperliquidConfigModal;
