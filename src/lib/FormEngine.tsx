/**
 * FormEngine - Reusable Dynamic Form Rendering Engine
 * 
 * A production-grade form library that dynamically renders complex forms
 * from API configuration with dependency resolution, validation, and state management.
 * 
 * @example
 * ```tsx
 * import { FormEngine } from '@nvest/form-engine';
 * import type { ProductResponse, FormState } from '@nvest/form-engine';
 * 
 * function App() {
 *   const formConfig: ProductResponse = // fetch from API
 *   
 *   const handleSubmit = (formState: FormState) => {
 *     console.log('Form submitted:', formState.values);
 *   };
 *   
 *   return (
 *     <FormEngine
 *       formConfig={formConfig}
 *       onSubmit={handleSubmit}
 *       initialValues={{ SAMEPROPOSER: 'Y' }}
 *     />
 *   );
 * }
 * ```
 */

import React from 'react';
import { FormEngine as FormEngineCore } from '../components/form/form-engine';
import type { FormEngineProps } from '../types';

export const FormEngine: React.FC<FormEngineProps> = (props) => {
  return <FormEngineCore {...props} />;
};

FormEngine.displayName = 'FormEngine';
