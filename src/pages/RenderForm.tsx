/**
 * Insurance Form Demo Page
 * Demonstrates the Insurance Form Library with HDFC Life product
 */

import React, { useState } from "react";
import { FormEngine } from "@/components/form";
import type { APIResponse, FormState, ProductResponse } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ApiConfigForm } from "@/components/ApiConfigForm";

const InsuranceFormDemo: React.FC = () => {
  const [formConfig, setFormConfig] = useState<ProductResponse | null>(null);

  const handleDataFetched = (data: APIResponse) => {
    setFormConfig(data.response);
  };

  if (!formConfig) {
    return <ApiConfigForm onDataFetched={handleDataFetched} />;
  }

  const handleSubmit = (formState: FormState) => {
    console.log("Form submitted:", formState);
  };

  const stats = {
    totalFields: formConfig.productkeyword.length,
    sections: new Set(formConfig.productkeyword.map((f) => f.keywordsection))
      .size,
    fieldDeps: formConfig.productkeyworddependency?.length || 0,
    valueDeps: formConfig.productkeyworddependencyvalue?.length || 0,
    riders: formConfig.riders.length,
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Reusable Form Rendering Engine for NVEST
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Fields</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.totalFields}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.sections}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Field Dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.fieldDeps}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Value Dependencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.valueDeps}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Riders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.riders}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <div className="mt-6">
          <FormEngine
            formConfig={formConfig}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default InsuranceFormDemo;
