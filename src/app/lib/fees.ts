// Keep these two numbers identical to the constants in functions/index.js
export const COMMISSION = 0.05; // platform keeps 5% of what the creator earns
export const ADVANCE = 0.3;     // customer pays 30% up front, 70% after delivery

export function split(total: number) {
  const advance = Math.round(total * ADVANCE);
  const fee = Math.round(total * COMMISSION);
  const advanceFee = Math.round(advance * COMMISSION);
  return { advance, balance: total - advance, fee, advanceFee, balanceFee: fee - advanceFee, net: total - fee };
}
