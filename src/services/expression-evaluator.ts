/**
 * Safe Expression Evaluator
 * Evaluates dynamic expressions without using eval()
 * Supports: @FIELDNAME references, ternary operators, comparisons, math
 */

import { Parser } from 'expr-eval';
import type { EvaluationContext, EvaluationResult, ParsedExpression } from '@/types';

export class ExpressionEvaluator {
  private parser: Parser;
  private cache: Map<string, ParsedExpression>;

  constructor() {
    this.parser = new Parser({
      operators: {
        add: true,
        subtract: true,
        multiply: true,
        divide: true,
        remainder: true,
        power: true,
        comparison: true,
        logical: true,
        conditional: true,
      },
    });
    this.cache = new Map();
  }

  /**
   * Parse expression and extract variable references
   */
  parseExpression(expression: string): ParsedExpression {
    if (this.cache.has(expression)) {
      return this.cache.get(expression)!;
    }

    const variables = new Set<string>();
    const hasConditional = expression.includes('?');
    const hasMath = /[\+\-\*\/]/.test(expression);

    // Extract @FIELDNAME references
    const fieldPattern = /@([A-Z_][A-Z0-9_]*)/g;
    let match;
    while ((match = fieldPattern.exec(expression)) !== null) {
      variables.add(match[1]);
    }

    const parsed: ParsedExpression = {
      raw: expression,
      tokens: [],
      variables,
      hasConditional,
      hasMath,
    };

    this.cache.set(expression, parsed);
    return parsed;
  }

  /**
   * Evaluate expression with given context
   */
  evaluate(expression: string, context: EvaluationContext): EvaluationResult {
    try {
      if (!expression || expression.trim() === '') {
        return {
          success: true,
          value: null,
          dependencies: [],
        };
      }

      const parsed = this.parseExpression(expression);

      let processedExpression = expression;
      parsed.variables.forEach((varName) => {
        const value = context.values[varName];
        const valueStr = this.formatValueForExpression(value);
        const regex = new RegExp(`@${varName}`, 'g');
        processedExpression = processedExpression.replace(regex, valueStr);
      });

      const result = this.parser.evaluate(processedExpression);

      return {
        success: true,
        value: result,
        dependencies: Array.from(parsed.variables),
      };
    } catch (error) {
      return {
        success: false,
        value: null,
        error: error instanceof Error ? error.message : 'Unknown evaluation error',
        dependencies: [],
      };
    }
  }

  /**
   * Safely evaluate conditional expression
   */
  evaluateConditional(
    condition: string,
    trueValue: string | number | boolean,
    falseValue: string | number | boolean,
    context: EvaluationContext
  ): EvaluationResult {
    const conditionResult = this.evaluate(condition, context);
    
    if (!conditionResult.success) {
      return conditionResult;
    }

    return {
      success: true,
      value: conditionResult.value ? trueValue : falseValue,
      dependencies: conditionResult.dependencies,
    };
  }

  /**
   * Evaluate boolean expression
   */
  evaluateBoolean(expression: string, context: EvaluationContext): boolean {
    const result = this.evaluate(expression, context);
    if (!result.success) {
      return false;
    }
    return Boolean(result.value);
  }

  /**
   * Batch evaluate multiple expressions
   */
  evaluateBatch(
    expressions: Record<string, string>,
    context: EvaluationContext
  ): Record<string, EvaluationResult> {
    const results: Record<string, EvaluationResult> = {};
    
    for (const [key, expression] of Object.entries(expressions)) {
      results[key] = this.evaluate(expression, context);
    }

    return results;
  }

  /**
   * Get all dependencies from expression
   */
  getDependencies(expression: string): string[] {
    const parsed = this.parseExpression(expression);
    return Array.from(parsed.variables);
  }

  /**
   * Check if expression is valid
   */
  isValidExpression(expression: string): boolean {
    try {
      this.parseExpression(expression);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format value for expression evaluation
   */
  private formatValueForExpression(value: string | number | boolean | null | undefined): string {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "\\'")}'`;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  }

  /**
   * Clear evaluation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const expressionEvaluator = new ExpressionEvaluator();
