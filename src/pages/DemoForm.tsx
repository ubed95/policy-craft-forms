import React, { useState } from 'react';
import { FormEngine } from '@/lib/FormEngine';
import type { ProductResponse, FormState } from '@/types';
import { sampleApiResponse } from '@/data/sampleApiResponse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const DemoForm: React.FC = () => {
  const [formConfig] = useState<ProductResponse>(sampleApiResponse);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (formState: FormState) => {
    setIsLoading(true);
    
    // Simulate API submission
    setTimeout(() => {
      console.log('Form submitted:', formState.values);
      toast({
        title: "Form Submitted Successfully",
        description: "Check the console for submitted values",
        variant: "default",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleValidationError = (errors: Record<string, string[]>) => {
    const errorCount = Object.keys(errors).length;
    const errorMessages = Object.entries(errors)
      .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
      .join('\n');
    
    console.error('Validation errors:', errors);
    toast({
      title: `Validation Failed (${errorCount} error${errorCount > 1 ? 's' : ''})`,
      description: errorMessages.split('\n')[0], // Show first error
      variant: "destructive",
    });
  };

  const handleReset = (formState: FormState) => {
    console.log('Form reset:', formState);
    toast({
      title: "Form Reset",
      description: "All fields have been cleared",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Demo</CardTitle>
          <CardDescription>
            Testing the FormEngine component with sample data. This demo shows how to integrate 
            the form engine into your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Product:</strong> {formConfig.productmaster.productname}
            </div>
            <div>
              <strong>LOB:</strong> {formConfig.productmaster.lob}
            </div>
            <div>
              <strong>Fields:</strong> {formConfig.productkeyword?.length || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      <FormEngine
        formConfig={formConfig}
        onSubmit={handleSubmit}
        onValidationError={handleValidationError}
        onReset={handleReset}
        initialValues={{
          SAMEPROPOSER: 'Y',
          SUMASSURED: '500000',
          POLICYTERM: '20',
        }}
        transactionCode="ISSU"
        calcStep="NBQUOTE"
      />
    </div>
  );
};
