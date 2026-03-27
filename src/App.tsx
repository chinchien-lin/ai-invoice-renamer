import React, { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { UploadZone } from './components/UploadZone';
import { ConfigPanel } from './components/ConfigPanel';
import { PreviewTable, InvoiceFile } from './components/PreviewTable';
import { extractTextFromPDF } from './lib/pdfParser';
import { extractEntities, generateProposedName } from './lib/aiExtractor';
import { FileDown, FileText, Loader2 } from 'lucide-react';

export default function App() {
  const [template, setTemplate] = useState('[YYYY-MM-DD] - [Vendor].pdf');
  const [files, setFiles] = useState<InvoiceFile[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const processFile = async (fileId: string, file: File, currentTemplate: string) => {
    try {
      // 1. Parsing
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'parsing' } : f))
      );
      const text = await extractTextFromPDF(file);

      // 2. Extracting
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, status: 'extracting', extractedText: text } : f))
      );
      const extractedData = await extractEntities(text, currentTemplate);
      const proposedName = generateProposedName(currentTemplate, extractedData);

      // 3. Ready
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, status: 'ready', extractedData, proposedName }
            : f
        )
      );
    } catch (error: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, status: 'error', errorMessage: error.message } : f
        )
      );
    }
  };

  const handleFilesAdded = useCallback(
    (newFiles: File[]) => {
      const newInvoiceFiles: InvoiceFile[] = newFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        originalName: file.name,
        status: 'pending',
      }));

      setFiles((prev) => [...prev, ...newInvoiceFiles]);

      // Process each file
      newInvoiceFiles.forEach((f) => {
        processFile(f.id, f.file, template);
      });
    },
    [template]
  );

  const handleNameChange = (id: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, proposedName: newName } : f))
    );
  };

  const handleRemove = (id: string) => {
    setFiles((prev) => prev.map(f => f.id === id ? { ...f, status: 'error', errorMessage: 'Removed' } : f).filter(f => f.id !== id));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const readyFiles = files.filter((f) => f.status === 'ready' && f.proposedName);

      if (readyFiles.length === 0) {
        alert("No files ready to export.");
        return;
      }

      for (const f of readyFiles) {
        // Ensure unique names in zip if there are duplicates
        let finalName = f.proposedName || f.originalName;
        // Basic sanitize
        finalName = finalName.replace(/[/\\?%*:|"<>]/g, '-');
        if (!finalName.toLowerCase().endsWith('.pdf')) {
          finalName += '.pdf';
        }
        zip.file(finalName, f.file);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      
      // Download
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'renamed_invoices.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to create ZIP file.");
    } finally {
      setIsExporting(false);
    }
  };

  const readyCount = files.filter((f) => f.status === 'ready').length;
  const totalCount = files.length;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">AI Invoice Renamer</h1>
          </div>
          {readyCount > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export {readyCount} {readyCount === 1 ? 'File' : 'Files'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-gray-600 text-lg">
            Automatically rename your PDF invoices based on their contents. Define a template, upload your files, and let AI do the heavy lifting.
          </p>
        </div>

        <ConfigPanel template={template} setTemplate={setTemplate} />
        
        <UploadZone onFilesAdded={handleFilesAdded} />

        {totalCount > 0 && (
          <PreviewTable
            files={files}
            onNameChange={handleNameChange}
            onRemove={handleRemove}
          />
        )}
      </main>
    </div>
  );
}
