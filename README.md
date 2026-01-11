# Smart PDF

[![npm version](https://img.shields.io/npm/v/smart-pdf.svg)](https://www.npmjs.com/package/smart-pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful and simplified wrapper around `html2canvas` and `jspdf` to generate multi-page PDFs from specific DOM elements. It handles complex CSS including **OKLCH color conversion** automatically, ensuring your PDF looks exactly like your web page.

## Features

- **Multi-page Support**: Define multiple pages by specifying start and end elements.
- **OKLCH Color Support**: Automatically converts modern OKLCH colors to RGB for compatibility with `html2canvas`.
- **Configurable**: Customize PDF format, orientation, margin, and rendering options.
- **Clean API**: Simple configuration object to control output.

## Installation

```bash
npm install smart-pdf
```

## Usage

### Basic Example

Suppose you have a long report that you want to split into pages based on specific sections.

```javascript
import { generatePDF } from "smart-pdf";

const config = {
  filename: "my-report.pdf",
  pages: [
    {
      from: "#page1-start",
      to: "#page1-end",
    },
    {
      from: "#page2-start",
      to: "#page2-end",
    },
  ],
};

document.getElementById("download-btn").addEventListener("click", () => {
  generatePDF(config).then(() => {
    console.log("PDF Generated Successfully");
  });
});
```

### Advanced Configuration

You can pass standard `jsPDF` and `html2canvas` options.

```javascript
const config = {
  filename: "detailed-report.pdf",
  // Standard jsPDF options
  jsPDFOptions: {
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  },
  // html2canvas options
  html2canvasOptions: {
    scale: 3, // Higher quality
    logging: true,
  },
  pages: [{ from: ".section-1-start", to: ".section-1-end" }],
};

generatePDF(config);
```

## API Reference

### `generatePDF(config)`

Generates a PDF file based on the provided configuration.

#### Parameters

- `config` (Object): Configuration object.

#### Config Object Properties

| Property             | Type     | Default                        | Description                                         |
| -------------------- | -------- | ------------------------------ | --------------------------------------------------- |
| `pages`              | `Array`  | **Required**                   | Array of objects defining page content ranges.      |
| `filename`           | `String` | `"document.pdf"`               | The name of the downloaded PDF file.                |
| `jsPDFOptions`       | `Object` | `{ unit: 'mm', format: 'a4' }` | Options passed directly to the `jsPDF` constructor. |
| `html2canvasOptions` | `Object` | `{ scale: 2, useCORS: true }`  | Options passed directly to `html2canvas`.           |

#### Page Object Properties

| Property | Type     | Description                                        |
| -------- | -------- | -------------------------------------------------- |
| `from`   | `String` | CSS selector for the starting element of the page. |
| `to`     | `String` | CSS selector for the ending element of the page.   |

## License

MIT © [Rashedul Haque Rasel](https://github.com/RashedulHaqueRasel1)
