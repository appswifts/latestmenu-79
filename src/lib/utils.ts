import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency consistently across the application
 * @param price - Price in the smallest currency unit (cents for USD, RWF for Rwanda)
 * @param currency - Currency code (default: "RWF") 
 * @param fromCents - Whether the price is in cents and needs to be divided by 100 (default: false for RWF)
 */
export function formatCurrency(price: number, currency: string = "RWF", fromCents: boolean = false): string {
  // For RWF, we store values as whole numbers, not cents
  // For USD and other currencies, we store as cents
  const actualPrice = fromCents ? price / 100 : price;
  return `${Math.round(actualPrice).toLocaleString()} ${currency}`;
}
