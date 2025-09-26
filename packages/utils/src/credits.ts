// Utility helpers for the credit-based billing system

export const CREDIT_SYSTEM = {
  BASE_COST_DOLLARS: 5,
  PANELS_PER_UNIT: 20,
} as const;

/**
 * Calculates the number of panels granted for a dollar amount.
 * Amounts below the base cost return zero panels.
 */
export function calculatePanelsFromDollars(dollars: number): number {
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return 0;
  }

  const units = Math.floor(dollars / CREDIT_SYSTEM.BASE_COST_DOLLARS);
  return units * CREDIT_SYSTEM.PANELS_PER_UNIT;
}

/**
 * Calculates the dollar amount required to purchase a number of panels.
 * Panels are sold in discrete units; partial units round up to the next unit.
 */
export function calculateCostFromPanels(panels: number): number {
  if (!Number.isFinite(panels) || panels <= 0) {
    return 0;
  }

  const units = Math.ceil(panels / CREDIT_SYSTEM.PANELS_PER_UNIT);
  return units * CREDIT_SYSTEM.BASE_COST_DOLLARS;
}

/**
 * Formats a numeric dollar amount using USD currency formatting.
 */
export function formatCurrency(dollars: number, locale: string = 'en-US'): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!Number.isFinite(dollars)) {
    return formatter.format(0);
  }

  return formatter.format(dollars);
}
