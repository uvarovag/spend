const operators = new Set(['+', '-', '*', '/']);
export const backspaceKey = '⌫';

export function applyKeypadKey(expression: string, key: string): string {
  if (key === backspaceKey) {
    return expression.slice(0, -1);
  }

  if (operators.has(key)) {
    if (expression.length === 0) {
      return expression;
    }
    const lastCharacter = expression[expression.length - 1];
    return operators.has(lastCharacter) ? expression.slice(0, -1) + key : expression + key;
  }

  if (key === '.') {
    const lastSegment = expression.split(/[+\-*/]/).pop() ?? '';
    if (lastSegment.includes('.')) {
      return expression;
    }
    return expression + (lastSegment.length === 0 ? '0.' : '.');
  }

  return expression + key;
}
