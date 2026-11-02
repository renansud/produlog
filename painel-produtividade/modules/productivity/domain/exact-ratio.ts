export type ExactRatio = Readonly<{ numerator: string; denominator: string }>;

const zero = BigInt(0);
const one = BigInt(1);
const two = BigInt(2);
const hundred = BigInt(100);

function absolute(value: bigint): bigint {
  return value < zero ? -value : value;
}

export function createRatio(numerator: bigint, denominator: bigint): ExactRatio | null {
  if (denominator === zero) return null;
  if (denominator < zero) { numerator = -numerator; denominator = -denominator; }
  let a = absolute(numerator);
  let b = denominator;
  while (b !== zero) { const remainder = a % b; a = b; b = remainder; }
  return { numerator: (numerator / a).toString(), denominator: (denominator / a).toString() };
}

/** Half-up em duas casas, sem conversão para float nem arredondamento anterior. */
export function toFixedDecimal(ratio: ExactRatio): string {
  const numerator = BigInt(ratio.numerator);
  const denominator = BigInt(ratio.denominator);
  if (denominator <= zero) throw new RangeError("Denominador deve ser positivo.");
  const scaled = absolute(numerator) * hundred;
  let rounded = scaled / denominator;
  if ((scaled % denominator) * two >= denominator) rounded += one;
  const sign = numerator < zero && rounded !== zero ? "-" : "";
  return `${sign}${rounded / hundred}.${(rounded % hundred).toString().padStart(2, "0")}`;
}

export function subtractRatios(current: ExactRatio, previous: ExactRatio): ExactRatio | null {
  const currentDenominator = BigInt(current.denominator);
  const previousDenominator = BigInt(previous.denominator);
  if (currentDenominator <= zero || previousDenominator <= zero) return null;
  return createRatio(
    BigInt(current.numerator) * previousDenominator - BigInt(previous.numerator) * currentDenominator,
    currentDenominator * previousDenominator,
  );
}
