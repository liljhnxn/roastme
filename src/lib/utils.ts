import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  if (!address.startsWith("0x") || address.length < chars * 2 + 2) {
    return address;
  }
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatRating(scaledRating: bigint | number | undefined): string {
  if (scaledRating === undefined || scaledRating === null) return "0.0";
  const num = typeof scaledRating === "bigint" ? Number(scaledRating) : scaledRating;
  if (num === 0) return "0.0";
  return (num / 100).toFixed(1);
}

export function formatDate(timestamp: bigint | number | undefined): string {
  if (!timestamp) return "Just now";
  const ms = typeof timestamp === "bigint" ? Number(timestamp) * 1000 : timestamp * 1000;
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getExplorerTxUrl(txHash?: string): string {
  if (!txHash) return "";
  const base = process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER || "https://scan.botchain.ai";
  return `${base.replace(/\/$/, "")}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address?: string): string {
  if (!address) return "";
  const base = process.env.NEXT_PUBLIC_BOTCHAIN_EXPLORER || "https://scan.botchain.ai";
  return `${base.replace(/\/$/, "")}/address/${address}`;
}

