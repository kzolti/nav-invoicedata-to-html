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
| `schemaName` | `XsdSchemaName` | `XsdSchemaName.Data` | XSD schema to validate against (e.g. `Data`, `Batch`) |
| `cssConfig` | `CssConfig` | bundled inline CSS | CSS configuration (see below) |
| `validate` | `boolean` | `true` | XSD validation (disable with `false`) |

```typescript
const html = await generateInvoiceHtml(xmlData, {
  locale: 'en',
  schemaName: XsdSchemaName.Batch
});

// Skip validation if XML is already trusted
const html = await generateInvoiceHtml(xmlData, { validate: false });
```

### CSS Configuration

By default, the generated HTML embeds the bundled `invoice-styles.css` inline as a `<style>` tag, so no external file is required. You can customize this via `cssConfig`:

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

If neither is provided, the bundled stylesheet is embedded inline. The bundled stylesheet is also exported from the package (`nav-invoicedata-to-html/dist/invoice-styles.css`) if you want to reference it externally, e.g. as a starting point for your own customization.

### Additional data sections (AdditionalDataType)

`additionalInvoiceData` entries addressed to the library (namespace prefix `I00000_IDTOHTMLDATA`) are rendered in dedicated sections based on their name, and can be provided per language:

```
I00000_IDTOHTMLDATA__<NYELV>__<SZEKCIO>[__KEY]
```

- `NYELV` — language tag (`HU`, `ENG`, ...). Only entries matching the generator `locale` are rendered (`hu` → `HU`, `en` → `ENG`); entries in other languages are omitted.
- `SZEKCIO` — one of:
  - `DOCUMENT_NAME` — document title (replaces the default "Invoice" heading)
  - `DOCUMENT_DESC` — description shown under the document title
  - `SUPPLIER_BLOCK` — extra rows appended to the supplier block
  - `CUSTOMER_BLOCK` — extra rows appended to the customer block
- `KEY` — optional suffix, allowing multiple entries in the same section

Example:

```xml
<I00000_IDTOHTMLDATA__HU__DOCUMENT_NAME>Proforma számla</I00000_IDTOHTMLDATA__HU__DOCUMENT_NAME>
<I00000_IDTOHTMLDATA__ENG__DOCUMENT_NAME>Proforma invoice</I00000_IDTOHTMLDATA__ENG__DOCUMENT_NAME>
<I00000_IDTOHTMLDATA__HU__SUPPLIER_BLOCK__IBAN>HU12 3456 7890</I00000_IDTOHTMLDATA__HU__SUPPLIER_BLOCK__IBAN>
```

All other (non-addressed) `additionalInvoiceData` entries are rendered in an "Additional Data" (További adatok) section at the end of the invoice.

## Features

- **Validation**: Validates XML against NAV XSD schemas via `nav-osa-types`.
- **Parsing**: Converts complex NAV XML structures into typed JavaScript objects.
- **HTML Generation**: Produces a clean, styled HTML version of the invoice.
- **Security**: Built-in HTML escaping via `@kitajs/html` to prevent XSS (Cross-Site Scripting) vulnerabilities when rendering untrusted XML data.
- **Localization**: Supports multiple locales (default: `hu`, `en`).
- **Additional data sections**: `additionalInvoiceData` can be routed into dedicated sections (document title/description, supplier/customer blocks) with per-language entries.
- **JSX Rendering**: Uses `@kitajs/html` for component-based template rendering with JSX.

## License

Apache-2.0

