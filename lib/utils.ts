import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getAssetPath = (path: string): string => {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
};
