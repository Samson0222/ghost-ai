import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine multiple Tailwind-related class values into a single normalized class string.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.) to combine.
 * @returns The resulting class string with duplicate and conflicting Tailwind classes merged.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
