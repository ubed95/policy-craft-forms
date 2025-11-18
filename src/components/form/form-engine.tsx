/**
 * FormEngine Component
 * Main form orchestrator that renders the complete form
 */

import React from "react";
import type { FormEngineProps } from "@/types";
import { useFormEngine } from "@/hooks";
import { FormSectionComponent } from "./form-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

export const FormEngine: React.FC<FormEngineProps> = ({
  formConfig,
  onSubmit,
  onValidationError,
  initialValues = {},
  onReset,
  className,
  transactionCode = "ISSU",
  calcStep = "NBQUOTE",
}) => {
  const {
    formState,
    sections,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    resetForm,
  } = useFormEngine({
    formConfig,
    initialValues,
    transactionCode,
    calcStep,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid) {
      onSubmit(formState);
    } else {
      // Call validation error callback if provided
      onValidationError?.(formState.errors);
    }
  };

  const handleReset = () => {
    resetForm();
    
    // Call custom reset callback if provided
    if (onReset) {
      onReset(formState);
    }
  };

  return (
    <div className={cn("w-full max-w-7xl mx-auto", className)}>
      <Card className="border-border shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-3xl font-bold text-foreground">
            {formConfig.productmaster.productname}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {formConfig.productmaster.lob} - {formConfig.productmaster.sublob}
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Form Sections */}
        {sections.map((section) => (
          <FormSectionComponent
            key={section.name}
            section={section}
            formState={formState}
            onFieldChange={handleFieldChange}
            onFieldBlur={handleFieldBlur}
          />
        ))}

        {/* Form Actions */}
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="min-w-32"
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="min-w-32 bg-primary hover:bg-primary-dark"
              >
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
