# Smart PDF

[![npm version](https://img.shields.io/npm/v/smart-pdf.svg)](https://www.npmjs.com/package/smart-pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dt/smart-pdf.svg)](https://www.npmjs.com/package/smart-pdf)

**The ultimate DOM-to-PDF solution for modern web applications.**

`smart-pdf` is a powerful, lightweight, and developer-friendly wrapper around `html2canvas` and `jspdf`. It simplifies the complex process of generating multi-page PDFs from HTML, making it easy to turn your React, Next.js, or vanilla JavaScript web pages into professional-quality PDF documents.

Unlike standard libraries, `smart-pdf` comes with built-in support for modern CSS features like **OKLCH colors**, ensuring your PDF looks exactly as intended.

---

## Key Features

- **Multi-page Generation**: Effortlessly split your content across multiple pages using simple CSS selectors.
- ** OKLCH Color Support**: First-class support for modern CSS color spaces, automatically converting OKLCH to RGB for perfect rendering.
- ** React & Next.js Ready**: Designed to work seamlessly with modern component-based frameworks.
- ** Highly Configurable**: Full control over margins, orientation, formats (A4, Letter, etc.), and image quality.
- ** Lightweight**: Zero configuration needed for most use cases—just install and generate.

---

## 📦 Installation

Install the package via npm, yarn, or pnpm:

```bash
# npm
npm install smart-pdf

```

---

## 💡 Usage

### 1. Vanilla JavaScript / Basic Usage

The simplest way to use `smart-pdf` is to define the sections you want to capture and call `generatePDF`.

```javascript
import { generatePDF } from "smart-pdf";

const config = {
  filename: "monthly-report.pdf",
  pages: [
    {
      // First page content from element with ID 'page1'
      from: "#page1-start",
      to: "#page1-end",
    },
    {
      // Second page content
      from: ".section-2-start",
      to: ".section-2-end",
    },
  ],
};

document.getElementById("download-btn").addEventListener("click", () => {
  generatePDF(config).then(() => {
    console.log("PDF successfully downloaded!");
  });
});
```

---

### 2. Using with React

In React, you can use `useRef` to target elements, but using unique IDs or classes is often simpler for dynamic content.

```jsx
import React from "react";
import { generatePDF } from "smart-pdf";

const PDFReport = () => {
  const handleDownload = async () => {
    const config = {
      filename: "react-report.pdf",
      pages: [{ from: "#report-header", to: "#report-footer" }],
      jsPDFOptions: { orientation: "landscape" },
    };

    await generatePDF(config);
  };

  return (
    <div>
      <div id="report-header">
        <h1>Monthly Analytics</h1>
      </div>

      {/* Your complex content charts, tables, etc. */}
      <div className="content">
        <p>This content will be included in the PDF.</p>
      </div>

      <div id="report-footer">
        <p>End of Report</p>
      </div>

      <button onClick={handleDownload} className="btn-primary">
        Download PDF
      </button>
    </div>
  );
};

export default PDFReport;
```

---

### 3. Using with Next.js (App Router & Pages Router)

Since `smart-pdf` relies on browser APIs (`window`, `document`), it must be dynamically imported with `ssr: false` or used inside `useEffect` / event handlers to avoid Server-Side Rendering (SSR) errors like `ReferenceError: document is not defined`.

#### Method A: Inside a Client Component (Recommended for App Router)

```jsx
"use client"; // Important for App Router

import React from "react";

// You can import directly if function is called on an event (click)
// as the import will be resolved on the client.

import { generatePDF } from "smart-pdf";

export default function InvoicePage() {
  const downloadInvoice = async () => {
    // Alternatively, dynamic import inside the function for cleaner bundle splitting
    // const { generatePDF } = await import('smart-pdf');

    await generatePDF({
      filename: "invoice-123.pdf",
      pages: [{ from: ".invoice-start", to: ".invoice-end" }],
    });
  };

  return (
    <main>
      <div className="invoice-start">Invoice Header</div>
      {/* Invoice Details */}
      <div className="invoice-end">Thank you for your business</div>

      <button onClick={downloadInvoice}>Download Invoice</button>
    </main>
  );
}
```

#### Method B: Dynamic Import Component

If you need to render the component conditionally or simply want to ensure isolation:

```javascript
import dynamic from "next/dynamic";

const PDFButton = dynamic(() => import("../components/PDFButton"), {
  ssr: false,
});

export default function Page() {
  return <PDFButton />;
}
```

---

## ⚙️ Configuration (API Reference)

The `generatePDF(config)` function accepts a configuration object.

### `PDFConfig` Object

| Property                 | Type     | Default                        | Description                                                                                         |
| :----------------------- | :------- | :----------------------------- | :-------------------------------------------------------------------------------------------------- |
| **`pages`**              | `Array`  | **Required**                   | An array of objects defining the content for each page.                                             |
| **`filename`**           | `string` | `"document.pdf"`               | The name of the output file.                                                                        |
| **`jsPDFOptions`**       | `object` | `{ unit: 'mm', format: 'a4' }` | Options passed to `new jsPDF()`. See [jsPDF docs](http://raw.githack.com/MrRio/jsPDF/master/docs/). |
| **`html2canvasOptions`** | `object` | `{ scale: 2, useCORS: true }`  | Options passed to `html2canvas()`. `scale: 2` improves quality for retina displays.                 |

### `pages` Array Item

| Property   | Type     | Description                                                                              |
| :--------- | :------- | :--------------------------------------------------------------------------------------- |
| **`from`** | `string` | **CSS Selector** (e.g., `#start-id`, `.class-name`) marking the **beginning** of a page. |
| **`to`**   | `string` | **CSS Selector** marking the **end** of a page.                                          |

> **Note:** The library captures everything _between_ the `from` and `to` elements (inclusive) in the DOM order.

---

## Best Practices & Tips

1.  **Image Loading (CORS)**: If your PDF contains images from external URLs, you might face CORS issues.
    - Ensure your images are served with `Access-Control-Allow-Origin: *`.
    - Set `html2canvasOptions: { useCORS: true }` in the config (enabled by default).
2.  **Hiding Elements**: To hide buttons or controls in the generated PDF, use a CSS class (e.g., `.no-print`) and apply `opacity: 0` or unique styling during captured rendering, or temporary DOM manipulation.
3.  **Fonts**: For custom fonts to render correctly, ensure they are fully loaded before generating the PDF. `document.fonts.ready` can be useful.

## 📄 License

MIT © [Rashedul Haque Rasel](https://github.com/RashedulHaqueRasel1)
