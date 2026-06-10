import React, { useState } from 'react';
import { QuoteItem, ParsedItem } from '../types';
import { Settings, ArrowRight, DollarSign, Calculator } from 'lucide-react';

interface PricingEditorProps {
  items: QuoteItem[];
  onUpdateItems: (items: QuoteItem[]) => void;
  onNext: () => void;
}

const USD_TO_HKD_RATE = 7.85;

export const PricingEditor: React.FC<PricingEditorProps> = ({ items, onUpdateItems, onNext }) => {
  const [globalMargin, setGlobalMargin] = useState<number>(20);

  const calculateItem = (item: ParsedItem, margin: number): QuoteItem => {
    // Reseller Price = Distributor Price * (1 + Margin%)
    const resellerUnitCostUsd = item.distributorUnitPrice * (1 + margin / 100);
    const totalResellerCostUsd = item.totalDistributorPrice * (1 + margin / 100);
    
    // Convert to HKD and round to nearest integer
    const resellerUnitCostHkd = Math.round(resellerUnitCostUsd * USD_TO_HKD_RATE);
    const totalResellerCostHkd = Math.round(totalResellerCostUsd * USD_TO_HKD_RATE);

    return {
      ...item,
      marginPercentage: margin,
      resellerUnitCostHkd,
      totalResellerCostHkd
    };
  };

  const handleGlobalMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMargin = parseFloat(e.target.value) || 0;
    setGlobalMargin(newMargin);
    const updatedItems = items.map(item => calculateItem(item, newMargin));
    onUpdateItems(updatedItems);
  };

  const handleItemMarginChange = (id: string, newMargin: number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        return calculateItem(item, newMargin);
      }
      return item;
    });
    onUpdateItems(updatedItems);
  };

  const totalDistributorUsd = items.reduce((sum, item) => sum + item.totalDistributorPrice, 0);
  const totalResellerHkd = items.reduce((sum, item) => sum + item.totalResellerCostHkd, 0);

  return (
    <div className="w-full max-w-[95%] mx-auto mt-8 pb-20">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Verification & Margin Calculator</h2>
          <p className="text-slate-500">Verify extracted Distributor Prices, apply margins, and calculate HKD reseller costs.</p>
        </div>
        <button
          onClick={onNext}
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <span>Generate Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Global Settings & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 text-slate-600 mb-3">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Global Margin</h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={globalMargin}
              onChange={handleGlobalMarginChange}
              className="w-24 text-2xl font-bold text-slate-800 border-b-2 border-slate-300 focus:border-brand-500 focus:outline-none pb-1"
            />
            <span className="text-xl text-slate-500">%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Markup applied to Distributor Price</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 text-slate-600 mb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Total Distributor Price (USD)</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">${totalDistributorUsd.toFixed(2)}</p>
          <p className="text-xs text-slate-400 mt-2">Extracted from document</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-green-50/30">
          <div className="flex items-center space-x-2 text-slate-600 mb-3">
            <Calculator className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Total Reseller (HKD)</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">HK${totalResellerHkd.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Rate: 7.85 (Rounded)</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 whitespace-nowrap">
                <th className="p-3 font-semibold">Product</th>
                <th className="p-3 font-semibold">SKU</th>
                <th className="p-3 font-semibold">Term</th>
                <th className="p-3 font-semibold text-right">Order Qty</th>
                <th className="p-3 font-semibold text-right bg-blue-50/30">Distributor Unit Price<br/><span className="text-xs font-normal">(USD)</span></th>
                <th className="p-3 font-semibold text-right bg-blue-50/30">Total Distributor Price<br/><span className="text-xs font-normal">(USD)</span></th>
                <th className="p-3 font-semibold text-center bg-slate-100/50">Margin %</th>
                <th className="p-3 font-semibold text-right bg-green-50/50 text-green-800">Reseller Unit Cost<br/><span className="text-xs font-normal">(HKD)</span></th>
                <th className="p-3 font-semibold text-right bg-green-50/50 text-green-800">Total Reseller Cost<br/><span className="text-xs font-normal">(HKD)</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-slate-800 min-w-[200px] max-w-[300px] truncate" title={item.product}>
                      {item.product}
                    </div>
                  </td>
                  <td className="p-3 text-slate-600 whitespace-nowrap">{item.sku}</td>
                  <td className="p-3 text-slate-600 whitespace-nowrap">{item.term}</td>
                  <td className="p-3 text-right font-medium text-slate-700">{item.orderQty}</td>
                  
                  <td className="p-3 text-right font-medium text-blue-800 bg-blue-50/10 font-mono">
                    ${item.distributorUnitPrice.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-medium text-blue-800 bg-blue-50/10 font-mono">
                    ${item.totalDistributorPrice.toFixed(2)}
                  </td>
                  
                  <td className="p-3 text-center bg-slate-50/30">
                    <div className="inline-flex items-center border border-slate-300 rounded-md overflow-hidden bg-white focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
                      <input
                        type="number"
                        value={item.marginPercentage}
                        onChange={(e) => handleItemMarginChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-14 p-1 text-center text-sm focus:outline-none"
                      />
                      <span className="bg-slate-100 px-1.5 py-1 text-slate-500 text-xs border-l border-slate-300">%</span>
                    </div>
                  </td>
                  
                  <td className="p-3 text-right font-bold text-green-700 bg-green-50/20 font-mono text-base">
                    HK${item.resellerUnitCostHkd.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-bold text-green-700 bg-green-50/20 font-mono text-base">
                    HK${item.totalResellerCostHkd.toLocaleString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No items found. Please try uploading the document again.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
