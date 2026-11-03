"use client";

import React, { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ROASTME_CONTRACT_ADDRESS } from "@/contracts/config";
import { ROASTME_ABI } from "@/contracts/RoastMeABI";
import { ToggleLeft, ToggleRight, Loader2, Check } from "lucide-react";

interface FeedbackStatusToggleProps {
  isEnabled: boolean;
  onSuccess?: () => void;
}

export function FeedbackStatusToggle({ isEnabled, onSuccess }: FeedbackStatusToggleProps) {
  const {
    data: txHash,
    error: writeError,
    isPending: isSubmitting,
    writeContract,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      if (onSuccess) onSuccess();
      const t = setTimeout(() => reset(), 2000);
      return () => clearTimeout(t);
    }
  }, [isConfirmed, onSuccess, reset]);

  const handleToggle = () => {
    try {
      writeContract({
        address: ROASTME_CONTRACT_ADDRESS,
        abi: ROASTME_ABI,
        functionName: "setFeedbackStatus",
        args: [!isEnabled],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isBusy = isSubmitting || isConfirming;

  return (
    <button
      onClick={handleToggle}
      disabled={isBusy}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
        isEnabled
          ? "bg-accent-green/10 border-accent-green/30 text-accent-green hover:bg-accent-green/20"
          : "bg-charcoal-850 border-subtle text-soft-muted hover:text-soft-light"
      } disabled:opacity-50 cursor-pointer`}
      title={isEnabled ? "Click to pause feedback submissions" : "Click to allow feedback submissions"}
    >
      {isBusy ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isEnabled ? (
        <ToggleRight className="w-4 h-4 text-accent-green" />
      ) : (
        <ToggleLeft className="w-4 h-4 text-soft-muted" />
      )}
      <span>{isBusy ? "Updating..." : isEnabled ? "Feedback Open" : "Feedback Paused"}</span>
    </button>
  );
}

