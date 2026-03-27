import React from 'react';

interface ConfigPanelProps {
  template: string;
  setTemplate: (template: string) => void;
}

export function ConfigPanel({ template, setTemplate }: ConfigPanelProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Naming Configuration</h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="template" className="text-sm font-medium text-gray-700">
          Filename Template
        </label>
        <div className="flex gap-4 items-center">
          <input
            id="template"
            type="text"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., [Date]-[Vendor].pdf"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Use brackets to define dynamic tokens. Examples: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">[YYYY-MM-DD]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">[Company_Name]</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">[Invoice_Number]</code>
        </p>
      </div>
    </div>
  );
}
