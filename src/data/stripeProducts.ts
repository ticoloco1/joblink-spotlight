// Stripe product and price IDs — created via Stripe dashboard / API
// All prices are one-time unless noted

export const STRIPE_PRICES = {
  // Subdomain registrations (one-time)
  subdomain_1_letter: {
    product_id: "prod_U7lEDgfMa1IVDv",
    price_id: "price_1T9Vhp6Q9SupCEmjo4XeGFR6",
    amount: 2000_00, // $2,000
    label: "1 Letter",
  },
  subdomain_2_letters: {
    product_id: "prod_U7lF0FBYzAc33f",
    price_id: "price_1T9VjA6Q9SupCEmjpqyItFk4",
    amount: 1500_00, // $1,500
    label: "2 Letters",
  },
  subdomain_3_letters: {
    product_id: "prod_U7lGHb9rEotVLS",
    price_id: "price_1T9Vjb6Q9SupCEmj7t0F1eOB",
    amount: 1000_00, // $1,000
    label: "3 Letters",
  },
  subdomain_4_letters: {
    product_id: "prod_U7lGgDZmLe1MoC",
    price_id: "price_1T9Vk06Q9SupCEmjtpk16uCT",
    amount: 500_00, // $500
    label: "4 Letters",
  },

  // Boosts (one-time)
  boost_zap: {
    product_id: "prod_U7lGeGsFAHGOK9",
    price_id: "price_1T9VkA6Q9SupCEmjJJPwXJkn",
    amount: 50, // $0.50
    label: "Zap",
  },
  boost_directory: {
    product_id: "prod_U7lGhoYm13hhq8",
    price_id: "price_1T9VkB6Q9SupCEmjNPBBVshX",
    amount: 150, // $1.50
    label: "Directory Highlight (24h)",
  },
  boost_homepage: {
    product_id: "prod_U7lGtHtfpUsHDN",
    price_id: "price_1T9VkB6Q9SupCEmjgAn0VrKY",
    amount: 100000, // $1,000
    label: "Homepage Top (7 days)",
  },

  // CV Unlock (one-time)
  cv_unlock: {
    product_id: "prod_U7lGpcXmKbePqa",
    price_id: "price_1T9VkD6Q9SupCEmjjTxVC0kb",
    amount: 2000, // $20
    label: "CV Unlock",
  },

  // Corporate Subscription (monthly recurring)
  corporate_subscription: {
    product_id: "prod_U7lGVir5fqF2Z6",
    price_id: "price_1T9VkE6Q9SupCEmjC0qET8Fj",
    amount: 39900, // $399/month
    label: "Corporate Plan",
    recurring: true,
  },
} as const;

/** Helper to get subdomain price by slug length */
export function getSubdomainPriceByLength(length: number) {
  if (length === 1) return STRIPE_PRICES.subdomain_1_letter;
  if (length === 2) return STRIPE_PRICES.subdomain_2_letters;
  if (length === 3) return STRIPE_PRICES.subdomain_3_letters;
  if (length === 4) return STRIPE_PRICES.subdomain_4_letters;
  return null; // 5+ letters are free (only $12/year registration)
}

/** Default prices by slug length (for admin reference) */
export const SLUG_PRICES_BY_LENGTH: Record<number, number> = {
  1: 2000,
  2: 1500,
  3: 1000,
  4: 500,
  5: 250,
  6: 100,
  7: 50,
};

/** Annual registration/renewal fee for all slugs */
export const SLUG_ANNUAL_FEE = 12;

/** Platform fee on slug P2P sales */
export const SLUG_PLATFORM_FEE_PCT = 5;
