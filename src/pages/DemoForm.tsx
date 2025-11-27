import React, { useState, useEffect } from 'react';
import { FormEngine } from '@/lib/FormEngine';
import type { ProductResponse, FormState } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export const DemoForm: React.FC = () => {
  const [formConfig, setFormConfig] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://devlin.nvest.in/ProductConfig/api/GetProductInitialData', {
          method: 'POST',
          headers: {
            'RegCode': 'KIWI',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productid: "35001",
            riderid: null,
            companycode: 'KIWI',
            filterdataquery: '',
            param: {},
            inforequired: {},
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // The API wraps the response in a 'response' property
        const productData = data.response || data;
        
        console.log('Fetched form config:', productData);
        setFormConfig(productData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch form configuration';
        console.error('Error fetching form config:', err);
        setError(errorMessage);
        toast({
          title: "Error Loading Form",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormConfig();
  }, [toast]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading form configuration...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Form</CardTitle>
            <CardDescription>{error || 'No form configuration available'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API-Powered Form Demo</CardTitle>
          <CardDescription>
            Dynamic form loaded from ProductConfig API endpoint. Testing FormEngine with live data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>
              <strong>Product:</strong> {String(formConfig.productmaster.productname)}
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
        initialValues={{}}
        transactionCode="ISSU"
        calcStep="NBQUOTE"
      />
    </div>
  );
};
