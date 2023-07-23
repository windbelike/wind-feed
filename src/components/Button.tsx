import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react"

export type ButtonProps = {
  gray?: boolean
  small?: boolean
  className?: string
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export function Button({ gray = false, small = false, className = "", ...props }
  : ButtonProps) {
  const sizeClasses = small ? 'px-2 py-1' : 'px-4 py-2 font-bold'
  const corlorClasses = gray
    ? 'bg-gray-400 hover:bg-gray-300'
    : 'bg-blue-500 hover:bg-blue-400'

  return <button className={`rounded-full text-white transition-colors
  duration-200 disabled:cursor-not-allowed disabled:opacity-50
  ${sizeClasses} ${corlorClasses} ${className}`} {...props}></button>
}
