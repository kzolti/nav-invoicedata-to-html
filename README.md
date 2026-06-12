# NAV InvoiceData to HTML

A library to parse NAV Online Invoice XML data and generate a premium, localized HTML representation.

## Installation

```bash
npm install nav-invoicedata-to-html
```

## Requirements

- Node.js >= 18.0.0
- ESM support (The library is built as an ES Module)

## Dependencies

- [`nav-osa-types`](https://github.com/kzolti/nav-osa-types) — shared NAV OSA types, XML parsing, and XSD validation

## Usage

Since the library uses `libxml2-wasm` (via `nav-osa-types`) with top-level await, it must be imported dynamically in CommonJS environments.

### Basic Usage (ESM)

```typescript
import { generateInvoiceHtml } from 'nav-invoicedata-to-html';

const xmlData = '...'; // Your NAV XML string
const html = await generateInvoiceHtml(xmlData);
```

### Usage in CommonJS (e.g. ts-node-dev)

To avoid `require()` errors with top-level await modules, use the dynamic import trick:

```typescript
// Use Function trick to prevent tsc from transpiling to require()
const navHtml = await new Function('return import("nav-invoicedata-to-html")')();
const { generateInvoiceHtml } = navHtml;

const html = await generateInvoiceHtml(xmlData);
```

### Options

`generateInvoiceHtml` accepts an optional second parameter with the following properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `locale` | `string` | `'hu'` | Language (`hu`, `en`, ...) |
| `xsdPath` | `string` | built-in `data.xsd` | Custom XSD schema path |
| `cssConfig` | `CssConfig` | external link | CSS configuration (see below) |
| `validate` | `boolean` | `true` | XSD validation (disable with `false`) |

```typescript
const html = await generateInvoiceHtml(xmlData, {
  locale: 'en',
  xsdPath: '/path/to/custom.xsd'
});

// Skip validation if XML is already trusted
const html = await generateInvoiceHtml(xmlData, { validate: false });
```

### CSS Configuration

By default, the generated HTML references `invoice-styles.css` via a `<link>` tag. You can customize this via `cssConfig`:

#### External CSS file

```typescript
const html = await generateInvoiceHtml(xmlData, {
  cssConfig: { path: 'my-custom.css' }
});
```

#### Inline CSS

```typescript
import fs from 'fs/promises';

const cssContent = await fs.readFile('my-custom.css', 'utf-8');
const html = await generateInvoiceHtml(xmlData, {
  cssConfig: { inline: cssContent }
});
```

`CssConfig` properties:
- `path` — URL or file path for an external stylesheet (`<link>` tag)
- `inline` — Raw CSS content to embed directly (`<style>` tag)

If neither is provided, it defaults to `<link rel="stylesheet" href="invoice-styles.css">`.

## Features

- **Validation**: Validates XML against NAV XSD schemas via `nav-osa-types`.
- **Parsing**: Converts complex NAV XML structures into typed JavaScript objects.
- **HTML Generation**: Produces a clean, styled HTML version of the invoice.
- **Security**: Built-in HTML escaping via `@kitajs/html` to prevent XSS (Cross-Site Scripting) vulnerabilities when rendering untrusted XML data.
- **Localization**: Supports multiple locales (default: `hu`, `en`).
- **JSX Rendering**: Uses `@kitajs/html` for component-based template rendering with JSX.

## License

Apache-2.0

