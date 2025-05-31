"use client";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "wagmi/chains";
import '@rainbow-me/rainbowkit/styles.css';


const wagmiConfig = getDefaultConfig({
    chains: [monadTestnet],
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID || 'b83bf335646992f89618effa100dd365',
    appName: "Token Eater",
});

const queryClient = new QueryClient();

type ProvidersProps = { children: ReactNode };

const Providers = ({ children }: ProvidersProps) => (
    <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
);

export default Providers; 