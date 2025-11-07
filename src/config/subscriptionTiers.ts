// Madison Studio Subscription Tiers Configuration
// Version 2.0 - Updated Pricing (November 2025)

export type TierId = 'atelier' | 'studio' | 'maison';
export type AddonId = 'whitelabel' | 'images_50' | 'images_100' | 'images_500' | 'brand_slot' | 'team_5pack';

export interface TierLimits {
  id: TierId;
  name: string;
  displayName: string;
  masterContent: number; // -1 = unlimited
  derivatives: number; // -1 = unlimited
  organizations: number; // -1 = unlimited
  productsPerOrg: number; // -1 = unlimited
  images: number;
  madisonQueries: number;
  teamMembers: number; // -1 = unlimited
  marketplaceIntegration: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  support: 'email_48h' | 'priority_email_24h' | 'phone_slack_4h';
  monthlyPrice: number; // in cents
  annualPrice: number; // in cents
}

export interface AddonConfig {
  id: AddonId;
  name: string;
  monthlyPrice: number; // in cents
  requiredTier?: TierId;
  imageCredits?: number;
  additionalOrgs?: number;
  additionalSeats?: number;
  features?: string[];
}

export const TIER_LIMITS: Record<TierId, TierLimits> = {
  atelier: {
    id: 'atelier',
    name: 'Atelier',
    displayName: 'Your Personal Creative Director',
    masterContent: 50,
    derivatives: 200,
    organizations: 1,
    productsPerOrg: 25,
    images: 25,
    madisonQueries: 500,
    teamMembers: 1,
    marketplaceIntegration: false,
    apiAccess: false,
    whiteLabel: false,
    support: 'email_48h',
    monthlyPrice: 4900, // $49.00
    annualPrice: 47000, // $470.00
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    displayName: 'Scale Your Brand Voice',
    masterContent: -1, // unlimited
    derivatives: 1000,
    organizations: 3,
    productsPerOrg: 100,
    images: 100,
    madisonQueries: 2000,
    teamMembers: 5,
    marketplaceIntegration: true,
    apiAccess: false,
    whiteLabel: false, // available as add-on
    support: 'priority_email_24h',
    monthlyPrice: 19900, // $199.00 (increased from $149)
    annualPrice: 199000, // $1,990.00 (increased from $1,490)
  },
  maison: {
    id: 'maison',
    name: 'Maison',
    displayName: 'Your Brand Operating System',
    masterContent: -1, // unlimited
    derivatives: -1, // unlimited
    organizations: -1, // unlimited
    productsPerOrg: -1, // unlimited
    images: 500,
    madisonQueries: 10000,
    teamMembers: -1, // unlimited
    marketplaceIntegration: true,
    apiAccess: true,
    whiteLabel: true, // included
    support: 'phone_slack_4h',
    monthlyPrice: 59900, // $599.00 (increased from $399)
    annualPrice: 599000, // $5,990.00 (increased from $3,990)
  },
};

export const ADDON_CONFIG: Record<AddonId, AddonConfig> = {
  whitelabel: {
    id: 'whitelabel',
    name: 'White-Label Branding',
    monthlyPrice: 19900, // $199.00 (increased from $100)
    requiredTier: 'studio',
    features: [
      'Custom logo & branding',
      'Custom domain (CNAME)',
      'Platform name change',
      'Email white-labeling',
      'Branded onboarding',
      'Small attribution badge',
    ],
  },
  images_50: {
    id: 'images_50',
    name: 'Extra 50 Images',
    monthlyPrice: 2500, // $25.00
    imageCredits: 50,
  },
  images_100: {
    id: 'images_100',
    name: 'Extra 100 Images',
    monthlyPrice: 4500, // $45.00
    imageCredits: 100,
  },
  images_500: {
    id: 'images_500',
    name: 'Extra 500 Images',
    monthlyPrice: 17500, // $175.00
    imageCredits: 500,
  },
  brand_slot: {
    id: 'brand_slot',
    name: 'Additional Brand Slot',
    monthlyPrice: 5000, // $50.00
    requiredTier: 'studio',
    additionalOrgs: 1,
  },
  team_5pack: {
    id: 'team_5pack',
    name: 'Additional 5 Team Members',
    monthlyPrice: 5000, // $50.00
    requiredTier: 'studio',
    additionalSeats: 5,
  },
};

// Helper functions
export function getTierLimits(tierId: TierId): TierLimits {
  return TIER_LIMITS[tierId];
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getAnnualSavings(tierId: TierId): number {
  const tier = TIER_LIMITS[tierId];
  const monthlyTotal = tier.monthlyPrice * 12;
  return monthlyTotal - tier.annualPrice;
}

export function getAnnualSavingsPercent(tierId: TierId): number {
  const tier = TIER_LIMITS[tierId];
  const monthlyTotal = tier.monthlyPrice * 12;
  return Math.round(((monthlyTotal - tier.annualPrice) / monthlyTotal) * 100);
}




