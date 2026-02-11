// utils/formatter.ts
export const dbFieldToLabel = (str: string): string => {
  return String(str)
    .replace(/(_id|Id)$/, '')             // Strip ID suffixes
    .replace(/[_-]/g, ' ')                // Convert underscores/hyphens to spaces
    .replace(/([A-Z])/g, ' $1')           // Split CamelCase
    .replace(/^./, s => s.toUpperCase())  // Capitalize first letter
    .replace(/\s+/g, ' ')                 // Collapse double spaces
    .trim()
}