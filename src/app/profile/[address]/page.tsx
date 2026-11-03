"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { isAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { ROASTME_CONTRACT_ADDRESS } from "@/contracts/config";
import { ROASTME_ABI } from "@/contracts/RoastMeABI";
import { StarRating } from "@/components/StarRating";
import { FeedbackCard, FeedbackItem } from "@/components/FeedbackCard";
import { FeedbackForm } from "@/components/FeedbackForm";
import { ShareProfileButton } from "@/components/ShareProfileButton";
import { EditProfileModal } from "@/components/EditProfileModal";
import { FeedbackStatusToggle } from "@/components/FeedbackStatusToggle";
import { formatRating, shortenAddress, getExplorerAddressUrl } from "@/lib/utils";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  ShieldAlert,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const rawAddress = params?.address as string | undefined;
  const validAddress = rawAddress && isAddress(rawAddress) ? (rawAddress as `0x${string}`) : undefined;

  const { address: currentAccount } = useAccount();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Read target profile details
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
    error: profileError,
  } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "getProfile",
    args: validAddress ? [validAddress] : undefined,
    query: {
      enabled: !!validAddress,
    },
  });

  // Read target profile feedback
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    refetch: refetchFeedback,
  } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "getFeedback",
    args: validAddress ? [validAddress] : undefined,
    query: {
      enabled: !!validAddress,
    },
  });

  const isOwner =
    currentAccount &&
    validAddress &&
    currentAccount.toLowerCase() === validAddress.toLowerCase();

  const handleCopyFullAddress = async () => {
    if (!validAddress) return;
    try {
      await navigator.clipboard.writeText(validAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSuccess = () => {
    refetchProfile();
    refetchFeedback();
  };

  if (!validAddress) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-soft-heading">Invalid Profile Address</h2>
        <p className="text-sm text-soft-muted">
          The requested wallet address is not a valid Ethereum-style address.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-xs text-soft-light transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-purple border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-soft-muted">Fetching on-chain profile from Botchain...</p>
      </div>
    );
  }

  const profileExists = profileData && profileData.exists;

  if (!profileExists) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-charcoal-850 border border-subtle text-soft-muted flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 text-soft-muted" />
        </div>
        <h2 className="text-xl font-bold text-soft-heading">Profile Not Found</h2>
        <p className="text-sm text-soft-muted max-w-sm mx-auto">
          No RoastMe profile has been registered on Botchain for wallet:
          <br />
          <span className="font-mono text-xs text-soft-light">{validAddress}</span>
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-semibold hover:bg-accent-purple-hover transition-all shadow-glow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Home / Create Profile</span>
          </Link>
        </div>
      </div>
    );
  }

  const feedbacks: FeedbackItem[] = feedbackData
    ? [...feedbackData].reverse().map((fb: any) => ({
        sender: fb.sender,
        rating: Number(fb.rating),
        message: fb.message,
        timestamp: fb.timestamp,
      }))
    : [];

  const averageRatingScaled =
    profileData.totalFeedback > 0n
      ? (profileData.sumRatings * 100n) / profileData.totalFeedback
      : 0n;

  return (
    <div className="space-y-8 pb-16">
      {/* Navigation link back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-soft-muted hover:text-soft-heading transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Main Profile Header Card */}
      <div className="rounded-3xl bg-gradient-to-b from-charcoal-900 to-charcoal-950 border border-subtle p-6 sm:p-8 md:p-10 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold text-soft-heading tracking-tight">
                {profileData.displayName}
              </h1>
              {isOwner && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple border border-accent-purple/20 font-medium">
                  Your Profile
                </span>
              )}
              {isOwner ? (
                <FeedbackStatusToggle
                  isEnabled={profileData.feedbackEnabled}
                  onSuccess={handleFeedbackSuccess}
                />
              ) : (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                    profileData.feedbackEnabled
                      ? "bg-accent-green/10 border-accent-green/20 text-accent-green"
                      : "bg-charcoal-850 border-subtle text-soft-muted"
                  }`}
                >
                  {profileData.feedbackEnabled ? "● Accepting Feedback" : "○ Submissions Paused"}
                </span>
              )}
            </div>

            <p className="text-sm md:text-base text-soft-light max-w-2xl leading-relaxed whitespace-pre-wrap">
              {profileData.bio || "No bio set."}
            </p>

            {/* Wallet Address with Full copy & explorer link */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-soft-muted">Wallet:</span>
              <button
                onClick={handleCopyFullAddress}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-charcoal-850 border border-subtle font-mono text-soft-light hover:border-subtle-hover transition-colors"
                title="Click to copy full address"
              >
                <span>{shortenAddress(validAddress, 6)}</span>
                {copiedAddress ? (
                  <Check className="w-3 h-3 text-accent-green" />
                ) : (
                  <Copy className="w-3 h-3 text-soft-muted" />
                )}
              </button>

              <a
                href={getExplorerAddressUrl(validAddress)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-charcoal-850 border border-subtle text-soft-muted hover:text-soft-light transition-colors"
                title="View on Botchain Explorer"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start">
            {isOwner && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-subtle text-xs font-medium text-soft-light transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-accent-purple" />
                <span>Edit</span>
              </button>
            )}
            <ShareProfileButton
              walletAddress={validAddress}
              displayName={profileData.displayName}
            />
          </div>
        </div>

        {/* Aggregate Review Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-subtle/70">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Star className="w-6 h-6 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-soft-heading">
                  {formatRating(averageRatingScaled)}
                </span>
                <span className="text-xs text-soft-muted">/ 5.0</span>
              </div>
              <div className="pt-0.5">
                <StarRating
                  rating={Number(averageRatingScaled) / 100}
                  interactive={false}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center text-accent-green">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-soft-heading">
                {profileData.totalFeedback.toString()}
              </span>
              <p className="text-xs text-soft-muted">Total On-Chain Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Feedback Form & Feedbacks List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Feedback Submission Form */}
        <div className="lg:col-span-5 space-y-4">
          <FeedbackForm
            targetAddress={validAddress}
            targetName={profileData.displayName}
            isFeedbackEnabled={profileData.feedbackEnabled}
            onSuccess={handleFeedbackSuccess}
          />
        </div>

        {/* Right Column: Feedback History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-soft-heading">Feedback & Roasts</h3>
            <span className="text-xs text-soft-muted font-mono">
              {feedbacks.length} review{feedbacks.length === 1 ? "" : "s"}
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="rounded-2xl bg-charcoal-900 border border-subtle/80 p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-soft-heading">No feedback posted yet</p>
              <p className="text-xs text-soft-muted max-w-sm mx-auto">
                Be the first visitor to leave a rating and message for {profileData.displayName}!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {feedbacks.map((item, idx) => (
                <FeedbackCard key={idx} feedback={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal (if owner) */}
      {isOwner && (
        <EditProfileModal
          isOpen={isEditOpen}
          initialName={profileData.displayName}
          initialBio={profileData.bio}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </div>
  );
}

