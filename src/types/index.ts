/**
 * Form Engine - TypeScript Type Definitions
 * Complete type system for dynamic form rendering
 */

// ============= API Response Types =============

export interface APIResponse {
  statusCode: number;
  statusMsg: string;
  response: ProductResponse;
}

export interface ProductResponse {
  productid: number;
  productname: string;
  productmaster: ProductMaster;
  riders: Rider[];
  productversion: ProductVersion[];
  productkeyword: ProductKeyword[];
  productkeywordvalue: ProductKeywordValue[];
  productkeyworddatasource: Record<string, Record<string, string>[]>;
  productkeyworddependency: ProductKeywordDependency[];
  productkeyworddependencyvalue: ProductKeywordDependencyValue[];
}

export interface ProductMaster {
  productid: number;
  productname: string;
  prodtype: string;
  description: string | null;
  lob: string;
  sublob: string;
  companycode: string;
  status: string;
}

export interface Rider {
  productid: number;
  productname: string;
  prodtype: string;
  shortform: string;
  lob: string;
  sublob: string;
  status: string;
}

export interface ProductVersion {
  versionid: number;
  versionchangetype: string;
  fromeffectivedate: string | null;
  toeffectivedate: string | null;
  versionstatus: string;
}

// ============= Field Definitions =============

export type FieldType =
  | "String"
  | "Integer"
  | "Decimal"
  | "DOB"
  | "Date"
  | "List"
  | "Boolean"
  | "Phone"
  | "Email";

export type UIBehavior = "SHOW" | "HIDE" | "READONLY" | "DISABLED";
export type InputOutputType = "Input" | "Output" | "Both";

export interface FieldValueMetadata {
  lookup?: string;
  keywordvalue?: string;
  keyworddisplay?: string;
}

export interface FieldValueData {
  fieldvaluecode: string;
  fieldvaluesourcetype: string;
  fieldvaluemetadata?: FieldValueMetadata;
}

export interface ProductKeyword {
  keywordid: string;
  keyword: string;
  keywordcaption: string;
  keywordtype: FieldType;
  keyworddatatype: string;
  keywordsection: string;
  defaultvalue: string | null;
  ismandatory: boolean;
  inputoroutput: InputOutputType;
  defaultuibehavior: UIBehavior;
  keyminvalue: number | null;
  keymaxvalue: number | null;
  minlength: number | null;
  maxlength: number | null;
  regex: string | null;
  lookupccondition: string | null;
  addlcondition: string | null;
  keysequence: number | null;
  parentkeyword: string | null;
  lob: string;
  sublob: string;
  productid: number;
  riderid: number | null;
  transactioncode: string;
  calcstep: string;
  metadata?: string | null;
  chkfieldsource?: boolean;
  regcode?: string;
  companycode?: string;
  fromversionid?: number;
  toversionid?: number | null;
  fromeffectivedate?: string | null;
  toeffectivedate?: string | null;
  fkkeywordgroupid?: string | null;
  fieldvaluedata?: (FieldValueData | ProductKeywordValue)[];
}

export interface ProductKeywordValue {
  keywordvalueid: string;
  keyword: string;
  keyworddisplay: string;
  keywordvalue: string;
  defaultselected?: boolean;
  keyvalsequence?: number;
  lob: string;
  sublob: string;
  productid: number;
  riderid?: number | null;
  transactioncode: string;
  calcstep: string;
  status?: string;
  addeddate?: string | null;
  updateddate?: string | null;
  addedby?: string | null;
  updatedby?: string | null;
  regcode?: string;
  companycode?: string;
  fromversionid?: number;
  toversionid?: number | null;
  fromeffectivedate?: string | null;
  toeffectivedate?: string | null;
  fkkeywordgroupid?: string | null;
}

// ============= Dependencies =============

export type DependencyAction =
  | "show"
  | "hide"
  | "enable"
  | "disable"
  | "readonly"
  | "mandatory"
  | "optional";

export interface ProductKeywordDependency {
  keydependentid: string;
  changedkeyword: string;
  changedkeywordvalue?: string | null;
  actionedkeyword: string;
  actiontotake: DependencyAction;
  expression: string | null;
  operatortype: string | null;
  lob: string;
  sublob: string;
  productid: number;
  riderid?: number | null;
  transactioncode: string;
  calcstep: string;
  status?: string;
  metadata?: string | null;
  addeddate?: string;
  updateddate?: string | null;
  addedby?: string;
  updatedby?: string | null;
  regcode?: string;
  companycode?: string;
  fromversionid?: number;
  toversionid?: number | null;
  fromeffectivedate?: string | null;
  toeffectivedate?: string | null;
  fkkeywordgroupid?: string | null;
}

export interface ProductKeywordDependencyValue {
  keyvaluedependentid: string;
  changedkeyword: string;
  changedkeywordvalue: string;
  actionedkeyword: string;
  actionedkeywordvalue: string;
  actiontotake: DependencyAction;
  expression: string | null;
  operatortype: string | null;
  lob: string;
  sublob: string;
  productid: number;
  riderid?: number | null;
  transactioncode: string;
  calcstep: string;
  status?: string;
  metadata?: string | null;
  addeddate?: string;
  updateddate?: string | null;
  addedby?: string | null;
  updatedby?: string | null;
  companycode?: string;
  regcode?: string;
  fromversionid?: number;
  toversionid?: number | null;
  fromeffectivedate?: string | null;
  toeffectivedate?: string | null;
  fkkeywordgroupid?: string | null;
}

// ============= Form State & Configuration =============

export interface FormState {
  values: Record<string, string>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  visibility: Record<string, boolean>;
  disabled: Record<string, boolean>;
  readonly: Record<string, boolean>;
  mandatory: Record<string, boolean>;
  loading: Record<string, boolean>;
  metadata: Record<string, string | null>;
}

export interface FieldMetadata {
  definition: ProductKeyword;
  visible: boolean;
  disabled: boolean;
  readonly: boolean;
  mandatory: boolean;
  options?: ProductKeywordValue[];
  error?: string[];
  value?: string | number | boolean | null;
  defaultValue?: string | number | boolean | null;
  section: string;
}

export interface FormSection {
  name: string;
  title: string;
  fields: FieldMetadata[];
  visible: boolean;
  order: number;
}

export interface FormConfig {
  product: ProductMaster;
  sections: FormSection[];
  dependencies: DependencyMap;
  dataSources: Record<string, Record<string, string>[]>;
  validationRules: ValidationRules;
}

// ============= Dependency Resolution =============

export interface DependencyNode {
  fieldName: string;
  dependsOn: Set<string>;
  affects: Set<string>;
  fieldDependencies: ProductKeywordDependency[];
  valueDependencies: ProductKeywordDependencyValue[];
}

export interface DependencyMap {
  nodes: Map<string, DependencyNode>;
  evaluationOrder: string[];
  circularDependencies: string[][];
}

// ============= Validation =============

export interface ValidationRule {
  type:
    | "required"
    | "regex"
    | "min"
    | "max"
    | "minLength"
    | "maxLength"
    | "custom"
    | "expression";
  value?: string | number | RegExp;
  message: string;
  condition?: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

// ============= Expression Evaluation =============

export interface ParsedExpression {
  raw: string;
  tokens: ExpressionToken[];
  variables: Set<string>;
  hasConditional: boolean;
  hasMath: boolean;
}

export type ExpressionTokenType =
  | "variable"
  | "operator"
  | "literal"
  | "function"
  | "conditional";

export interface ExpressionToken {
  type: ExpressionTokenType;
  value: string;
  position: number;
}

export interface EvaluationContext {
  values: Record<string, string>;
  metadata?: Record<string, string | null>;
  functions?: Record<string, (...args: unknown[]) => unknown>;
}

export interface EvaluationResult {
  success: boolean;
  value: string | number | boolean | null;
  error?: string;
  dependencies: string[];
}

// ============= Data Sources & Lookups =============

export interface DataSourceConfig {
  tableName: string;
  condition: string | null;
  mappings: Record<string, string>;
  filterCondition?: string;
}

export interface LookupResult {
  success: boolean;
  data: Record<string, string>[];
  error?: string;
}

// ============= Form Engine Props =============

export interface FormEngineProps {
  formConfig: ProductResponse;
  onSubmit: (formState: FormState) => void;
  onValueChange?: (fieldName: string, value: string, formState: FormState) => void;
  initialValues?: Record<string, string>;
  mode?: "create" | "edit" | "view";
  className?: string;
  transactionCode?: string;
  calcStep?: string;
}

// ============= Error Types =============

export class FormError extends Error {
  constructor(message: string, public metadata?: Record<string, unknown>) {
    super(message);
    this.name = "FormError";
  }
}

export class ValidationError extends FormError {
  constructor(message: string, public fieldErrors: Record<string, string[]>) {
    super(message, { fieldErrors });
    this.name = "ValidationError";
  }
}

export class DependencyError extends FormError {
  constructor(message: string, public cycles: string[][]) {
    super(message, { cycles });
    this.name = "DependencyError";
  }
}

export class ExpressionError extends FormError {
  constructor(message: string, public expression: string) {
    super(message, { expression });
    this.name = "ExpressionError";
  }
}
