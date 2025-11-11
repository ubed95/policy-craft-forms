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
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils";

export const FormEngine: React.FC<FormEngineProps> = ({
  formConfig,
  onSubmit,
  initialValues = {},
  mode = "create",
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

  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setSubmitSuccess(false);

    const isValid = validateForm();

    if (isValid) {
      onSubmit(formState);
      setSubmitSuccess(true);
    }
  };

  const handleReset = () => {
    resetForm();
    setSubmitAttempted(false);
    setSubmitSuccess(false);
  };

  const errorCount = Object.keys(formState.errors).length;
  const isViewMode = mode === "view";

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
        {/* Validation Error Summary */}
        {submitAttempted && errorCount > 0 && (
          <Alert variant="destructive" className="border-destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>Please correct the following errors:</strong>
              <ul className="mt-2 list-disc list-inside">
                {Object.entries(formState.errors).map(([field, errors]) => (
                  <li key={field}>{errors.join(", ")}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <Alert className="border-success bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <AlertDescription className="ml-2 text-success-foreground">
              Form submitted successfully!
            </AlertDescription>
          </Alert>
        )}

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
        {!isViewMode && (
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
                  {mode === "edit" ? "Update" : "Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};
