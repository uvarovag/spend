const tokenPattern = /\d+\.?\d*|[+\-*/]/g;

export function evaluateAmountExpression(expression: string): number {
  const tokens = expression.match(tokenPattern) ?? [];
  if (tokens.length === 0) {
    return 0;
  }

  let result = Number(tokens[0]);
  for (let i = 1; i + 1 < tokens.length; i += 2) {
    const operator = tokens[i];
    const operand = Number(tokens[i + 1]);
    if (operator === '+') {
      result += operand;
    } else if (operator === '-') {
      result -= operand;
    } else if (operator === '*') {
      result *= operand;
    } else if (operator === '/' && operand !== 0) {
      result /= operand;
    }
  }
  return result;
}
