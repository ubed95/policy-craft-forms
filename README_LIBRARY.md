# Insurance Form Library

A production-grade, reusable form library for insurance technology platforms that dynamically renders complex insurance forms based on API responses.

## 🚀 Features

- **Dynamic Form Rendering**: Completely API-driven, no frontend hardcoding
- **Expression Evaluation**: Safe evaluation of `@FIELDNAME` references, ternary operators, comparisons, and math
- **Multi-Level Dependencies**: Field-level and value-level dependency resolution
- **Conditional Rendering**: Dynamic visibility, enablement, and read-only states
- **Smart Validation**: Regex patterns, range validation, mandatory fields, and conditional rules
- **Multi-Section Forms**: Organized, collapsible sections
- **Type-Safe**: Comprehensive TypeScript types
- **Production-Ready**: Built with React 18+, TypeScript 5+, and modern best practices

## 📦 Tech Stack

- **React 18+**
- **TypeScript 5+**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **expr-eval** - Safe expression evaluation
- **Shadcn UI** - Component library

## 🏗️ Architecture

```
src/lib/insurance-form/
├── types.ts                  # TypeScript type definitions
├── expressionEvaluator.ts    # Safe expression parser & evaluator
├── dependencyResolver.ts     # Dependency graph & resolution
├── validator.ts              # Form validation engine
├── hooks/
│   └── useFormEngine.ts      # Main form management hook
├── components/
│   ├── FormEngine.tsx        # Main form orchestrator
│   ├── FormField.tsx         # Universal field renderer
│   └── FormSection.tsx       # Section grouping component
└── index.ts                  # Public API exports
```

## 📖 API Response Structure

The library expects an API response with the following structure:

```typescript
{
  productmaster: {
    productid: number;
    productname: string;
    lob: string;
    sublob: string;
  },
  productkeyword: [
    {
      keyword: string;
      keywordcaption: string;
      keywordtype: 'String' | 'Integer' | 'List' | 'DOB' | 'Date';
      keywordsection: string;
      defaultvalue: string | null;  // Supports expressions
      ismandatory: boolean;
      defaultuibehavior: 'SHOW' | 'HIDE' | 'READONLY';
      regex: string | null;
      keyminvalue: number | null;
      keymaxvalue: number | null;
      // ... more metadata
    }
  ],
  productkeywordvalue: [
    {
      keyword: string;
      keyworddisplay: string;
      keywordvalue: string;
      // Options for List fields
    }
  ],
  productkeyworddependency: [
    {
      changedkeyword: string;
      actionedkeyword: string;
      actiontotake: 'show' | 'hide' | 'enable' | 'disable';
      expression: string | null;
    }
  ],
  productkeyworddependencyvalue: [
    {
      changedkeyword: string;
      changedkeywordvalue: string;
      actionedkeyword: string;
      actionedkeywordvalue: string;
      actiontotake: 'show' | 'hide';
    }
  ]
}
```

## 🎯 Usage Example

```tsx
import { FormEngine } from '@/components/form';
import type { FormState } from '@/types';

function MyInsuranceForm() {
  const handleSubmit = (formState: FormState) => {
    console.log('Form values:', formState.values);
    // Submit to backend
  };

  const handleValueChange = (fieldName: string, value: any, formState: FormState) => {
    console.log(`${fieldName} changed to:`, value);
  };

  return (
    <FormEngine
      formConfig={apiResponse}
      onSubmit={handleSubmit}
      onValueChange={handleValueChange}
      initialValues={{ SAMEPROPOSER: 'Y' }}
      mode="create"
    />
  );
}
```

## 🔧 Core Features

### Expression Evaluation

The library supports safe expression evaluation without `eval()`:

```typescript
// Field definition
{
  keyword: "INSUREDNAME",
  defaultvalue: "@SAMEPROPOSER == 'Y' ? @PROPOSERNAME : @INSUREDNAME"
}

// Supported expressions:
// - Field references: @FIELDNAME
// - Ternary operators: condition ? true_value : false_value
// - Comparisons: ==, !=, >, <, >=, <=
// - Logical operators: &&, ||
// - Math: +, -, *, /
```

### Dependency Resolution

Automatic field dependency management:

```typescript
// Field-level dependency
{
  changedkeyword: "SAMEPROPOSER",
  actionedkeyword: "PROPOSERNAME",
  actiontotake: "show",
  expression: "@SAMEPROPOSER == 'Y'"
}

// Value-level dependency
{
  changedkeyword: "RESIDENCESTATUS",
  changedkeywordvalue: "RESS_RI",
  actionedkeyword: "INSUREDCOUNTRY",
  actionedkeywordvalue: "CNTRY_IND",
  actiontotake: "hide"
}
```

### Validation

Comprehensive validation support:

- **Required fields**: Based on `ismandatory`
- **Regex patterns**: Custom pattern validation
- **Range validation**: Min/max values and lengths
- **Conditional validation**: Expression-based rules
- **Real-time feedback**: Validation on blur and submit

## 🎨 Customization

The library uses a consistent design system defined in `index.css` and `tailwind.config.ts`. All colors, spacing, and styling are themeable through CSS variables:

```css
:root {
  --primary: 215 85% 45%;
  --form-section-bg: 0 0% 100%;
  --form-label: 215 25% 25%;
  --form-error: 0 85% 55%;
  /* ... more variables */
}
```

## 📊 Demo

The library includes a comprehensive demo showing:

- Live form rendering with HDFC Life product data
- Real-time dependency updates
- Expression evaluation in action
- Validation feedback
- Form submission handling

**Demo Statistics (HDFC Life Example):**
- 50+ dynamic fields
- Multiple sections
- Field-level dependencies
- Value-level dependencies
- 7 available riders

## 🔍 Key Concepts

### 1. Field Types

- `String`: Text input
- `Integer`/`Decimal`: Number input
- `List`: Dropdown select
- `DOB`/`Date`: Date picker
- `Boolean`: Radio buttons (Yes/No)
- `Email`: Email input with validation
- `Phone`: Phone number input

### 2. UI Behaviors

- `SHOW`: Field is visible (default)
- `HIDE`: Field is hidden
- `READONLY`: Field is visible but not editable
- `DISABLED`: Field is visible but disabled

### 3. Dependency Actions

- `show`/`hide`: Control visibility
- `enable`/`disable`: Control interactivity
- `readonly`: Make field read-only
- `mandatory`/`optional`: Dynamic required state

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check
```

## 📝 Testing

The library is designed to be easily testable:

- Pure functions for expression evaluation
- Isolated dependency resolution logic
- Mockable API responses
- Unit testable validation rules

## 🚀 Production Deployment

The library is production-ready and includes:

- ✅ Type-safe TypeScript implementation
- ✅ Safe expression evaluation (no `eval()`)
- ✅ Circular dependency detection
- ✅ Comprehensive error handling
- ✅ Performance optimizations (memoization, batching)
- ✅ Accessibility features (ARIA labels, keyboard navigation)
- ✅ Responsive design
- ✅ Dark mode support

## 🤝 Contributing

This is a production-grade library suitable for insurance tech platforms. The architecture supports:

- Multiple products and LOBs
- Multiple transaction types (Quote, Issuance, Amendment)
- Rider management
- Multi-step forms
- Complex business rules

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built for insurance technology platforms requiring dynamic, configurable form systems that can adapt to changing product requirements without code changes.

---

**Made with ❤️ for the Insurance Tech Industry**
