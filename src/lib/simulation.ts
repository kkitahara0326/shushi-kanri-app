import type { SimulationInput, SimulationYear } from './types';

/**
 * 複利で毎月積立を加算した将来資産を年ごとに計算
 * 年利は年率として受け取り、月利に変換して複利計算
 */
export function calculateSimulation(input: SimulationInput): SimulationYear[] {
  const { initialAmount, monthlyContribution, annualRatePercent, years } = input;
  const monthlyRate = annualRatePercent / 100 / 12;
  const result: SimulationYear[] = [];
  let total = initialAmount;
  let totalPrincipal = initialAmount;
  const monthlyContributionTotal = monthlyContribution * 12 * years;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      total = total * (1 + monthlyRate) + monthlyContribution;
      totalPrincipal += monthlyContribution;
    }
    const interest = total - totalPrincipal;
    result.push({
      year: new Date().getFullYear() + y,
      total: Math.round(total),
      principal: Math.round(totalPrincipal),
      interest: Math.round(interest),
    });
  }

  return result;
}
