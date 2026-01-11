import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Validates the configuration object.
 * @param {Object} config - The configuration object.
 * @throws {Error} If the configuration is invalid.
 */
function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Configuration object is required.");
  }
  if (!config.pages || !Array.isArray(config.pages) || config.pages.length === 0) {
    throw new Error("Configuration must include a non-empty 'pages' array.");
  }
}

/**
 * Extracts content from the DOM based on selectors.
 * @param {string} from - Selector for the start element.
 * @param {string} to - Selector for the end element.
 * @returns {DocumentFragment} The extracted content.
 */
function getRangeContent(from, to) {
  const startEl = document.querySelector(from);
  const endEl = document.querySelector(to);

  if (!startEl || !endEl) {
    throw new Error(`Invalid selectors provided: from '${from}', to '${to}'`);
  }

  const range = document.createRange();
  range.setStartBefore(startEl);
  range.setEndAfter(endEl);

  return range.cloneContents();
}

/**
 * Creates a hidden container to render the content for PDF generation.
 * @param {string} width - Width of the container.
 * @returns {HTMLElement} The created container.
 */
function createHiddenContainer(width = "794px") {
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    width: width,
    background: "white",
    padding: "20px",
    boxSizing: "border-box", // Ensure padding doesn't affect width
  });

  document.body.appendChild(container);
  return container;
}

/**
 * Converts OKLCH colors to RGBA for canvas compatibility.
 * @param {string} color - The color string.
 * @param {CanvasRenderingContext2D} ctx - A canvas context for color processing.
 * @returns {string} The collected RGBA color.
 */
function forceRgb(color, ctx) {
  if (!color || typeof color !== "string" || !color.includes("oklch")) {
    return color;
  }
  return color.replace(/oklch\([^)]+\)/g, (match) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = match;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    // data[3] is alpha in 0-255 range, rgba needs 0-1
    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
  });
}

/**
 * Processes an element and its children to convert OKLCH colors to RGB.
 * @param {HTMLElement} element - The root element to process.
 */
function processOklchColors(element) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");

  const elements = [element, ...element.getElementsByTagName("*")];
  
  for (const el of elements) {
    const style = window.getComputedStyle(el);

    // Iterating over all properties
    for (let i = 0; i < style.length; i++) {
        const prop = style[i];
        const val = style.getPropertyValue(prop);
        if (val && val.includes("oklch")) {
            el.style.setProperty(
                prop,
                forceRgb(val, ctx),
                style.getPropertyPriority(prop)
            );
        }
    }
      
    // Handle specific shorthand/computed properties aggressively
    const extraProps = ["backgroundImage", "boxShadow", "fill", "stroke", "color", "borderColor", "backgroundColor"];
    for (const prop of extraProps) {
       const val = style[prop];
       // Computed style access for camelCase properties
       if (val && typeof val === 'string' && val.includes("oklch")) {
          // We convert camelCase to kebab-case for setProperty if needed, but direct style assignment works too
          // Using strict style assignment for these specific overrides
           el.style[prop] = forceRgb(val, ctx);
       }
    }
  }
}


/**
 * Generates a PDF from specified DOM elements.
 * @param {Object} config - Configuration options.
 * @param {Array<{from: string, to: string}>} config.pages - Array of page definitions with selectors.
 * @param {string} [config.filename="document.pdf"] - Output filename.
 * @param {Object} [config.jsPDFOptions] - Options for jsPDF constructor.
 * @param {Object} [config.html2canvasOptions] - Options for html2canvas.
 * @returns {Promise<void>}
 */
export async function generatePDF(config) {
  validateConfig(config);

  const { 
    pages, 
    filename = "document.pdf", 
    jsPDFOptions = { orientation: "p", unit: "mm", format: "a4" },
    html2canvasOptions = {}
  } = config;

  const pdf = new jsPDF(jsPDFOptions);
  let isFirstPage = true;

  // Defaults for A4 size in mm roughly map to pixels at 96 DPI
  const pageWidthPx = 794; 

  for (const page of pages) {
    const { from, to } = page;

    let container;
    try {
      const content = getRangeContent(from, to);
      container = createHiddenContainer(`${pageWidthPx}px`);
      container.appendChild(content);

      // Mutate the DOM in the hidden container to fix OKLCH colors
      processOklchColors(container);

      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        windowWidth: pageWidthPx,
        onclone: (clonedDoc) => {
            // Re-run color processing on the cloned document used by html2canvas
            const clonedContainer = clonedDoc.body.lastChild;
            if (clonedContainer) {
                 processOklchColors(clonedContainer);
            }
        },
        ...html2canvasOptions,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      if (!isFirstPage) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      isFirstPage = false;
    } catch (error) {
       console.error(`Error processing page with selectors ${from} -> ${to}:`, error);
       // Continue to next page or re-throw based on preference?
       // For now, we log and continue to try to render partial document, 
       // but strictly speaking we might want to reject. 
       // Let's rethrow to inform the user the PDF generation failed.
       if (container && container.parentNode) {
            document.body.removeChild(container);
       }
       throw error;
    }

    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  }

  pdf.save(filename);
}
