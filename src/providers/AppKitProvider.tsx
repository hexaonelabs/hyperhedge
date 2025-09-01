import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter } from '../config/appkit'


const queryClient = new QueryClient()

interface AppKitProviderProps {
  children: React.ReactNode
}

export function AppKitProvider({ children }: AppKitProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}