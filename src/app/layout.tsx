import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { ROASTME_CONTRACT_ADDRESS } from "@/contracts/config";

export const metadata: Metadata = {
  title: "RoastMe | On-Chain Feedback & Rating Platform",
  description:
    "Decentralized feedback and rating platform on BOT Chain. Share your profile, receive 1–5 star reviews, and collect transparent on-chain feedback.",
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
          <footer className="border-t border-subtle mt-auto py-10 bg-charcoal-950/80 text-xs text-soft-muted">
            <div className="max-w-6xl mx-auto px-4 space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-subtle/50 text-center md:text-left">
                {/* Brand & Ecosystem */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center md:justify-start gap-2.5">
                    <span className="font-bold text-base text-soft-heading">RoastMe</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple border border-accent-purple/30 font-medium">
                      Built on BOT Chain
                    </span>
                  </div>
                  <p className="text-xs text-soft-muted max-w-md">
                    Decentralized on-chain feedback and reputation protocol on BOT Chain Mainnet (Chain ID: 677).
                  </p>
                </div>

                {/* BOT Chain Ecosystem Links */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                  <a
                    href="https://botchain.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-subtle hover:border-accent-purple/40 text-soft-light hover:text-white transition-all shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-accent-purple" />
                    <span>BOT Chain Website</span>
                  </a>

                  <a
                    href="https://scan.botchain.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-subtle hover:border-accent-green/40 text-soft-light hover:text-white transition-all shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-accent-green" />
                    <span>BOT Chain Explorer</span>
                  </a>

                  <a
                    href={`https://scan.botchain.ai/address/${ROASTME_CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 border border-subtle hover:border-subtle-hover text-soft-muted hover:text-soft-heading transition-all"
                  >
                    <span>Verified Contract</span>
                  </a>
                </div>
              </div>

              {/* Bottom Copyright & RPC */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-soft-muted text-center sm:text-left">
                <span>© {new Date().getFullYear()} RoastMe Protocol. All reviews permanently verified on BOT Chain.</span>
                <div className="flex items-center gap-3">
                  <span>RPC: <code className="text-soft-light font-mono text-[10px]">https://rpc.botchain.ai</code></span>
                  <span>•</span>
                  <span>Chain ID: <code className="text-soft-light font-mono text-[10px]">677</code></span>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
