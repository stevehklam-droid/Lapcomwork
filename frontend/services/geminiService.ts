import { GoogleGenAI, Type } from '@google/genai';
import { ParsedItem } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., data:application/pdf;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const parseSupplierQuote = async (file: File): Promise<ParsedItem[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey, vertexai: true });
  const base64Data = await fileToBase64(file);
  const mimeType = file.type; // e.g., 'application/pdf', 'image/png', 'image/jpeg'

  const prompt = `
    Analyze the provided quote document.
    Extract all the line items listed in the quote.
    For each item, identify and extract the following columns:
    - product: The product name or description.
    - sku: The SKU or part number.
    - term: The subscription term or duration (e.g., "1 Year", "36 Months"). If not specified, leave empty.
    - orderQty: The order quantity (number).
    - distributorUnitPrice: The Distributor Unit Price. Remove currency symbols and return as a number.
    - totalDistributorPrice: The Total Distributor Price. Remove currency symbols and return as a number.

    Return the extracted data strictly as a JSON array of objects matching the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: "List of items extracted from the quote",
          items: {
            type: Type.OBJECT,
            properties: {
              product: { type: Type.STRING, description: "Product name or description" },
              sku: { type: Type.STRING, description: "SKU or part number" },
              term: { type: Type.STRING, description: "Term or duration" },
              orderQty: { type: Type.NUMBER, description: "Order Quantity" },
              distributorUnitPrice: { type: Type.NUMBER, description: "Distributor Unit Price" },
              totalDistributorPrice: { type: Type.NUMBER, description: "Total Distributor Price" }
            },
            required: ["product", "sku", "orderQty", "distributorUnitPrice", "totalDistributorPrice"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini");
    }

    const parsedData = JSON.parse(response.text);
    
    // Add unique IDs to the parsed items
    return parsedData.map((item: any) => ({
      id: crypto.randomUUID(),
      product: item.product || 'Unknown Product',
      sku: item.sku || '',
      term: item.term || '',
      orderQty: Number(item.orderQty) || 1,
      distributorUnitPrice: Number(item.distributorUnitPrice) || 0,
      totalDistributorPrice: Number(item.totalDistributorPrice) || 0,
    }));

  } catch (error) {
    console.error("Error parsing document with Gemini:", error);
    throw new Error("Failed to parse the document. Please ensure it is a valid PDF, PNG, or JPG quote.");
  }
};
