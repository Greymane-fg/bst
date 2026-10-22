export interface Plan {
  readonly id: string;
  readonly name: string;
  readonly years: number;
  readonly price: number;
  readonly originalPrice: number;
  readonly features: readonly string[];
}

/** The only source of truth for displayed prices and submitted plan details. */
export const plans: readonly Plan[] = Object.freeze([
  Object.freeze({
    id: '1-year',
    name: '1 YEAR PLAN',
    years: 1,
    price: 200,
    originalPrice: 250,
    features: Object.freeze([
      'Brand Schema implementation',
      'Basic Organization markup',
      'Business information setup',
      'Suitable for new businesses',
    ]),
  }),
  Object.freeze({
    id: '3-years',
    name: '3 YEARS PLAN',
    years: 3,
    price: 250,
    originalPrice: 350,
    features: Object.freeze([
      'Advanced Brand Schema setup',
      'Priority implementation',
      'Enhanced Organization markup',
      'Recommended for growing stores',
    ]),
  }),
  Object.freeze({
    id: '5-years',
    name: '5 YEARS PLAN',
    years: 5,
    price: 350,
    originalPrice: 500,
    features: Object.freeze([
      'Advanced structured data setup',
      'Long-term implementation support',
      'Brand entity optimization',
      'Enhanced search understanding',
    ]),
  }),
  Object.freeze({
    id: '10-years',
    name: '10 YEARS PLAN',
    years: 10,
    price: 500,
    originalPrice: 700,
    features: Object.freeze([
      'Complete Brand Schema setup',
      'Advanced Organization markup',
      'Priority implementation',
      'Maximum implementation support',
    ]),
  }),
]);

export function getPlan(id: string): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}
