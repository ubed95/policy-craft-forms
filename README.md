# @kiwiinsurance/dynamic-form-engine

Production-grade dynamic form rendering engine for React with built-in dependency resolution, validation, and state management.

## Features

✅ **Dynamic Form Generation** - Render complex forms from API configuration  
✅ **Dependency Resolution** - Field-level and value-level dependencies with expression evaluation  
✅ **Real-time Validation** - Comprehensive validation with custom rules  
✅ **State Management** - Built-in form state with visibility, disabled, and readonly states  
✅ **Data Source Integration** - Dynamic field options from external data sources  
✅ **TypeScript First** - Full type safety with zero `any` types  
✅ **Expression Evaluation** - Safe expression parsing with `@FIELDNAME` syntax  
✅ **Production Ready** - Battle-tested in insurance domain applications

## Installation

```bash
npm install @kiwiinsurance/dynamic-form-engine
# or
yarn add @kiwiinsurance/dynamic-form-engine
# or
pnpm add @kiwiinsurance/dynamic-form-engine
```

## Basic Usage

```tsx
import { FormEngine } from '@kiwiinsurance/dynamic-form-engine';
import type { ProductResponse, FormState } from '@kiwiinsurance/dynamic-form-engine';
import '@kiwiinsurance/dynamic-form-engine/dist/style.css';

function App() {
  // Fetch this from your API
  const formConfig: ProductResponse = {
    // Your API response
  };

  const handleSubmit = (formState: FormState) => {
    console.log('Form submitted:', formState.values);
    // Process form data - send to backend, etc.
  };

  const handleValidationError = (errors: Record<string, string[]>) => {
    console.error('Form validation failed:', errors);
    // Display errors in your UI (toast, modal, inline, etc.)
  };

  const handleReset = (formState: FormState) => {
    console.log('Form reset with state:', formState);
    // Optional: Custom cleanup logic
  };

  return (
    <FormEngine
      formConfig={formConfig}
      onSubmit={handleSubmit}
      onValidationError={handleValidationError}
      onReset={handleReset}
      initialValues={{ SAMEPROPOSER: 'Y' }}
      transactionCode="ISSU"
      calcStep="NBQUOTE"
    />
  );
}
```

## API Configuration

Your backend should return a `ProductResponse` object with the following structure:

```typescript
interface ProductResponse {
  productmaster: {
    productname: string;
    lob: string;
    sublob: string;
    // ... other metadata
  };
  productkeyword: ProductKeyword[];
  productkeywordvalue: ProductKeywordValue[];
  productkeyworddatasource: Record<string, Record<string, string>[]>;
  productkeyworddependency?: ProductKeywordDependency[];
  productkeyworddependencyvalue?: ProductKeywordDependencyValue[];
  riders: Rider[];
}
```

## Props

### FormEngineProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `formConfig` | `ProductResponse` | ✅ | - | Complete form configuration from API |
| `onSubmit` | `(formState: FormState) => void` | ✅ | - | Callback fired when form is submitted with valid data |
| `onValidationError` | `(errors: Record<string, string[]>) => void` | ❌ | - | Optional callback fired when form validation fails on submit |
| `onReset` | `(formState: FormState) => void` | ❌ | - | Optional callback fired when reset button is clicked |
| `initialValues` | `Record<string, string>` | ❌ | `{}` | Initial values for form fields |
| `className` | `string` | ❌ | - | CSS class name for root element |
| `transactionCode` | `string` | ❌ | `'ISSU'` | Transaction context code for form |
| `calcStep` | `string` | ❌ | `'NBQUOTE'` | Calculation step code for form |

## FormState Structure

The `FormState` object contains complete form state information:

```typescript
interface FormState {
  values: Record<string, string>;           // Current field values
  errors: Record<string, string[]>;         // Validation errors per field
  touched: Record<string, boolean>;         // Fields that have been touched
  visibility: Record<string, boolean>;      // Field visibility states
  disabled: Record<string, boolean>;        // Disabled states
  readonly: Record<string, boolean>;        // Readonly states
  mandatory: Record<string, boolean>;       // Required field states
}
```

### Example FormState

```typescript
{
  values: {
    SAMEPROPOSER: "Y",
    PROPOSERNAME: "John Doe",
    AGE: "35"
  },
  errors: {
    EMAIL: ["Invalid email format"]
  },
  touched: {
    EMAIL: true,
    PROPOSERNAME: true
  },
  visibility: {
    PROPOSERNAME: true,
    PROPOSEREMAIL: false  // Hidden by dependency
  },
  disabled: {
    AGE: false
  },
  readonly: {
    POLICYTYPE: true
  },
  mandatory: {
    PROPOSERNAME: true,
    EMAIL: true
  }
}
```

## Advanced Features

### 1. Field Dependencies

The engine supports three types of dependencies:

#### Expression-based Defaults
Fields can have dynamic default values using `@FIELDNAME` syntax:

```typescript
// API Configuration
{
  keyword: "SUMASSURED",
  defaultvalue: "@PREMIUM * 10"  // Calculated from PREMIUM field
}
```

#### Field-level Visibility
Show/hide entire fields based on other field values:

```typescript
// productkeyworddependency
{
  dependentkeyword: "PROPOSEREMAIL",
  keyword: "SAMEPROPOSER",
  condition: "N",
  action: "SHOW"  // Show email field when SAMEPROPOSER is 'N'
}
```

#### Value-level Option Filtering
Filter dropdown options dynamically:

```typescript
// productkeyworddependencyvalue
{
  dependentkeyword: "CITY",
  keyword: "STATE",
  keywordvalue: "MH",  // When STATE is 'MH'
  dependentkeywordvalue: "Mumbai,Pune,Nagpur"  // Only show these cities
}
```

### 2. Data Source Resolution

Fields with `chkfieldsource: true` load options dynamically from `productkeyworddatasource`:

```typescript
{
  keyword: "OCCUPATION",
  chkfieldsource: true,
  fieldvaluedata: [{
    fieldvaluecode: "OccupationMaster",
    fieldvaluesourcetype: "lookup",
    fieldvaluemetadata: {
      lookup: "@AGEGRP=='ADULT'",  // Filter condition
      keywordvalue: "occupationCode",
      keyworddisplay: "occupationName"
    }
  }]
}
```

### 3. Validation System

Supports multiple validation types:

- **Required fields**: `ismandatory: true`
- **Regex patterns**: `regex: "^[A-Za-z ]+$"`
- **Min/Max values**: `keyminvalue`, `keymaxvalue`
- **Length constraints**: `minlength`, `maxlength`
- **Custom rules**: Via `addlcondition`

### 4. Expression Evaluation

Safe expression evaluation without `eval()`:

```typescript
// Supported expressions
"@PREMIUM * 12"                    // Arithmetic
"@AGE > 18 ? 'Adult' : 'Minor'"   // Ternary
"@STATE == 'MH' && @CITY == 'Mumbai'"  // Logical operators
"@INCOME + @BONUS - @DEDUCTIONS"  // Multiple operations
```

## Field Types

The library supports multiple field types:

| Type | Description | Component |
|------|-------------|-----------|
| `String` | Text input | Input |
| `Integer` | Numeric input (whole numbers) | Input (number) |
| `Decimal` | Numeric input (decimal) | Input (number) |
| `DOB` | Date of birth | Input (date) |
| `Date` | Date picker | Input (date) |
| `List` | Dropdown selection | Select |
| `Boolean` | Checkbox | Checkbox |
| `Phone` | Phone number | Input (tel) |
| `Email` | Email address | Input (email) |

## TypeScript Support

All types are exported for full type safety:

```typescript
import type {
  // Main types
  FormEngineProps,
  ProductResponse,
  FormState,
  
  // Field types
  ProductKeyword,
  ProductKeywordValue,
  FieldMetadata,
  FieldType,
  
  // Dependency types
  ProductKeywordDependency,
  ProductKeywordDependencyValue,
  
  // Validation types
  ValidationResult,
  ValidationRule,
  
  // Other types
  FormSection,
  FormConfig,
} from '@kiwiinsurance/dynamic-form-engine';
```

## Examples

### Complete Integration Example

```tsx
import { useState, useEffect } from 'react';
import { FormEngine } from '@kiwiinsurance/dynamic-form-engine';
import type { ProductResponse, FormState } from '@kiwiinsurance/dynamic-form-engine';
import '@kiwiinsurance/dynamic-form-engine/dist/style.css';

function InsuranceQuoteForm() {
  const [formConfig, setFormConfig] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch form configuration from your API
    fetch('https://api.example.com/product-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RegCode': 'AUBANK'
      },
      body: JSON.stringify({
        productid: 123,
        transactioncode: 'ISSU',
        calcstep: 'NBQUOTE',
        lob: 'LIFE',
        sublob: 'TERM'
      })
    })
      .then(res => res.json())
      .then(data => {
        setFormConfig(data.response);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load form config:', error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (formState: FormState) => {
    try {
      const response = await fetch('https://api.example.com/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState.values)
      });
      
      if (response.ok) {
        alert('Quote submitted successfully!');
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const handleReset = (formState: FormState) => {
    console.log('Form reset. Last state:', formState);
    // Optional: Clear saved draft, reset analytics, etc.
  };

  if (loading) return <div>Loading form...</div>;
  if (!formConfig) return <div>Failed to load form</div>;

  return (
    <div className="container mx-auto p-6">
      <FormEngine
        formConfig={formConfig}
        onSubmit={handleSubmit}
        onReset={handleReset}
        initialValues={{ SAMEPROPOSER: 'Y' }}
        transactionCode="ISSU"
        calcStep="NBQUOTE"
      />
    </div>
  );
}

export default InsuranceQuoteForm;
```

## Styling

The library uses Tailwind CSS for styling. Import the CSS file in your application:

```tsx
import '@kiwiinsurance/dynamic-form-engine/dist/style.css';
```

You can customize the theme by overriding CSS variables in your own stylesheet:

```css
:root {
  --primary: 220 90% 56%;
  --primary-foreground: 0 0% 100%;
  --border: 220 13% 91%;
  /* ... other variables */
}
```

## Bundle Size

- **ES Module**: ~72KB gzipped
- **CSS**: ~40KB gzipped
- **Total**: ~112KB gzipped

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues and feature requests, please use GitHub Issues.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.