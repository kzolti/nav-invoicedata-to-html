# NAV InvoiceData to HTML

A library to parse NAV Online Invoice XML data and generate a premium, localized HTML representation.

## Installation

```bash
npm install nav-invoicedata-to-html
```

## Requirements

- Node.js >= 18.0.0
- ESM support (The library is built as an ES Module)

## Usage

Since the library uses `libxml2-wasm` with top-level await, it must be imported dynamically in CommonJS environments.

### Basic Usage (ESM)

```typescript
import { generateInvoiceHtml } from 'nav-invoicedata-to-html';

const xmlData = '...'; // Your NAV XML string
// locale is second, xsdPath is third and optional
const html = await generateInvoiceHtml(xmlData, 'hu');
```

### Usage in CommonJS (e.g. ts-node-dev)

To avoid `require()` errors with top-level await modules, use the dynamic import trick:

```typescript
// Use Function trick to prevent tsc from transpiling to require()
const navHtml = await new Function('return import("nav-invoicedata-to-html")')();
const { generateInvoiceHtml } = navHtml;

const html = await generateInvoiceHtml(xmlData, 'hu');
```

## Features

- **Validation**: Validates XML against NAV XSD schemas.
- **Parsing**: Converts complex NAV XML structures into typed JavaScript objects.
- **HTML Generation**: Produces a clean, styled HTML version of the invoice.
- **Security**: Built-in HTML escaping via `@kitajs/html` to prevent XSS (Cross-Site Scripting) vulnerabilities when rendering untrusted XML data.
- **Localization**: Supports multiple locales (default: `hu`, `en`).
- **JSX Rendering**: Uses `@kitajs/html` for component-based template rendering with JSX.

## License

Apache-2.0

