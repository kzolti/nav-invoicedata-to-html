# Invoice Data Viewer

## Project Purpose
This project provides a way to display invoice data from the **Hungarian NAV Online Számla system (`invoiceData` XML)** as a multilingual HTML document.  
The goal is to make raw invoice data human-readable and understandable in different languages.

## What It Is **Not**
- The project **does not** generate an official invoice or a printable invoice layout.  
- It is **only** intended for displaying the data in a clear, structured, and user-friendly form.

## Key Features
- Multilingual support (e.g., Hungarian, English).
- Easy-to-read formatting of invoice elements.

## Installation
```bash
npm install nav-invoicedata-to-html
```

## Usage Example
```
import toHtml from "nav-invoicedata-to-html";

const xml = `...`;       // your invoiceData XML as a string
const lang = "en";       // language code: 'en', 'hu', etc.

const html = toHtml(xml, lang);

/**
 * Converts XML data to HTML format, taking into account the specified language translations.
 * @param {string} xml - XML string
 * @param {string} lang - Language code for translation, e.g., 'en', 'hu'
 * @returns {string} HTML output
 */
```

## Status
Work in progress. The goal is to cover as many elements of the invoiceData schema as possible.