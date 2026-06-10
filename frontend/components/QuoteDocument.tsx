import React, { useState } from 'react';
import { QuoteItem, QuoteDetails } from '../types';
import { Printer, ArrowLeft, Edit3 } from 'lucide-react';

interface QuoteDocumentProps {
  items: QuoteItem[];
  onBack: () => void;
}

export const QuoteDocument: React.FC<QuoteDocumentProps> = ({ items, onBack }) => {
  const [details, setDetails] = useState<QuoteDetails>({
    date: new Date().toISOString().split('T')[0],
    validityDays: 30,
    companyName: 'Lapcom Limited'
  });

  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const totalAmountHkd = items.reduce((sum, item) => sum + item.totalResellerCostHkd, 0);

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 pb-20">
      {/* Controls - Hidden on Print */}
      <div className="no-print flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-slate-900 flex items-center space-x-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calculator</span>
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsEditingDetails(!isEditingDetails)}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditingDetails ? 'Done Editing' : 'Edit Details'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Details Editor - Hidden on Print */}
      {isEditingDetails && (
        <div className="no-print mb-8 bg-white p-6 rounded-xl shadow-sm border border-brand-200 bg-brand-50/30">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quote Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={details.companyName}
                onChange={e => setDetails({...details, companyName: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={details.date}
                onChange={e => setDetails({...details, date: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Validity (Days)</label>
              <input
                type="number"
                value={details.validityDays}
                onChange={e => setDetails({...details, validityDays: parseInt(e.target.value) || 0})}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* The Printable Document */}
      <div className="bg-white p-10 md:p-16 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{details.companyName}</h1>
            <p className="text-slate-500 mt-1 font-medium">Authorized Distributor</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-light text-slate-300 uppercase tracking-wider mb-4">Quotation</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-slate-500 font-medium">Date:</span>
              <span className="text-slate-900">{details.date}</span>
              
              <span className="text-slate-500 font-medium">Valid Until:</span>
              <span className="text-slate-900">
                {new Date(new Date(details.date).getTime() + details.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full text-left mb-10">
          <thead>
            <tr className="border-b-2 border-slate-200 text-sm uppercase tracking-wider text-slate-500">
              <th className="py-3 font-semibold">Product</th>
              <th className="py-3 font-semibold">SKU</th>
              <th className="py-3 font-semibold">Term</th>
              <th className="py-3 font-semibold text-center w-20">Qty</th>
              <th className="py-3 font-semibold text-right w-36">Reseller Unit Cost</th>
              <th className="py-3 font-semibold text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-4 pr-4">
                  <div className="font-semibold text-slate-800">{item.product}</div>
                </td>
                <td className="py-4 text-slate-600 text-sm">{item.sku}</td>
                <td className="py-4 text-slate-600 text-sm">{item.term}</td>
                <td className="py-4 text-center text-slate-700">{item.orderQty}</td>
                <td className="py-4 text-right text-slate-700">HK${item.resellerUnitCostHkd.toLocaleString()}</td>
                <td className="py-4 text-right font-semibold text-slate-900">HK${item.totalResellerCostHkd.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end border-t-2 border-slate-200 pt-6">
          <div className="w-72">
            <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-2">
              <span>Total (HKD)</span>
              <span>HK${totalAmountHkd.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-500 text-center">
          <p>Thank you for your business.</p>
          <p className="mt-1">This quote is valid for {details.validityDays} days from the date of issue.</p>
          <p className="mt-1 text-xs text-slate-400">All prices are in Hong Kong Dollars (HKD).</p>
        </div>

      </div>
    </div>
  );
};
