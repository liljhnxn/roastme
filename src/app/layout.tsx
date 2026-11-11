import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "RoastMe | On-Chain Feedback & Rating Platform",
  description:
    "Decentralized feedback and rating platform on Botchain Testnet. Share your profile, receive 1–5 star reviews, and collect transparent on-chain feedback.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-soft-light min-h-screen flex flex-col antialiased selection:bg-accent-purple/30 selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-6 md:pt-10">
            {children}
          </main>
          <footer className="border-t border-subtle mt-auto py-8 bg-charcoal-950/60 text-xs text-soft-muted">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <p className="font-semibold text-soft-heading">RoastMe</p>
                <p className="text-[11px] text-soft-muted mt-0.5">
                  Decentralized on-chain feedback platform on Botchain Mainnet (Chain ID 677).
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent-purple transition-colors"
                >
                  Botchain Explorer
                </a>
                <span>•</span>
                <a
                  href="https://rpc.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-accent-purple transition-colors"
                >
                  RPC Endpoint
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

