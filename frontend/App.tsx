import React, { useState } from 'react';
import { AppStep, QuoteItem, ParsedItem } from './types';
import { parseSupplierQuote } from './services/geminiService';
import { FileUploader } from './components/FileUploader';
import { PricingEditor } from './components/PricingEditor';
import { QuoteDocument } from './components/QuoteDocument';
import { FileText, Settings, FileOutput } from 'lucide-react';

const USD_TO_HKD_RATE = 7.85;

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setError(null);
    try {
      const parsedData = await parseSupplierQuote(file);
      
      // Initialize QuoteItems with default 20% margin
      const defaultMargin = 20;
      const initialQuoteItems: QuoteItem[] = parsedData.map(item => {
        // Reseller Price = Distributor Price * (1 + Margin%)
        const resellerUnitCostUsd = item.distributorUnitPrice * (1 + defaultMargin / 100);
        const totalResellerCostUsd = item.totalDistributorPrice * (1 + defaultMargin / 100);
        
        return {
          ...item,
          marginPercentage: defaultMargin,
          resellerUnitCostHkd: Math.round(resellerUnitCostUsd * USD_TO_HKD_RATE),
          totalResellerCostHkd: Math.round(totalResellerCostUsd * USD_TO_HKD_RATE)
        };
      });

      setItems(initialQuoteItems);
      setStep(AppStep.EDIT);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during parsing.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? All current data will be lost.')) {
      setItems([]);
      setStep(AppStep.UPLOAD);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Hidden on Print */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">QuoteGenius <span className="text-brand-600">Pro</span></span>
          </div>
          
          {/* Progress Steps */}
          <div className="hidden md:flex items-center space-x-8">
            <StepIndicator active={step === AppStep.UPLOAD} completed={step !== AppStep.UPLOAD} icon={<FileText className="w-4 h-4" />} label="1. Upload" />
            <div className="w-8 h-px bg-slate-300"></div>
            <StepIndicator active={step === AppStep.EDIT} completed={step === AppStep.PREVIEW} icon={<Settings className="w-4 h-4" />} label="2. Calculator" />
            <div className="w-8 h-px bg-slate-300"></div>
            <StepIndicator active={step === AppStep.PREVIEW} completed={false} icon={<FileOutput className="w-4 h-4" />} label="3. Quote" />
          </div>

          <div>
            {step !== AppStep.UPLOAD && (
              <button onClick={handleReset} className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        {step === AppStep.UPLOAD && (
          <FileUploader onUpload={handleFileUpload} isParsing={isParsing} error={error} />
        )}
        
        {step === AppStep.EDIT && (
          <PricingEditor 
            items={items} 
            onUpdateItems={setItems} 
            onNext={() => setStep(AppStep.PREVIEW)} 
          />
        )}

        {step === AppStep.PREVIEW && (
          <QuoteDocument 
            items={items} 
            onBack={() => setStep(AppStep.EDIT)} 
          />
        )}
      </main>
    </div>
  );
};

// Helper component for header steps
const StepIndicator = ({ active, completed, icon, label }: { active: boolean, completed: boolean, icon: React.ReactNode, label: string }) => {
  let colorClass = "text-slate-400";
  if (active) colorClass = "text-brand-600 font-semibold";
  if (completed) colorClass = "text-slate-800 font-medium";

  return (
    <div className={`flex items-center space-x-2 ${colorClass}`}>
      <div className={`p-1 rounded-full ${active ? 'bg-brand-100' : completed ? 'bg-slate-100' : ''}`}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default App;
