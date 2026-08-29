/**
 * Formats a numeric value into Indian Rupee currency format (₹).
 * Example: 1999 -> "₹1,999", 105000 -> "₹1,05,000"
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const num = Math.round(Number(amount));
  return '₹' + num.toLocaleString('en-IN');
}
