import { defineChain } from "viem";
import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

export const botchainMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: {
    decimals: 18,
    name: "BOT",
    symbol: "BOT",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai"],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "BOT Chain Explorer",
      url: process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER || "https://scan.botchain.ai",
    },
  },
  testnet: false,
});

export const activeChain = botchainMainnet;

export const wagmiConfig = createConfig({
  chains: [botchainMainnet],
  connectors: [
    injected({
      target: "metaMask",
    }),
  ],
  transports: {
    [botchainMainnet.id]: http(
      process.env.NEXT_PUBLIC_BOTCHAIN_RPC_URL || "https://rpc.botchain.ai"
    ),
  },
  ssr: true,
});

export const ROASTME_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x2D08644ebAD640aAb1eB77148a540e47741F9738") as `0x${string}`;
