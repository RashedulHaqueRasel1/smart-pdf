export interface PDFConfig {
  pages: { from: string; to: string }[];
  filename?: string;
}

export function generatePDF(config: PDFConfig): Promise<void>;
