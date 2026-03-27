import React from 'react';
import { FileText, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type FileStatus = 'pending' | 'parsing' | 'extracting' | 'ready' | 'error';

export interface InvoiceFile {
  id: string;
  file: File;
  originalName: string;
  status: FileStatus;
  extractedText?: string;
  extractedData?: Record<string, string>;
  proposedName?: string;
  errorMessage?: string;
}

interface PreviewTableProps {
  files: InvoiceFile[];
  onNameChange: (id: string, newName: string) => void;
  onRemove: (id: string) => void;
}

export function PreviewTable({ files, onNameChange, onRemove }: PreviewTableProps) {
  if (files.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Original Filename
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                Proposed Filename
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Status
              </th>
              <th scope="col" className="relative px-6 py-3 w-10">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="flex-shrink-0 h-5 w-5 text-gray-400 mr-3" />
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.originalName}>
                      {file.originalName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {file.status === 'ready' ? (
                    <input
                      type="text"
                      value={file.proposedName || ''}
                      onChange={(e) => onNameChange(file.id, e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      {file.status === 'error' ? 'Failed to generate' : 'Processing...'}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {file.status === 'pending' && <span className="text-sm text-gray-500">Queued</span>}
                    {file.status === 'parsing' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />}
                    {file.status === 'parsing' && <span className="text-sm text-blue-600">Reading PDF...</span>}
                    {file.status === 'extracting' && <Loader2 className="h-4 w-4 text-purple-500 animate-spin mr-2" />}
                    {file.status === 'extracting' && <span className="text-sm text-purple-600">AI Extracting...</span>}
                    {file.status === 'ready' && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                    {file.status === 'ready' && <span className="text-sm text-green-600">Ready</span>}
                    {file.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                    {file.status === 'error' && <span className="text-sm text-red-600 truncate max-w-[120px]" title={file.errorMessage}>{file.errorMessage || 'Error'}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onRemove(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
