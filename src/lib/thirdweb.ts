import { createThirdwebClient, getContract, defineChain } from "thirdweb";

/**
 * Thirdweb Configuration for Sentinel DeFi
 * 
 * IMPORTANT: For production, ensure these values are correct:
 * - THIRDWEB_CLIENT_ID: Get from https://thirdweb.com/dashboard/settings/api-keys
 * - WALLETCONNECT_PROJECT_ID: Get from https://cloud.walletconnect.com
 * 
 * The WalletConnect project ID is CRITICAL for mobile wallet connections.
 * Without a valid project ID, mobile deep linking won't work properly.
 */

// Thirdweb Client ID - Required for thirdweb SDK
// This is a publishable key (safe for client-side)
export const THIRDWEB_CLIENT_ID = "87309968bcf322141f6cdb41ada4edcf";

// WalletConnect Project ID - Required for WalletConnect v2 mobile connections
// Get your own at https://cloud.walletconnect.com (free)
// This enables QR code scanning and mobile deep linking
export const WALLETCONNECT_PROJECT_ID = "0ceca1527f12a6186d4a1003bc45b2d9";

// Create the Thirdweb client with error handling
export const thirdwebClient = createThirdwebClient({
  clientId: THIRDWEB_CLIENT_ID,
});

// App metadata for WalletConnect - shown in wallet connection prompts
// This helps users identify your app when connecting from their wallet
export const appMetadata = {
  name: "Sentinel DeFi",
  description: "DeFi Education & Research",
  url: typeof window !== "undefined" ? window.location.origin : "https://sentineldefi.online",
  logoUrl: "https://sentineldefi.online/android-chrome-192x192.png",
  // Additional fields for better wallet UX
  icons: ["https://sentineldefi.online/android-chrome-192x192.png"],
};

// Ethereum Mainnet chain
export const ethereum = defineChain(1);

// NFT Contract Address (Sentinel DeFi Access NFT)
export const NFT_CONTRACT_ADDRESS = "0x91AE8ec3d88E871679F826c1D6c5B008f105506c";

// Get NFT Contract instance
export const getNFTContract = () => {
  return getContract({
    client: thirdwebClient,
    chain: ethereum,
    address: NFT_CONTRACT_ADDRESS,
  });
};

// Supported external wallets (App Store compliant - no custodial wallets)
// Order matters - WalletConnect should be first for mobile
export const SUPPORTED_WALLETS = [
  "walletConnect", // Primary for mobile - works with ANY wallet
  "io.metamask",
  "com.coinbase.wallet", 
  "me.rainbow",
  "com.trustwallet.app",
  "app.phantom",
] as const;

// Helper to detect if user is on mobile
export const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
};

// Helper to detect if user is in a wallet's in-app browser
export const isInWalletBrowser = () => {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("metamask") ||
    ua.includes("coinbase") ||
    ua.includes("rainbow") ||
    ua.includes("trust") ||
    ua.includes("phantom")
  );
};
