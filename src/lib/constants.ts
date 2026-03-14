/**
 * Brand constants for consistent branding across the application
 * IMPORTANT: Always use Sentinel DeFi
 */

export const BRAND_NAME = "Sentinel DeFi";
export const BRAND_AUTHOR = "Sentinel DeFi Research Team";
export const BRAND_EMAIL = "info@sentineldefi.online";
export const BRAND_DOMAIN = "sentineldefi.online";
export const BRAND_URL = "https://www.sentineldefi.online";

/**
 * Subscription Pricing - Single source of truth
 * Update these values when prices change
 */
export const PRICING = {
  monthly: {
    amount: 99,
    display: "$99",
    period: "/month",
    stripePrice: "price_1SfmuFLxeGPiI62jZkGuCmqm",
  },
  annual: {
    amount: 1188,
    display: "$1,188",
    period: "/year",
    stripePrice: "price_1Sl04YLxeGPiI62jjtRmPeC9",
  },
};

/**
 * Commission rates for referrals
 * - Monthly subscribers: 50% commission
 * - Annual subscribers: 60% commission (premium benefit)
 */
export const COMMISSION_RATES = {
  monthly: 0.5,
  annual: 0.6,
};

/**
 * Legacy commission rate (for backward compatibility)
 * @deprecated Use COMMISSION_RATES instead
 */
export const COMMISSION_RATE = 0.5;

/**
 * Annual subscriber premium benefits
 */
export const ANNUAL_BENEFITS = {
  bonusRaffleTickets: 5,
  earlyAccessDays: 7,
  commissionRate: 0.6,
};

/**
 * Calculated commission amounts based on pricing and tiered rates
 */
export const COMMISSIONS = {
  monthly: Math.round(PRICING.monthly.amount * COMMISSION_RATES.monthly * 100) / 100,
  annual: Math.round(PRICING.annual.amount * COMMISSION_RATES.annual * 100) / 100,
};