"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { ROASTME_CONTRACT_ADDRESS } from "@/contracts/config";
import { ROASTME_ABI } from "@/contracts/RoastMeABI";
import { StarRating } from "./StarRating";
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Lock,
  MessageSquarePlus,
} from "lucide-react";

interface FeedbackFormProps {
  targetAddress: `0x${string}`;
  targetName?: string;
  isFeedbackEnabled: boolean;
  onSuccess?: () => void;
}

export function FeedbackForm({
  targetAddress,
  targetName,
  isFeedbackEnabled,
  onSuccess,
}: FeedbackFormProps) {
  const { address, isConnected } = useAccount();
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Check if current user already submitted feedback
  const { data: alreadySubmitted, refetch: refetchSubmitted } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "hasUserGivenFeedback",
    args: address ? [targetAddress, address] : undefined,
    query: {
      enabled: !!address && !!targetAddress,
    },
  });

  const isOwnProfile = address && address.toLowerCase() === targetAddress.toLowerCase();

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
      refetchSubmitted();
      if (onSuccess) onSuccess();
      const timer = setTimeout(() => {
        resetWrite();
        setMessage("");
        setRating(5);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmed, onSuccess, resetWrite, refetchSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isConnected) {
      setFormError("Please connect your wallet first.");
      return;
    }
    if (isOwnProfile) {
      setFormError("You cannot rate or roast your own profile.");
      return;
    }
    if (!isFeedbackEnabled) {
      setFormError("Feedback submissions are currently paused for this profile.");
      return;
    }
    if (alreadySubmitted) {
      setFormError("You have already submitted feedback for this profile.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setFormError("Please select a rating from 1 to 5 stars.");
      return;
    }
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setFormError("Feedback message cannot be empty.");
      return;
    }
    if (trimmedMessage.length > 280) {
      setFormError("Feedback message cannot exceed 280 characters.");
      return;
    }

    try {
      writeContract({
        address: ROASTME_CONTRACT_ADDRESS,
        abi: ROASTME_ABI,
        functionName: "submitFeedback",
        args: [targetAddress, rating, trimmedMessage],
      });
    } catch (err: any) {
      setFormError(err?.message || "Failed to trigger transaction.");
    }
  };

  const errorMessage =
    formError ||
    (writeError
      ? writeError.message.includes("User rejected")
        ? "Transaction was rejected in MetaMask."
        : writeError.message.includes("CannotRateOwnProfile")
        ? "You cannot rate your own profile."
        : writeError.message.includes("FeedbackDisabled")
        ? "Submissions are disabled on this profile."
        : writeError.message.slice(0, 120)
      : null) ||
    (confirmError ? confirmError.message.slice(0, 120) : null);

  // Disabled States
  if (!isFeedbackEnabled) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-subtle p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
          <Lock className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-soft-heading">Submissions Paused</h4>
        <p className="text-xs text-soft-muted mt-1 max-w-sm mx-auto">
          The owner of this profile has temporarily paused receiving new feedback.
        </p>
      </div>
    );
  }

  if (isOwnProfile) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-subtle p-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-soft-heading">This is your profile</h4>
        <p className="text-xs text-soft-muted mt-1 max-w-sm mx-auto">
          You cannot submit feedback to yourself. Share your link with friends or peers to get roasted!
        </p>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="rounded-2xl bg-charcoal-900 border border-accent-green/20 p-6 text-center shadow-card">
        <div className="w-10 h-10 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-soft-heading">Feedback Already Submitted</h4>
        <p className="text-xs text-soft-muted mt-1 max-w-sm mx-auto">
          You have already left your on-chain feedback for this profile. Each wallet can submit one review per profile.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-charcoal-900 border border-subtle p-6 shadow-card">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple">
          <MessageSquarePlus className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-soft-heading">
            Leave Feedback for {targetName || "User"}
          </h3>
          <p className="text-[11px] text-soft-muted">Rate from 1 to 5 stars and drop your thoughts</p>
        </div>
      </div>

      {isConfirmed ? (
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-12 h-12 text-accent-green mb-2 animate-bounce" />
          <h4 className="text-base font-semibold text-soft-heading">Feedback Sent!</h4>
          <p className="text-xs text-soft-muted mt-1">Your review is permanently recorded on Botchain.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Select */}
          <div>
            <label className="block text-xs font-medium text-soft-light mb-1.5">
              Rating: <span className="text-amber-400 font-bold">{rating} Star{rating > 1 ? "s" : ""}</span>
            </label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                interactive={!isSubmitting && !isConfirming}
                onChange={(newRating) => setRating(newRating)}
                size="md"
              />
              <span className="text-xs text-soft-muted">
                {rating === 5
                  ? "🔥 Legendary"
                  : rating === 4
                  ? "👍 Solid"
                  : rating === 3
                  ? "😐 Average"
                  : rating === 2
                  ? "🌶️ Needs improvement"
                  : "💀 Brutal roast"}
              </span>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-soft-light">
                Your Roast / Feedback <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] text-soft-muted font-mono">
                {message.length}/280
              </span>
            </div>
            <textarea
              value={message}
              maxLength={280}
              rows={3}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Be honest, constructive, or spicy. No sensitive info!"
              className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-subtle focus:border-accent-purple focus:outline-none text-soft-heading text-sm placeholder:text-soft-muted/50 transition-colors resize-none"
              disabled={isSubmitting || isConfirming}
            />
          </div>

          {/* Privacy & Safety Warning Alert */}
          <div className="p-3 rounded-xl bg-charcoal-850/80 border border-subtle flex items-start gap-2.5 text-[11px] text-soft-muted">
            <ShieldAlert className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
            <p>
              <strong className="text-soft-light">Privacy Notice:</strong> Blockchain feedback is public, permanent, and linked to your wallet address. Do not include passwords, phone numbers, or private keys.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isConnected || isSubmitting || isConfirming || !message.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-purple-hover hover:opacity-95 text-white text-sm font-semibold transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Confirming in MetaMask...</span>
              </>
            ) : isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting to Botchain...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit On-Chain Feedback</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

