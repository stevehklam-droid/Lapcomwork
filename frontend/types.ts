export interface ParsedItem {
  id: string;
  product: string;
  sku: string;
  term: string;
  orderQty: number;
  distributorUnitPrice: number;
  totalDistributorPrice: number;
}

export interface QuoteItem extends ParsedItem {
  marginPercentage: number;
  resellerUnitCostHkd: number;
  totalResellerCostHkd: number;
}

export interface QuoteDetails {
  date: string;
  validityDays: number;
  companyName: string;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  EDIT = 'EDIT',
  PREVIEW = 'PREVIEW'
}
