/**
 * Billing Tiers Configuration
 * 
 * Define your subscription plans here. Each tier should have a corresponding
 * Stripe Price ID that you create in your Stripe Dashboard.
 * 
 * To get your Stripe Price IDs:
 * 1. Go to Stripe Dashboard → Products
 * 2. Create products/prices for each tier
 * 3. Copy the Price ID (starts with price_...)
 * 4. Add them to the priceId field below
 */

export interface BillingTier {
  id: string;
  name: string;
  description: string;
  price: number; // in dollars
  priceId: string; // Stripe Price ID (e.g., "price_1234567890")
  interval: "month" | "year";
  features: string[];
  popular?: boolean;
  badge?: string;
}

export const BILLING_TIERS: BillingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals and small teams getting started",
    price: 29,
    priceId: import.meta.env.VITE_STRIPE_PRICE_STARTER || "price_starter_monthly", // Replace with your Stripe Price ID
    interval: "month",
    features: [
      "Up to 50 content generations per month",
      "Basic brand voice training",
      "Email & social media content",
      "Content library (up to 100 items)",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need more power and flexibility",
    price: 99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || "price_professional_monthly", // Replace with your Stripe Price ID
    interval: "month",
    features: [
      "Unlimited content generations",
      "Advanced brand voice training",
      "All content types (blog, email, social, product)",
      "Unlimited content library",
      "Image generation (up to 100/month)",
      "Calendar & scheduling",
      "Priority email support",
    ],
    popular: true,
    badge: "Most Popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: 299,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE || "price_enterprise_monthly", // Replace with your Stripe Price ID
    interval: "month",
    features: [
      "Everything in Professional",
      "Unlimited image generation",
      "Team collaboration (up to 20 users)",
      "Advanced analytics & reporting",
      "Custom integrations",
      "Dedicated account manager",
      "SLA & priority support",
    ],
  },
];

// Helper function to get tier by ID
export function getTierById(tierId: string): BillingTier | undefined {
  return BILLING_TIERS.find((tier) => tier.id === tierId);
}

// Helper function to get tier by Stripe Price ID
export function getTierByPriceId(priceId: string): BillingTier | undefined {
  return BILLING_TIERS.find((tier) => tier.priceId === priceId);
}

// Helper function to format price
export function formatPrice(price: number, interval: "month" | "year"): string {
  return `$${price.toFixed(0)}/${interval === "month" ? "mo" : "yr"}`;
}


