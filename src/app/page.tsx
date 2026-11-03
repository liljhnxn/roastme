"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { ROASTME_CONTRACT_ADDRESS, botchainTestnet } from "@/contracts/config";
import { ROASTME_ABI } from "@/contracts/RoastMeABI";
import { StarRating } from "@/components/StarRating";
import { FeedbackCard, FeedbackItem } from "@/components/FeedbackCard";
import { ShareProfileButton } from "@/components/ShareProfileButton";
import { CreateProfileModal } from "@/components/CreateProfileModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { FeedbackStatusToggle } from "@/components/FeedbackStatusToggle";
import { formatRating, shortenAddress, getExplorerAddressUrl } from "@/lib/utils";
import {
  Flame,
  Star,
  MessageSquare,
  Sparkles,
  UserPlus,
  Edit3,
  ExternalLink,
  Users,
  Compass,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Read current user's profile
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "getProfile",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read user's feedback
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    refetch: refetchFeedback,
  } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "getFeedback",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read community profiles for directory exploration
  const { data: allProfileAddresses, refetch: refetchDirectory } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "getAllProfiles",
  });

  const profileExists = profileData && profileData.exists;

  const refreshAll = () => {
    refetchProfile();
    refetchFeedback();
    refetchDirectory();
  };

  const feedbacks: FeedbackItem[] = feedbackData
    ? [...feedbackData].reverse().map((fb: any) => ({
        sender: fb.sender,
        rating: Number(fb.rating),
        message: fb.message,
        timestamp: fb.timestamp,
      }))
    : [];

  const averageRatingScaled =
    profileData && profileData.totalFeedback > 0n
      ? (profileData.sumRatings * 100n) / profileData.totalFeedback
      : 0n;

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-charcoal-900 to-charcoal-950 border border-subtle p-8 md:p-12 shadow-card">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent-purple/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-accent-green/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-accent-purple" />
            <span>Unfiltered, permanent on-chain reviews on Botchain</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-soft-heading leading-tight">
            Get Roasted. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-purple via-accent-purple-light to-accent-green">
              Collect On-Chain Proof.
            </span>
          </h1>

          <p className="text-soft-muted text-sm md:text-base leading-relaxed">
            Create your profile, share your personalized link, and let your peers, teammates, and visitors drop honest ratings and feedback directly on the blockchain.
          </p>

          {!isConnected ? (
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-soft-muted">
                Connect your MetaMask wallet in the top right to get started.
              </span>
            </div>
          ) : !profileExists && !isLoadingProfile ? (
            <div className="pt-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-semibold transition-all shadow-glow hover:scale-[1.02] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Your RoastMe Profile</span>
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Connected User Dashboard */}
      {isConnected && (
        <section className="space-y-6">
          {isLoadingProfile ? (
            <div className="p-12 rounded-2xl bg-charcoal-900 border border-subtle text-center text-soft-muted text-sm">
              Loading your on-chain profile...
            </div>
          ) : !profileExists ? (
            /* Prompt to create profile */
            <div className="rounded-2xl bg-charcoal-900/90 border border-accent-purple/20 p-8 text-center space-y-4 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center text-accent-purple mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-soft-heading">You don&apos;t have a RoastMe profile yet</h3>
              <p className="text-sm text-soft-muted max-w-md mx-auto">
                Register your handle and short bio on Botchain Testnet to receive 1–5 star ratings and reviews from the Web3 community.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-hover text-white text-sm font-semibold transition-all shadow-glow cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Claim Your Profile</span>
              </button>
            </div>
          ) : (
            /* Existing Profile Dashboard */
            <div className="space-y-6">
              {/* Profile Header Card */}
              <div className="rounded-2xl bg-charcoal-900 border border-subtle p-6 md:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-soft-heading">
                      {profileData.displayName}
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple border border-accent-purple/20 font-medium">
                      Profile Owner
                    </span>
                    <FeedbackStatusToggle
                      isEnabled={profileData.feedbackEnabled}
                      onSuccess={refreshAll}
                    />
                  </div>

                  <p className="text-sm text-soft-light max-w-xl">
                    {profileData.bio || "No bio set yet."}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-soft-muted font-mono pt-1">
                    <span>{shortenAddress(address)}</span>
                    <a
                      href={getExplorerAddressUrl(address)}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-accent-purple transition-colors inline-flex items-center gap-1"
                      title="View on Botchain Explorer"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Profile Controls & Sharing */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-subtle hover:border-subtle-hover text-xs font-medium text-soft-light transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-accent-purple" />
                    <span>Edit Profile</span>
                  </button>

                  {address && (
                    <ShareProfileButton
                      walletAddress={address}
                      displayName={profileData.displayName}
                    />
                  )}

                  <Link
                    href={`/profile/${address}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-xs font-medium text-soft-heading transition-all"
                  >
                    <span>Public View</span>
                    <ArrowRight className="w-3.5 h-3.5 text-accent-green" />
                  </Link>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Average Rating Card */}
                <div className="rounded-2xl bg-charcoal-900 border border-subtle p-6 shadow-card flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-soft-muted">
                      Average Rating
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-soft-heading">
                        {formatRating(averageRatingScaled)}
                      </span>
                      <span className="text-xs text-soft-muted">/ 5.0</span>
                    </div>
                    <div className="pt-1">
                      <StarRating
                        rating={Number(averageRatingScaled) / 100}
                        interactive={false}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Star className="w-6 h-6 fill-amber-400" />
                  </div>
                </div>

                {/* Total Feedback Card */}
                <div className="rounded-2xl bg-charcoal-900 border border-subtle p-6 shadow-card flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-soft-muted">
                      Total Feedback Received
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-soft-heading">
                        {profileData.totalFeedback.toString()}
                      </span>
                      <span className="text-xs text-soft-muted">reviews</span>
                    </div>
                    <p className="text-[11px] text-accent-green font-medium pt-1">
                      {profileData.feedbackEnabled ? "● Accepting new submissions" : "○ Submissions paused"}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center text-accent-green">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Recent Feedback Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-soft-heading">Your Feedback History</h3>
                    <p className="text-xs text-soft-muted">
                      All feedback received from visitors on Botchain
                    </p>
                  </div>
                  <span className="text-xs text-soft-muted font-mono">
                    {feedbacks.length} item{feedbacks.length === 1 ? "" : "s"}
                  </span>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="rounded-2xl bg-charcoal-900/60 border border-subtle/80 p-10 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-charcoal-800 flex items-center justify-center text-soft-muted mx-auto">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-soft-heading">No feedback received yet</h4>
                    <p className="text-xs text-soft-muted max-w-sm mx-auto">
                      Share your profile link on X, Discord, or Telegram so people can start rating and roasting you!
                    </p>
                    {address && (
                      <div className="pt-2 flex justify-center">
                        <ShareProfileButton
                          walletAddress={address}
                          displayName={profileData.displayName}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedbacks.map((item, idx) => (
                      <FeedbackCard key={idx} feedback={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Community Directory / Explore Profiles */}
      <section className="space-y-4 pt-6 border-t border-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent-green/15 border border-accent-green/30 flex items-center justify-center text-accent-green">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-soft-heading">Explore Community Profiles</h3>
              <p className="text-xs text-soft-muted">Browse other profiles on Botchain and submit feedback</p>
            </div>
          </div>
          <span className="text-xs text-soft-muted font-mono">
            {allProfileAddresses?.length || 0} registered
          </span>
        </div>

        {allProfileAddresses && allProfileAddresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allProfileAddresses.map((addr) => (
              <CommunityProfileCard key={addr} address={addr as `0x${string}`} />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-charcoal-900 border border-subtle text-center text-xs text-soft-muted">
            No other profiles found yet on Botchain. Be the first to create one!
          </div>
        )}
      </section>

      {/* Modals */}
      <CreateProfileModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refreshAll}
      />

      {profileData && profileData.exists && (
        <EditProfileModal
          isOpen={isEditOpen}
          initialName={profileData.displayName}
          initialBio={profileData.bio}
          onClose={() => setIsEditOpen(false)}
          onSuccess={refreshAll}
        />
      )}
    </div>
  );
}

// Mini preview card for Community Directory
function CommunityProfileCard({ address }: { address: `0x${string}` }) {
  const { data: profile } = useReadContract({
    address: ROASTME_CONTRACT_ADDRESS,
    abi: ROASTME_ABI,
    functionName: "getProfile",
    args: [address],
  });

  if (!profile || !profile.exists) return null;

  const avg =
    profile.totalFeedback > 0n
      ? (profile.sumRatings * 100n) / profile.totalFeedback
      : 0n;

  return (
    <Link
      href={`/profile/${address}`}
      className="group p-4 rounded-xl bg-charcoal-900/90 border border-subtle hover:border-subtle-hover transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card block"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm text-soft-heading group-hover:text-accent-purple transition-colors truncate">
          {profile.displayName}
        </h4>
        <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{formatRating(avg)}</span>
        </div>
      </div>

      <p className="text-xs text-soft-muted line-clamp-2 h-8 mb-3">
        {profile.bio || "No bio provided."}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-subtle/60 text-[11px] text-soft-muted">
        <span className="font-mono">{shortenAddress(address)}</span>
        <span className="text-accent-green font-medium">
          {profile.totalFeedback.toString()} reviews
        </span>
      </div>
    </Link>
  );
}

