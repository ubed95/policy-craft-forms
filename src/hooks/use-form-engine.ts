/**
 * useFormEngine Hook
 * Main hook for managing form state and logic
 */

import { useState, useCallback, useMemo } from "react";
import type {
  ProductResponse,
  FormState,
  ProductKeyword,
  ProductKeywordValue,
  FormSection,
} from "@/types";
import {
  DependencyResolver,
  FormValidator,
  expressionEvaluator,
  DataSourceResolver,
} from "@/services";

export interface UseFormEngineOptions {
  formConfig: ProductResponse;
  initialValues?: Record<string, string>;
  transactionCode?: string;
  calcStep?: string;
  onValueChange?: (
    fieldName: string,
    value: string,
    formState: FormState
  ) => void;
}

export function useFormEngine(options: UseFormEngineOptions) {
  const {
    formConfig,
    initialValues = {},
    transactionCode = "ISSU",
    calcStep = "NBQUOTE",
    onValueChange,
  } = options;

  // Filter fields by transaction code and calc step, and attach options
  const fields = useMemo(() => {
    const filteredFields = formConfig.productkeyword.filter(
      (field) =>
        field.transactioncode === transactionCode && field.calcstep === calcStep
    );

    // Group keyword values by keyword for fast lookup
    const valuesByKeyword = new Map<string, ProductKeywordValue[]>();

    if (formConfig.productkeywordvalue) {
      formConfig.productkeywordvalue.forEach((value) => {
        if (!valuesByKeyword.has(value.keyword)) {
          valuesByKeyword.set(value.keyword, []);
        }
        valuesByKeyword.get(value.keyword)!.push(value);
      });
    }

    // Attach options to each field
    return filteredFields.map((field) => {
      // For fields with chkfieldsource, keep the original fieldvaluedata (data source config)
      // For regular list fields, attach the keyword values
      const fieldData = field.chkfieldsource
        ? field.fieldvaluedata || []
        : valuesByKeyword.get(field.keyword) || [];

      return {
        ...field,
        fieldvaluedata: fieldData,
      };
    });
  }, [
    formConfig.productkeyword,
    formConfig.productkeywordvalue,
    transactionCode,
    calcStep,
  ]);

  // Initialize dependency resolver
  const dependencyResolver = useMemo(() => {
    const fieldDeps = formConfig.productkeyworddependency || [];
    const valueDeps = formConfig.productkeyworddependencyvalue || [];
    return new DependencyResolver(fieldDeps, valueDeps);
  }, [
    formConfig.productkeyworddependency,
    formConfig.productkeyworddependencyvalue,
  ]);

  // Initialize data source resolver
  const dataSourceResolver = useMemo(() => {
    return new DataSourceResolver(formConfig.productkeyworddatasource || {});
  }, [formConfig.productkeyworddatasource]);

  // Initialize validator
  const validator = useMemo(() => {
    return new FormValidator();
  }, []);

  // Build validation rules
  const validationRules = useMemo(() => {
    return validator.buildValidationRules(fields);
  }, [fields, validator]);

  // Initialize form state
  const [formState, setFormState] = useState<FormState>(() => {
    const initialState: FormState = {
      values: { ...initialValues },
      errors: {},
      touched: {},
      visibility: {},
      disabled: {},
      readonly: {},
      mandatory: {},
      loading: {},
      metadata: {},
    };

    // Set initial field states
    fields.forEach((field) => {
      initialState.visibility[field.keyword] =
        field.defaultuibehavior !== "HIDE";
      initialState.disabled[field.keyword] =
        field.defaultuibehavior === "DISABLED";
      initialState.readonly[field.keyword] =
        field.defaultuibehavior === "READONLY";
      initialState.mandatory[field.keyword] = field.ismandatory;

      // Skip if manual initial value is provided
      if (initialValues[field.keyword] !== undefined) {
        return;
      }

      // For List fields, check for defaultselected option
      if (field.keywordtype === "List" && field.fieldvaluedata) {
        const defaultOption = field.fieldvaluedata.find(
          (option) => 
            'defaultselected' in option && option.defaultselected === true
        );
        if (defaultOption && 'keywordvalue' in defaultOption) {
          initialState.values[field.keyword] = defaultOption.keywordvalue;
          return;
        }
      }

      // Evaluate default value if it's an expression or static value
      if (field.defaultvalue) {
        const result = expressionEvaluator.evaluate(field.defaultvalue, {
          values: initialState.values,
        });
        if (result.success && result.value !== null) {
          initialState.values[field.keyword] = String(result.value);
        }
      }
    });

    // After setting all initial values and defaults, evaluate dependencies
    // to ensure visibility/disabled/readonly states respect initial field values
    const depMap = dependencyResolver.getDependencyMap();
    fields.forEach((field) => {
      // Check if this field is affected by any dependencies (other fields that it depends on)
      const node = depMap.nodes.get(field.keyword);
      if (node && node.dependsOn.size > 0) {
        // This field has dependencies, recalculate its state
        initialState.visibility[field.keyword] = dependencyResolver.calculateVisibility(
          field.keyword,
          initialState
        );
        initialState.disabled[field.keyword] = dependencyResolver.calculateDisabled(
          field.keyword,
          initialState
        );
        initialState.readonly[field.keyword] = dependencyResolver.calculateReadonly(
          field.keyword,
          initialState
        );
      }
    });

    return initialState;
  });

  // Group fields into sections
  const sections = useMemo(() => {
    const sectionMap = new Map<string, FormSection>();

    fields.forEach((field) => {
      const sectionName = field.keywordsection || "DEFAULT";

      if (!sectionMap.has(sectionName)) {
        sectionMap.set(sectionName, {
          name: sectionName,
          title: formatSectionName(sectionName),
          fields: [],
          visible: true,
          order: 0,
        });
      }

      // Resolve field options - either from static data or data source
      let options: ProductKeywordValue[] = [];

      if (field.chkfieldsource) {
        // Get options from data source with current form values
        const resolvedOptions = dataSourceResolver.resolveFieldOptions(
          field,
          formState.values
        );
        options = resolvedOptions;
      } else if (field.keywordtype === "List" && field.fieldvaluedata) {
        // For regular list fields, use the static options
        options = field.fieldvaluedata as ProductKeywordValue[];

        // Filter options based on productkeyworddependencyvalue
        const valueDeps = (
          formConfig.productkeyworddependencyvalue || []
        ).filter((dep) => dep.actionedkeyword === field.keyword);

        if (valueDeps.length > 0) {
          // Filter options based on dependencies
          options = options.filter((opt) => {
            // Check if this option should be shown
            for (const dep of valueDeps) {
              const changedValue = formState.values[dep.changedkeyword];

              if (dep.actiontotake === "show") {
                // Only show this option if changed field matches
                if (dep.actionedkeywordvalue === opt.keywordvalue) {
                  // This option is controlled by show rule
                  return changedValue === dep.changedkeywordvalue;
                }
              } else if (dep.actiontotake === "hide") {
                // Hide this option if conditions match
                if (
                  dep.actionedkeywordvalue === opt.keywordvalue &&
                  changedValue === dep.changedkeywordvalue
                ) {
                  return false;
                }
              }
            }
            return true;
          });
        }
      }

      // Deduplicate options by keywordvalue and sort by keyvalsequence
      const uniqueOptionsMap = new Map<string, ProductKeywordValue>();
      options.forEach((opt) => {
        const key = opt.keywordvalue;
        if (!uniqueOptionsMap.has(key)) {
          uniqueOptionsMap.set(key, opt);
        }
      });
      options = Array.from(uniqueOptionsMap.values()).sort(
        (a, b) => (a.keyvalsequence || 0) - (b.keyvalsequence || 0)
      );

      const section = sectionMap.get(sectionName)!;
      section.fields.push({
        definition: field,
        visible: formState.visibility[field.keyword] !== false,
        disabled: formState.disabled[field.keyword] || false,
        readonly: formState.readonly[field.keyword] || false,
        mandatory: formState.mandatory[field.keyword] || false,
        options,
        error: formState.errors[field.keyword],
        value: formState.values[field.keyword],
        section: sectionName,
      });
    });

    return Array.from(sectionMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [
    fields,
    formState,
    dataSourceResolver,
    formConfig.productkeyworddependencyvalue,
  ]);

  // Handle field value change
  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      setFormState((prev) => {
        // Update value
        const newState = dependencyResolver.updateFormState(
          fieldName,
          value,
          prev
        );

        // Re-evaluate dependent field expressions
        fields.forEach((field) => {
          if (field.defaultvalue && field.keyword !== fieldName) {
            const deps = expressionEvaluator.getDependencies(
              field.defaultvalue
            );
            if (deps.includes(fieldName)) {
              const result = expressionEvaluator.evaluate(field.defaultvalue, {
                values: newState.values,
              });
              if (result.success && result.value !== null) {
                newState.values[field.keyword] = String(result.value);
              }
            }
          }
        });

        // Clear errors for the field
        const newErrors = { ...newState.errors };
        delete newErrors[fieldName];
        newState.errors = newErrors;

        // Call onChange callback
        if (onValueChange) {
          onValueChange(fieldName, value, newState);
        }

        return newState;
      });
    },
    [dependencyResolver, fields, onValueChange]
  );

  // Handle field blur
  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      setFormState((prev) => {
        const newState = { ...prev };
        newState.touched = { ...prev.touched, [fieldName]: true };

        // Validate field
        const fieldRules = validationRules[fieldName];
        if (fieldRules) {
          const fieldErrors = validator.validateField(
            fieldName,
            prev.values[fieldName],
            fieldRules,
            prev
          );
          newState.errors = {
            ...prev.errors,
            [fieldName]: fieldErrors,
          };
        }

        return newState;
      });
    },
    [validationRules, validator]
  );

  // Validate form
  const validateForm = useCallback(() => {
    const visibleFields = new Set(
      fields
        .filter((f) => formState.visibility[f.keyword] !== false)
        .map((f) => f.keyword)
    );

    const result = validator.validateForm(
      formState,
      validationRules,
      visibleFields
    );

    setFormState((prev) => ({
      ...prev,
      errors: result.errors,
    }));

    return result.valid;
  }, [formState, fields, validationRules, validator]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      values: { ...initialValues },
      errors: {},
      touched: {},
    }));
  }, [initialValues]);

  // Get field value
  const getFieldValue = useCallback(
    (fieldName: string) => formState.values[fieldName],
    [formState.values]
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (fieldName: string, value: string) => {
      handleFieldChange(fieldName, value);
    },
    [handleFieldChange]
  );

  return {
    formState,
    sections,
    fields,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
    getFieldValue,
    setFieldValue,
    dependencyResolver,
    validator,
  };
}

function formatSectionName(sectionName: string): string {
  return sectionName
    .replace(/_/g, " ")
    .replace(/SECTION$/, "")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}
