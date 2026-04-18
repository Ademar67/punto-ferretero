import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge tailwind classes efficiently using clsx and tailwind-merge.
 * This is the standard pattern used in ShadCN UI components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
