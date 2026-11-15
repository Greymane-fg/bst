import { describe, expect, it } from 'vitest';
import { formatPrice, getPlan, plans } from '../../src/plans';

describe('plan catalogue', () => {
  it('uses the updated final prices without changing the original prices', () => {
    expect(plans.map(({ years, price, originalPrice }) => [years, price, originalPrice]))
      .toEqual([[1, 200, 250], [3, 300, 350], [5, 400, 500], [10, 550, 700]]);
    expect(plans.map(({ originalPrice, price }) => originalPrice - price)).toEqual([50, 50, 100, 150]);
    expect(plans.every((plan) => plan.features.length === 4)).toBe(true);
  });

  it('is immutable and rejects unknown plans', () => {
    expect(Object.isFrozen(plans)).toBe(true);
    expect(plans.every(Object.isFrozen)).toBe(true);
    expect(plans.every((plan) => Object.isFrozen(plan.features))).toBe(true);
    expect(getPlan('5-years')?.price).toBe(400);
    expect(getPlan('fake-plan')).toBeUndefined();
  });

  it('marks only the $550 10-year plan as most popular', () => {
    expect(plans.filter((plan) => plan.popular).map(({ id, price }) => [id, price]))
      .toEqual([['10-years', 550]]);
  });

  it('formats fixed USD prices without decimals', () => {
    expect(formatPrice(200)).toBe('$200');
    expect(formatPrice(550)).toBe('$550');
  });
});
