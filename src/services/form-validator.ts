/**
 * Form Validation Engine
 * Handles field validation with support for conditional rules
 */

import type {
  ProductKeyword,
  ValidationRule,
  ValidationResult,
  FormState,
} from "@/types";
import { expressionEvaluator } from "./expression-evaluator";

export class FormValidator {
  /**
   * Build validation rules from field definitions
   */
  buildValidationRules(
    fields: ProductKeyword[]
  ): Record<string, ValidationRule[]> {
    const rules: Record<string, ValidationRule[]> = {};

    for (const field of fields) {
      const fieldRules: ValidationRule[] = [];

      // Required field
      if (field.ismandatory) {
        fieldRules.push({
          type: "required",
          message: `${field.keywordcaption} is required`,
        });
      }

      // Regex validation
      if (field.regex) {
        fieldRules.push({
          type: "regex",
          value: new RegExp(field.regex),
          message: `${field.keywordcaption} format is invalid`,
        });
      }

      // Min value
      if (field.keyminvalue !== null && field.keyminvalue !== undefined) {
        fieldRules.push({
          type: "min",
          value: field.keyminvalue,
          message: `${field.keywordcaption} must be at least ${field.keyminvalue}`,
        });
      }

      // Max value
      if (field.keymaxvalue !== null && field.keymaxvalue !== undefined) {
        fieldRules.push({
          type: "max",
          value: field.keymaxvalue,
          message: `${field.keywordcaption} must be at most ${field.keymaxvalue}`,
        });
      }

      // Min length
      if (field.minlength !== null && field.minlength !== undefined) {
        fieldRules.push({
          type: "minLength",
          value: field.minlength,
          message: `${field.keywordcaption} must be at least ${field.minlength} characters`,
        });
      }

      // Max length
      if (field.maxlength !== null && field.maxlength !== undefined) {
        fieldRules.push({
          type: "maxLength",
          value: field.maxlength,
          message: `${field.keywordcaption} must be at most ${field.maxlength} characters`,
        });
      }

      // Additional condition validation
      if (field.addlcondition) {
        fieldRules.push({
          type: "expression",
          value: field.addlcondition,
          message: `${field.keywordcaption} validation failed`,
        });
      }

      if (fieldRules.length > 0) {
        rules[field.keyword] = fieldRules;
      }
    }

    return rules;
  }

  /**
   * Validate a single field
   */
  validateField(
    fieldName: string,
    value: string | number | boolean | null,
    rules: ValidationRule[],
    formState: FormState
  ): string[] {
    const errors: string[] = [];

    for (const rule of rules) {
      // Check if rule condition applies
      if (rule.condition) {
        const applies = expressionEvaluator.evaluateBoolean(rule.condition, {
          values: formState.values,
        });
        if (!applies) continue;
      }

      switch (rule.type) {
        case "required":
          if (this.isEmpty(value)) {
            errors.push(rule.message);
          }
          break;

        case "regex":
          if (
            value &&
            rule.value instanceof RegExp &&
            !rule.value.test(String(value))
          ) {
            errors.push(rule.message);
          }
          break;

        case "min":
          if (
            value !== null &&
            value !== undefined &&
            typeof rule.value === 'number' &&
            Number(value) < rule.value
          ) {
            errors.push(rule.message);
          }
          break;

        case "max":
          if (
            value !== null &&
            value !== undefined &&
            typeof rule.value === 'number' &&
            Number(value) > rule.value
          ) {
            errors.push(rule.message);
          }
          break;

        case "minLength":
          if (value && typeof rule.value === 'number' && String(value).length < rule.value) {
            errors.push(rule.message);
          }
          break;

        case "maxLength":
          if (value && typeof rule.value === 'number' && String(value).length > rule.value) {
            errors.push(rule.message);
          }
          break;

        case "expression": {
          if (typeof rule.value === 'string') {
            const result = expressionEvaluator.evaluateBoolean(rule.value, {
              values: { ...formState.values, [fieldName]: String(value || '') },
            });
            if (!result) {
              errors.push(rule.message);
            }
          }
          break;
        }

        case "custom":
          // Custom validation logic can be added here
          break;
      }
    }

    return errors;
  }

  /**
   * Validate entire form
   */
  validateForm(
    formState: FormState,
    validationRules: Record<string, ValidationRule[]>,
    visibleFields?: Set<string>
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    let hasErrors = false;

    for (const [fieldName, rules] of Object.entries(validationRules)) {
      // Only validate visible fields if visibility info provided
      if (visibleFields && !visibleFields.has(fieldName)) {
        continue;
      }

      // Skip if field is not visible
      if (formState.visibility[fieldName] === false) {
        continue;
      }

      const fieldErrors = this.validateField(
        fieldName,
        formState.values[fieldName],
        rules,
        formState
      );

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        hasErrors = true;
      }
    }

    return {
      valid: !hasErrors,
      errors,
    };
  }

  /**
   * Validate specific fields
   */
  validateFields(
    fieldNames: string[],
    formState: FormState,
    validationRules: Record<string, ValidationRule[]>
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    let hasErrors = false;

    for (const fieldName of fieldNames) {
      const rules = validationRules[fieldName];
      if (!rules) continue;

      const fieldErrors = this.validateField(
        fieldName,
        formState.values[fieldName],
        rules,
        formState
      );

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
        hasErrors = true;
      }
    }

    return {
      valid: !hasErrors,
      errors,
    };
  }

  /**
   * Check if value is empty
   */
  private isEmpty(value: string | number | boolean | null): boolean {
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  /**
   * Get validation summary
   */
  getValidationSummary(errors: Record<string, string[]>): string[] {
    const summary: string[] = [];

    for (const [field, fieldErrors] of Object.entries(errors)) {
      summary.push(...fieldErrors);
    }

    return summary;
  }

  /**
   * Check if field has errors
   */
  hasFieldError(fieldName: string, errors: Record<string, string[]>): boolean {
    return fieldName in errors && errors[fieldName].length > 0;
  }
}
