export function calculateGramEquivalent(
  loggedAmount: number,
  servingAmount: number,
  gramWeight: number
): number {
  if (servingAmount === 0) return 0;
  return (loggedAmount / servingAmount) * gramWeight;
}

export function calculateNutrientAmount(
  nutrientPer100g: number,
  gramEquivalent: number
): number {
  return (nutrientPer100g * gramEquivalent) / 100;
}

export function formatNutrient(value: number, decimals: number = 1): string {
  if (value === 0) return '0';
  if (value < 0.1 && decimals === 1) {
    return value.toFixed(2);
  }
  return value.toFixed(decimals);
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(percentage, 100);
}
