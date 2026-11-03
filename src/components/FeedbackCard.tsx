"use client";

import React from "react";
import { StarRating } from "./StarRating";
import { shortenAddress, formatDate, getExplorerAddressUrl } from "@/lib/utils";
import { ExternalLink, UserCheck, MessageSquare } from "lucide-react";

export interface FeedbackItem {
  sender: string;
  rating: number;
  message: string;
  timestamp: bigint | number;
}

interface FeedbackCardProps {
  feedback: FeedbackItem;
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <div className="group relative rounded-2xl bg-charcoal-900/90 border border-subtle hover:border-subtle-hover p-5 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 flex flex-col justify-between">
      <div>
        {/* Header: Stars & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <StarRating rating={feedback.rating} interactive={false} size="sm" />
          <span className="text-[11px] text-soft-muted font-mono">
            {formatDate(feedback.timestamp)}
          </span>
        </div>

        {/* Message body */}
        <p className="text-soft-light text-sm leading-relaxed whitespace-pre-wrap break-words">
          &ldquo;{feedback.message}&rdquo;
        </p>
      </div>

      {/* Footer: Sender Address & Explorer */}
      <div className="mt-4 pt-3 border-t border-subtle/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-soft-muted">
          <UserCheck className="w-3.5 h-3.5 text-accent-green" />
          <span className="text-[11px]">From:</span>
          <a
            href={getExplorerAddressUrl(feedback.sender)}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-soft-heading hover:text-accent-purple inline-flex items-center gap-1 transition-colors"
            title={feedback.sender}
          >
            {shortenAddress(feedback.sender)}
            <ExternalLink className="w-3 h-3 text-soft-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>

        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">
          Verified On-Chain
        </span>
      </div>
    </div>
  );
}

