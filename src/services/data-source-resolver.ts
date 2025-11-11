/**
 * Data Source Resolver
 * Handles dynamic data source lookups for fields with chkfieldsource: true
 */

import type {
  ProductKeyword,
  ProductKeywordValue,
  FieldValueData,
} from "@/types";
import { expressionEvaluator } from "./expression-evaluator";

export class DataSourceResolver {
  private dataSources: Record<string, Record<string, string>[]>;

  constructor(dataSources: Record<string, Record<string, string>[]>) {
    this.dataSources = dataSources;
  }

  /**
   * Resolve options for a field with data source lookup
   */
  resolveFieldOptions(
    field: ProductKeyword,
    formValues: Record<string, string>
  ): ProductKeywordValue[] {
    // If not using field source, return existing options
    if (
      !field.chkfieldsource ||
      !field.fieldvaluedata ||
      field.fieldvaluedata.length === 0
    ) {
      return [];
    }

    const fieldValueConfig = field.fieldvaluedata[0] as FieldValueData;
    const tableName = fieldValueConfig.fieldvaluecode;
    const sourceData = this.dataSources[tableName];

    if (!sourceData) {
      console.warn(`Data source table "${tableName}" not found`);
      return [];
    }

    // Apply lookup condition filter
    let filteredData = sourceData;
    if (fieldValueConfig.fieldvaluemetadata?.lookup) {
      filteredData = this.filterDataByLookup(
        sourceData,
        fieldValueConfig.fieldvaluemetadata.lookup,
        formValues
      );
    }

    // Map to ProductKeywordValue format
    const valueField =
      fieldValueConfig.fieldvaluemetadata?.keywordvalue || "value";
    const displayField =
      fieldValueConfig.fieldvaluemetadata?.keyworddisplay || "display";

    return filteredData.map((row, index) => {
      // Evaluate expressions in value and display fields
      const value = this.evaluateFieldExpression(row[valueField], formValues);
      const display = this.evaluateFieldExpression(
        row[displayField],
        formValues
      );

      return {
        keywordvalueid: `${tableName}_${index}`,
        keyword: field.keyword,
        keywordvalue: String(value),
        keyworddisplay: String(display),
        lob: field.lob,
        sublob: field.sublob,
        productid: field.productid,
        riderid: field.riderid,
        transactioncode: field.transactioncode,
        calcstep: field.calcstep,
        keysequence: index,
        regcode: field.regcode,
        companycode: field.companycode,
        fromversionid: field.fromversionid,
        toversionid: field.toversionid,
        fromeffectivedate: field.fromeffectivedate,
        toeffectivedate: field.toeffectivedate,
        fkkeywordgroupid: field.fkkeywordgroupid,
      };
    });
  }

  /**
   * Filter data source by lookup condition
   * Supports expressions like: col_pr_variant=@PR_VARIANT
   */
  private filterDataByLookup(
    data: Record<string, string>[],
    lookupCondition: string,
    formValues: Record<string, string>
  ): Record<string, string>[] {
    // Parse lookup condition (e.g., "col_pr_variant=@PR_VARIANT")
    const conditions = lookupCondition.split("AND").map((c) => c.trim());

    return data.filter((row) => {
      return conditions.every((condition) => {
        const [columnExpr, valueExpr] = condition
          .split("=")
          .map((s) => s.trim());

        // Get column value from row
        const columnValue = row[columnExpr];

        // Evaluate value expression
        const expectedValue = this.evaluateFieldExpression(
          valueExpr,
          formValues
        );

        return String(columnValue) === String(expectedValue);
      });
    });
  }

  /**
   * Evaluate field expression if it contains @FIELDNAME references
   */
  private evaluateFieldExpression(
    expr: string,
    formValues: Record<string, string>
  ): string {
    if (!expr || typeof expr !== "string") {
      return expr;
    }

    // Check if expression contains field references
    if (expr.includes("@")) {
      const result = expressionEvaluator.evaluate(expr, { values: formValues });
      return result.success && result.value !== null ? String(result.value) : expr;
    }

    return expr;
  }

  /**
   * Get all field dependencies from data source lookup conditions
   */
  getDataSourceDependencies(field: ProductKeyword): string[] {
    if (
      !field.chkfieldsource ||
      !field.fieldvaluedata ||
      field.fieldvaluedata.length === 0
    ) {
      return [];
    }

    const fieldValueConfig = field.fieldvaluedata[0];

    // Type guard to check if it's FieldValueData
    if (!("fieldvaluecode" in fieldValueConfig)) {
      return [];
    }

    const dependencies = new Set<string>();

    // Extract dependencies from lookup condition
    if (fieldValueConfig.fieldvaluemetadata?.lookup) {
      const deps = expressionEvaluator.getDependencies(
        fieldValueConfig.fieldvaluemetadata.lookup
      );
      deps.forEach((dep) => dependencies.add(dep));
    }

    // Extract dependencies from value and display expressions
    const valueField = fieldValueConfig.fieldvaluemetadata?.keywordvalue;
    const displayField = fieldValueConfig.fieldvaluemetadata?.keyworddisplay;

    if (valueField) {
      const deps = expressionEvaluator.getDependencies(valueField);
      deps.forEach((dep) => dependencies.add(dep));
    }

    if (displayField) {
      const deps = expressionEvaluator.getDependencies(displayField);
      deps.forEach((dep) => dependencies.add(dep));
    }

    return Array.from(dependencies);
  }
}
