import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function UploadZone({ onFilesAdded }: UploadZoneProps) {
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      const pdfFiles = droppedFiles.filter((file) => file.type === 'application/pdf');
      if (pdfFiles.length > 0) {
        onFilesAdded(pdfFiles);
      }
    },
    [onFilesAdded]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      const pdfFiles = selectedFiles.filter((file) => file.type === 'application/pdf');
      if (pdfFiles.length > 0) {
        onFilesAdded(pdfFiles);
      }
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-xl p-12",
        "flex flex-col items-center justify-center text-center cursor-pointer",
        "hover:border-blue-500 hover:bg-blue-50 transition-colors"
      )}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        Drag & drop PDF invoices here
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        or click to select files from your computer
      </p>
      <input
        id="file-upload"
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        onChange={onFileInput}
      />
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
        Select Files
      </button>
    </div>
  );
}
