/**
 * FormSection Component
 * Groups related fields into collapsible sections
 */

import React from 'react';
import type { FormSection as FormSectionType, FormState } from '@/types';
import { FormField } from './form-field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils';

export interface FormSectionProps {
  section: FormSectionType;
  formState: FormState;
  onFieldChange: (fieldName: string, value: string) => void;
  onFieldBlur: (fieldName: string) => void;
  className?: string;
}

export const FormSectionComponent: React.FC<FormSectionProps> = ({
  section,
  formState,
  onFieldChange,
  onFieldBlur,
  className,
}) => {
  if (!section.visible) {
    return null;
  }

  const visibleFields = section.fields.filter((field) => field.visible);

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <Card className={cn('bg-form-section-bg shadow-md', className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleFields.map((fieldMetadata) => (
            <FormField
              key={fieldMetadata.definition.keyword}
              metadata={fieldMetadata}
              value={formState.values[fieldMetadata.definition.keyword]}
              onChange={(value) => onFieldChange(fieldMetadata.definition.keyword, String(value || ''))}
              onBlur={() => onFieldBlur(fieldMetadata.definition.keyword)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
