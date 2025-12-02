export function formatDateForDisplay(value: any): string {
  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) return value; // not a valid date, return as-is

  // Convert to local string (YYYY-MM-DD HH:mm)
  return date.toLocaleString(); // you can customize locale or options
}

export function isDate(value: any) {
  if (typeof value === "string" && !isNaN(Date.parse(value))) {
    return true;
  }
  return false;
}
