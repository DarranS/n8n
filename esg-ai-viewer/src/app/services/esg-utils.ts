// esg-utils.ts
// Utility functions for ESG error handling and formatting

export function handleEsgError(context: string, error: any) {
  if (error && error.error) {
    try {
      const errorObj = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
      console.error(`[${context}]`, errorObj);
    } catch (parseErr) {
      console.error(`[${context}] (unparsable error):`, error.error);
    }
  } else {
    console.error(`[${context}]`, error);
  }
}

export function parseAndFormatData(data: any, formatter: (d: any) => string): string {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return formatter(parsed);
    } catch {
      return data.replace(/\n/g, '\n');
    }
  } else if (data && typeof data === 'object') {
    return formatter(data);
  }
  return '';
} 