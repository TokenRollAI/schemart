import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// 合并类名
export function cn(...inputs: ClassValue[]) {
  // 使用 tailwind-merge 合并类名
  // 使用 clsx 生成类名
  return twMerge(clsx(inputs))
}
