import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  if (!dateString) return 'No date';
  if (!dateString.includes('-')) return dateString;
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}
