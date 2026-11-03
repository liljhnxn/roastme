"use client";

import React, { useState } from "react";
import { Share2, Copy, Check, Link as LinkIcon } from "lucide-react";

interface ShareProfileButtonProps {
  walletAddress: string;
  displayName?: string;
}

export function ShareProfileButton({ walletAddress, displayName }: ShareProfileButtonProps) {
  const [copied, setCopied] = useState(false);

  // Full URL construction
  const getProfileUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/profile/${walletAddress}`;
    }
    return `/profile/${walletAddress}`;
  };

  const handleCopy = async () => {
    const url = getProfileUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleNativeShare = async () => {
    const url = getProfileUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Roast or Rate ${displayName || "User"} on RoastMe`,
          text: `Check out ${displayName || "this user"}'s on-chain profile and leave your feedback on RoastMe!`,
          url: url,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error).name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-subtle hover:border-subtle-hover text-xs font-medium text-soft-light transition-all cursor-pointer shadow-sm active:scale-95"
        title="Copy Profile Link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-accent-green font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-soft-muted" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent-purple/15 hover:bg-accent-purple/25 border border-accent-purple/30 text-xs font-medium text-accent-purple transition-all cursor-pointer shadow-sm active:scale-95"
          title="Share via Apps"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      )}
    </div>
  );
}

