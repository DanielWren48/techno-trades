import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Star } from "@smastrom/react-rating";
import { Product } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export function formatDate(input: string | number | Date, formatType: 'long' | 'short' | 'year-month' = 'long'): string {

  let date: Date;
  if (input instanceof Date) {
    date = input;
  } else {
    date = new Date(input);
  }

  let options: Intl.DateTimeFormatOptions;

  switch (formatType) {
    case 'long':
      options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      break;
    case 'short':
      options = {
        month: "short",
        day: "numeric",
      };
      break;
    case 'year-month':
      options = {
        year: "numeric",
        month: "long",
      };
      break;
    default:
      throw new Error('Invalid format type');
  }

  return date.toLocaleDateString("en-GB", options);
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'EUR' | 'GBP' | 'BDT'
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
) {
  const { currency = 'USD', notation = 'standard' } = options

  const numericPrice =
    typeof price === 'string' ? parseFloat(price) : price

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

export const isProductAddedWithinNDays = ({ product, nDays }: { product: Product, nDays: number }): boolean => {
  const currentDate = new Date();
  const nDaysAgo = new Date();
  nDaysAgo.setDate(currentDate.getDate() - nDays);

  const productCreatedAt = new Date(product.createdAt);
  return productCreatedAt >= nDaysAgo;
}

export const ratingStyle = {
  itemShapes: Star,
  activeFillColor: "#ffb700",
  inactiveFillColor: "#fbf1a9",
};

export function truncateText({ text, maxLength }: { text: string | undefined, maxLength: number }): string {
  if (!text) {
    return '';
  }

  const words = text.split(' ');

  if (words.length <= maxLength) {
    return text;
  }

  const truncatedWords = words.slice(0, maxLength);
  return `${truncatedWords.join(' ')}...`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function hexToRGBA(hex: string, alpha = 0.5) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}