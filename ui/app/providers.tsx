"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Move config inside component to ensure it runs client-side
  const config = useMemo(() => {
    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

    if (!projectId) {
      throw new Error(
        "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. Please add it to your .env.local file.",
      );
    }

    return getDefaultConfig({
      appName: "Base Counter Agent",
      projectId,
      chains: [base, baseSepolia],
      ssr: true,
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
