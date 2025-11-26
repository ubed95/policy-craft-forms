import React from 'react';
import { DemoForm } from './pages/DemoForm';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Form Engine Demo</h1>
          <p className="text-muted-foreground mt-2">
            Development environment for @nvest/form-engine library
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <DemoForm />
      </main>
      
      <Toaster />
    </div>
  );
}

export default App;
