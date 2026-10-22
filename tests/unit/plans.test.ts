import { describe, expect, it } from 'vitest';
import { formatPrice, getPlan, plans } from '../../src/plans';

describe('plan catalogue', () => {
  it('matches all four prices and discounts from the reference', () => {
    expect(plans.map(({ years, price, originalPrice }) => [years, price, originalPrice - price]))
      .toEqual([[1, 200, 50], [3, 250, 100], [5, 350, 150], [10, 500, 200]]);
    expect(plans.every((plan) => plan.features.length === 4)).toBe(true);
  });

  it('is immutable and rejects unknown plans', () => {
    expect(Object.isFrozen(plans)).toBe(true);
    expect(plans.every(Object.isFrozen)).toBe(true);
    expect(plans.every((plan) => Object.isFrozen(plan.features))).toBe(true);
    expect(getPlan('5-years')?.price).toBe(350);
    expect(getPlan('fake-plan')).toBeUndefined();
  });

  it('formats fixed USD prices without decimals', () => {
    expect(formatPrice(200)).toBe('$200');
    expect(formatPrice(500)).toBe('$500');
  });
});
