// Stripe product and price mapping
export const STRIPE_PRODUCTS = {
  jobSeeker: {
    product_id: "prod_U73XAmz1gdzuHr",
    price_id: "price_1T8pQ7AElvCNQFKWEiWQInGw",
    name: "Video Feature (Legacy)",
    price: "$40",
    period: "/year",
  },
  videoBunny: {
    product_id: "prod_U74obW7A1LodF7",
    price_id: "price_1T8qesAElvCNQFKWXyzgj0sn",
    name: "Video Upload Bunny.net",
    price: "$19.90",
    period: "/year",
  },
  featuredUser: {
    product_id: "prod_U73d1ta0UT0PGt",
    price_id: "price_1T8pWDAElvCNQFKWnknBOF2Z",
    name: "Featured User",
    price: "$200",
    period: "/mo",
  },
  jobPosting: {
    product_id: "prod_U73eqf6WUcuXH2",
    price_id: "price_1T8pWsAElvCNQFKWEEpbIQsI",
    name: "Job Posting",
    price: "$400",
    period: "/mo",
  },
  companyHighlight: {
    product_id: "prod_U73efeqOAoBqqd",
    price_id: "price_1T8pXdAElvCNQFKWp9JoWr9P",
    name: "Company Highlight",
    price: "$500",
    period: "/mo",
  },
} as const;

export function getProductByProductId(productId: string) {
  return Object.values(STRIPE_PRODUCTS).find(p => p.product_id === productId);
}
