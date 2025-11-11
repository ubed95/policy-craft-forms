/**
 * API Configuration Form Component
 * Allows users to configure and fetch form data from the API
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Server } from 'lucide-react';
import { useToast } from '@/hooks';
import type { APIResponse } from '@/types';

interface ApiConfig {
  productid: string;
  riderid: string | null;
  prodtype: string;
  lob: string;
  sublob: string;
  transactioncode: string;
  calcstep: string;
  companycode: string;
  filterdataquery: string;
  param: Record<string, unknown>;
  inforequired: Record<string, unknown>;
}

interface ApiConfigFormProps {
  onDataFetched: (data: APIResponse) => void;
}

const defaultConfig: ApiConfig = {
  productid: '24003',
  riderid: null,
  prodtype: 'PRODUCT',
  lob: 'LIFE',
  sublob: 'PAR',
  transactioncode: 'ISSU',
  calcstep: 'NBQUOTE',
  companycode: 'HDFCLIFE',
  filterdataquery: '',
  param: {},
  inforequired: {},
};

export const ApiConfigForm: React.FC<ApiConfigFormProps> = ({ onDataFetched }) => {
  const [config, setConfig] = useState<ApiConfig>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ApiConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: field === 'riderid' && value === '' ? null : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://devlin.nvest.in/ProductConfig/api/GetProductInitialData', {
        method: 'POST',
        headers: {
          'RegCode': 'AUBANK',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: APIResponse = await response.json();
      
      toast({
        title: 'Success',
        description: 'Form configuration loaded successfully',
      });

      onDataFetched(data);
    } catch (error) {
      console.error('API Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch form configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Server className="h-6 w-6" />
            Configure Product API
          </CardTitle>
          <CardDescription>
            Enter the product configuration parameters to fetch and render the insurance form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productid">Product ID *</Label>
                <Input
                  id="productid"
                  value={config.productid}
                  onChange={(e) => handleInputChange('productid', e.target.value)}
                  required
                  placeholder="e.g., 24003"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riderid">Rider ID</Label>
                <Input
                  id="riderid"
                  value={config.riderid || ''}
                  onChange={(e) => handleInputChange('riderid', e.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prodtype">Product Type *</Label>
                <Input
                  id="prodtype"
                  value={config.prodtype}
                  onChange={(e) => handleInputChange('prodtype', e.target.value)}
                  required
                  placeholder="e.g., PRODUCT"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lob">Line of Business *</Label>
                <Input
                  id="lob"
                  value={config.lob}
                  onChange={(e) => handleInputChange('lob', e.target.value)}
                  required
                  placeholder="e.g., LIFE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sublob">Sub LOB *</Label>
                <Input
                  id="sublob"
                  value={config.sublob}
                  onChange={(e) => handleInputChange('sublob', e.target.value)}
                  required
                  placeholder="e.g., PAR"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactioncode">Transaction Code *</Label>
                <Input
                  id="transactioncode"
                  value={config.transactioncode}
                  onChange={(e) => handleInputChange('transactioncode', e.target.value)}
                  required
                  placeholder="e.g., ISSU"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calcstep">Calc Step *</Label>
                <Input
                  id="calcstep"
                  value={config.calcstep}
                  onChange={(e) => handleInputChange('calcstep', e.target.value)}
                  required
                  placeholder="e.g., NBQUOTE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companycode">Company Code *</Label>
                <Input
                  id="companycode"
                  value={config.companycode}
                  onChange={(e) => handleInputChange('companycode', e.target.value)}
                  required
                  placeholder="e.g., HDFCLIFE"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="filterdataquery">Filter Data Query</Label>
                <Input
                  id="filterdataquery"
                  value={config.filterdataquery}
                  onChange={(e) => handleInputChange('filterdataquery', e.target.value)}
                  placeholder="Optional SQL filter"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Configuration...
                </>
              ) : (
                'Load Form Configuration'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
