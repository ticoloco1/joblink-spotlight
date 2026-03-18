export const AD_PRODUCTS = {
  banner728x90: {
    product_id: 'prod_U74UxPrXMo91Cy',
    price_id: 'price_1T8qLfAElvCNQFKWbsNgvtfV',
    name: 'Banner 728x90 (Header/Footer)',
    price: '$15',
    period: '/day',
    width: 728,
    height: 90,
    placement: 'header' as const,
  },
  banner300x250: {
    product_id: 'prod_U74VmM2GhBeYJh',
    price_id: 'price_1T8qMkAElvCNQFKW879d3Rzr',
    name: 'Banner 300x250 (Sidebar)',
    price: '$25',
    period: '/day',
    width: 300,
    height: 250,
    placement: 'sidebar' as const,
  },
} as const;
