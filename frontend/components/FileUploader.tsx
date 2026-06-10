import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
  isParsing: boolean;
  error: string | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isParsing, error }) => {
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
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, PNG, or JPG file.');
      return;
    }
    onUpload(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Quote Document</h2>
        <p className="text-slate-500">Upload a PDF, PNG, or JPG quote to extract MSRP and calculate reseller costs.</p>
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
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleChange}
          className="hidden"
        />
        
        {isParsing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
            <p className="text-lg font-medium text-slate-700">Analyzing Document...</p>
            <p className="text-sm text-slate-500">Extracting products, SKUs, and MSRP data.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer" onClick={() => inputRef.current?.click()}>
            <div className="flex space-x-4">
              <div className="p-4 bg-brand-100 rounded-full text-brand-600">
                <FileText className="w-8 h-8" />
              </div>
              <div className="p-4 bg-brand-100 rounded-full text-brand-600">
                <ImageIcon className="w-8 h-8" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-sm text-slate-500 mt-1">PDF, PNG, or JPG files (Max 10MB)</p>
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
    </div>
  );
};
