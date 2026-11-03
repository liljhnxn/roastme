"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Flame, Wallet, AlertTriangle, LogOut, ExternalLink, User, ChevronDown, CheckCircle2 } from "lucide-react";
import { shortenAddress, getExplorerAddressUrl } from "@/lib/utils";
import { botchainTestnet } from "@/contracts/config";

export function Navbar() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [menuOpen, setMenuOpen] = useState(false);

  const isWrongNetwork = isConnected && chainId !== botchainTestnet.id;

  const handleConnect = () => {
    // Look for injected / metamask connector
    const injectedConnector = connectors.find((c) => c.id === "injected" || c.name.toLowerCase().includes("metamask")) || connectors[0];
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-subtle bg-charcoal-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-green/30 border border-accent-purple/40 flex items-center justify-center text-accent-purple group-hover:scale-105 transition-transform shadow-glow">
            <Flame className="w-5 h-5 text-accent-purple animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-soft-heading">
              Roast<span className="text-accent-purple">Me</span>
            </span>
            <span className="text-[10px] text-accent-green font-medium -mt-1 tracking-wider uppercase">
              On-Chain Feedback
            </span>
          </div>
        </Link>

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          {/* Wrong Network Warning Pill */}
          {isWrongNetwork && (
            <button
              onClick={() => switchChain({ chainId: botchainTestnet.id })}
              disabled={isSwitching}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-medium hover:bg-amber-500/25 transition-all shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSwitching ? "Switching..." : "Switch to Botchain (968)"}</span>
            </button>
          )}

          {/* Network indicator pill when connected properly */}
          {isConnected && !isWrongNetwork && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-charcoal-900 border border-subtle text-[11px] text-soft-muted">
              <span className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_rgba(56,178,132,0.6)]" />
              <span>Botchain Testnet</span>
            </div>
          )}

          {/* Wallet Button */}
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-medium transition-all shadow-glow hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-850 border border-subtle hover:border-subtle-hover transition-all text-sm font-medium text-soft-heading"
              >
                <div className="w-6 h-6 rounded-lg bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>{shortenAddress(address)}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-soft-muted transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Wallet Dropdown Menu */}
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-charcoal-900 border border-subtle p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-subtle mb-1">
                      <p className="text-[11px] text-soft-muted uppercase tracking-wider font-semibold">Connected Wallet</p>
                      <p className="text-xs font-mono text-soft-heading truncate mt-0.5">{address}</p>
                    </div>

                    <Link
                      href={`/profile/${address}`}
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-soft-light hover:bg-charcoal-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-accent-purple" />
                      <span>View My Profile</span>
                    </Link>

                    <a
                      href={getExplorerAddressUrl(address)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-soft-light hover:bg-charcoal-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-soft-muted" />
                      <span>View on Explorer</span>
                    </a>

                    {isWrongNetwork && (
                      <button
                        onClick={() => {
                          switchChain({ chainId: botchainTestnet.id });
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Switch Network</span>
                      </button>
                    )}

                    <div className="border-t border-subtle my-1" />

                    <button
                      onClick={() => {
                        disconnect();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Wrong Network Banner */}
      {isWrongNetwork && (
        <div className="sm:hidden px-4 py-2 bg-amber-500/20 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Wrong network. Switch to Botchain.</span>
          </div>
          <button
            onClick={() => switchChain({ chainId: botchainTestnet.id })}
            className="px-2.5 py-1 rounded bg-amber-500 text-charcoal-950 font-semibold text-[11px]"
          >
            Switch
          </button>
        </div>
      )}
    </header>
  );
}

