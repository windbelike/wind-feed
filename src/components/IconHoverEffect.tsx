import type { ReactNode } from "react"

type IconHoverEffectProps = {
  children: ReactNode
  red?: boolean
}

export default function IconHoverEffect({ children, red = false }:
  IconHoverEffectProps
) {

  const colorClasses = red 
  ? "hover:bg-red-200"
  : "hover:bg-gray-200"

  return (
    <div className={`rounded-full transition-colors duration-200 p-2  ${colorClasses}`}>
      {children}
    </div>
  )

}
