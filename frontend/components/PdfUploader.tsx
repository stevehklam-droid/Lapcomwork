import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface PdfUploaderProps {
  onUpload: (file: File) => void;
  isParsing: boolean;
  error: string | null;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onUpload, isParsing, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    onUpload(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Supplier Quote</h2>
        <p className="text-slate-500">Upload a PDF quote to automatically extract items and calculate pricing.</p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-400'
        } ${isParsing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
        />
        
        {isParsing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            <p className="text-lg font-medium text-slate-700">Analyzing Document...</p>
            <p className="text-sm text-slate-500">Extracting line items, quantities, and costs securely.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer" onClick={() => inputRef.current?.click()}>
            <div className="p-4 bg-brand-100 rounded-full text-brand-600">
              <UploadCloud className="w-10 h-10" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500 mt-1">PDF files only (Max 10MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start space-x-3">
        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Security Note</p>
          <p>Your supplier cost data is processed securely in memory. Original PDFs and cost data are not permanently stored on our servers, ensuring your margins remain confidential.</p>
        </div>
      </div>
    </div>
  );
};
