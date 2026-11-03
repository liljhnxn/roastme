"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ROASTME_CONTRACT_ADDRESS } from "@/contracts/config";
import { ROASTME_ABI } from "@/contracts/RoastMeABI";
import { X, UserPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProfileModal({ isOpen, onClose, onSuccess }: CreateProfileModalProps) {
  const { isConnected } = useAccount();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: txHash,
    error: writeError,
    isPending: isSubmitting,
    writeContract,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      if (onSuccess) onSuccess();
      const timer = setTimeout(() => {
        onClose();
        resetWrite();
        setDisplayName("");
        setBio("");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess, onClose, resetWrite]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setFormError("Display name is required.");
      return;
    }
    if (trimmedName.length > 50) {
      setFormError("Display name cannot exceed 50 characters.");
      return;
    }
    if (bio.length > 120) {
      setFormError("Bio cannot exceed 120 characters.");
      return;
    }

    try {
      writeContract({
        address: ROASTME_CONTRACT_ADDRESS,
        abi: ROASTME_ABI,
        functionName: "createProfile",
        args: [trimmedName, bio.trim()],
      });
    } catch (err: any) {
      setFormError(err?.message || "Failed to trigger transaction.");
    }
  };

  const errorMessage =
    formError ||
    (writeError
      ? writeError.message.includes("User rejected")
        ? "Transaction rejected in MetaMask."
        : writeError.message.slice(0, 100)
      : null) ||
    (confirmError ? confirmError.message.slice(0, 100) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-charcoal-900 border border-subtle p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting || isConfirming}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-soft-muted hover:text-soft-heading hover:bg-charcoal-800 transition-colors disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-soft-heading">Create RoastMe Profile</h3>
            <p className="text-xs text-soft-muted">Set up your on-chain feedback handle</p>
          </div>
        </div>

        {/* Confirmation Success Banner */}
        {isConfirmed ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-accent-green mb-2 animate-bounce" />
            <h4 className="text-base font-semibold text-soft-heading">Profile Created!</h4>
            <p className="text-xs text-soft-muted mt-1">Your on-chain profile is now live on Botchain.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-soft-light">
                  Display Name <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-soft-muted font-mono">
                  {displayName.length}/50
                </span>
              </div>
              <input
                type="text"
                value={displayName}
                maxLength={50}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Satoshi Roaster"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-subtle focus:border-accent-purple focus:outline-none text-soft-heading text-sm placeholder:text-soft-muted/50 transition-colors"
                disabled={isSubmitting || isConfirming}
                autoFocus
              />
            </div>

            {/* Short Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-soft-light">Short Bio</label>
                <span className="text-[11px] text-soft-muted font-mono">
                  {bio.length}/120
                </span>
              </div>
              <textarea
                value={bio}
                maxLength={120}
                rows={3}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Give people context. What do you build or want feedback on?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-subtle focus:border-accent-purple focus:outline-none text-soft-heading text-sm placeholder:text-soft-muted/50 transition-colors resize-none"
                disabled={isSubmitting || isConfirming}
              />
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="break-words">{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!isConnected || isSubmitting || isConfirming || !displayName.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-semibold transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirm in MetaMask...</span>
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering on Botchain...</span>
                  </>
                ) : (
                  <span>Create Profile</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

