/**
 * FormField Component
 * Universal field renderer that delegates to specific field types
 */

import React from 'react';
import type { FieldMetadata } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils';

export interface FormFieldProps {
  metadata: FieldMetadata;
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean | null) => void;
  onBlur: () => void;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  metadata,
  value,
  onChange,
  onBlur,
  className,
}) => {
  const { definition, visible, disabled, readonly, mandatory, options, error } = metadata;

  if (!visible) {
    return null;
  }

  const hasError = error && error.length > 0;
  const fieldId = `field-${definition.keyword}`;

  const renderField = () => {
    const fieldType = definition.keywordtype;

    switch (fieldType) {
      case 'List':
        return (
          <Select
            value={value?.toString() || ''}
            onValueChange={(val) => onChange(val)}
            disabled={disabled || readonly}
          >
            <SelectTrigger
              className={cn(
                'w-full bg-input border-input-border',
                hasError && 'border-form-error focus:ring-form-error'
              )}
            >
              <SelectValue placeholder={`Select ${definition.keywordcaption}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {options?.map((option) => (
                <SelectItem key={option.keywordvalue} value={option.keywordvalue}>
                  {option.keyworddisplay}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'DOB':
      case 'Date':
        return (
          <Input
            id={fieldId}
            type="date"
            value={value?.toString() || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readonly}
            className={cn(
              'bg-input border-input-border',
              hasError && 'border-form-error focus:ring-form-error'
            )}
          />
        );

      case 'Integer':
      case 'Decimal':
        return (
          <Input
            id={fieldId}
            type="number"
            value={value?.toString() ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readonly}
            min={definition.keyminvalue ?? undefined}
            max={definition.keymaxvalue ?? undefined}
            placeholder={`Enter ${definition.keywordcaption.toLowerCase()}`}
            className={cn(
              'bg-input border-input-border',
              hasError && 'border-form-error focus:ring-form-error'
            )}
          />
        );

      case 'Boolean':
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={value === 'Y' || value === true}
                onChange={() => onChange('Y')}
                disabled={disabled || readonly}
                className="w-4 h-4 text-primary focus:ring-primary-light"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={value === 'N' || value === false}
                onChange={() => onChange('N')}
                disabled={disabled || readonly}
                className="w-4 h-4 text-primary focus:ring-primary-light"
              />
              <span>No</span>
            </label>
          </div>
        );

      default:
        return (
          <Input
            id={fieldId}
            type={fieldType === 'Email' ? 'email' : 'text'}
            value={value?.toString() || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readonly}
            minLength={definition.minlength ?? undefined}
            maxLength={definition.maxlength ?? undefined}
            pattern={definition.regex ?? undefined}
            placeholder={`Enter ${definition.keywordcaption.toLowerCase()}`}
            className={cn(
              'bg-input border-input-border',
              hasError && 'border-form-error focus:ring-form-error'
            )}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={fieldId}
        className={cn(
          'text-form-label font-medium',
          mandatory && "after:content-['*'] after:ml-1 after:text-destructive"
        )}
      >
        {definition.keywordcaption}
      </Label>
      
      {renderField()}

      {hasError && (
        <div className="text-sm text-form-error" role="alert">
          {error.map((err, idx) => (
            <div key={idx}>{err}</div>
          ))}
        </div>
      )}

      {definition.addlcondition && (
        <p className="text-sm text-form-help-text italic">
          Additional validation applies
        </p>
      )}
    </div>
  );
};
