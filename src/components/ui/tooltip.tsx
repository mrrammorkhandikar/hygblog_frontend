import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  delay?: number
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface TooltipContentProps {
  children: React.ReactNode
  className?: string
}

const TooltipContext = React.createContext<{
  isVisible: boolean
  position: { top: number; left: number }
  showTooltip: () => void
  hideTooltip: () => void
  triggerRef: React.RefObject<HTMLDivElement | null>
  side: "top" | "right" | "bottom" | "left"
} | null>(null)

const Tooltip: React.FC<TooltipProps> = ({
  children,
  side = "top",
  delay = 200
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const tooltipWidth = 200 // Estimated width
        const tooltipHeight = 40 // Estimated height

        let top = 0
        let left = 0

        switch (side) {
          case "top":
            top = rect.top - tooltipHeight - 8
            left = rect.left + rect.width / 2 - tooltipWidth / 2
            break
          case "bottom":
            top = rect.bottom + 8
            left = rect.left + rect.width / 2 - tooltipWidth / 2
            break
          case "left":
            top = rect.top + rect.height / 2 - tooltipHeight / 2
            left = rect.left - tooltipWidth - 8
            break
          case "right":
            top = rect.top + rect.height / 2 - tooltipHeight / 2
            left = rect.right + 8
            break
        }

        setPosition({ top, left })
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  return (
    <TooltipContext.Provider value={{ isVisible, position, showTooltip, hideTooltip, triggerRef, side }}>
      {children}
    </TooltipContext.Provider>
  )
}

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild = false }) => {
  const context = React.useContext(TooltipContext)
  if (!context) throw new Error("TooltipTrigger must be used within Tooltip")

  const { showTooltip, hideTooltip, triggerRef } = context

  const triggerProps = {
    ref: triggerRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
    className: "relative inline-block"
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps)
  }

  return (
    <div {...triggerProps}>
      {children}
    </div>
  )
}

const TooltipContent: React.FC<TooltipContentProps> = ({ children, className }) => {
  const context = React.useContext(TooltipContext)
  if (!context) throw new Error("TooltipContent must be used within Tooltip")

  const { isVisible, position, side } = context

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed z-50 max-w-xs rounded-md bg-black/80 px-3 py-2 text-sm text-white shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        "pointer-events-none",
        className
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -50%)"
      }}
    >
      {children}
      <div
        className="absolute w-2 h-2 bg-black/80 rotate-45"
        style={{
          top: side === "bottom" ? -4 : side === "top" ? "100%" : "50%",
          left: side === "left" ? "100%" : side === "right" ? -4 : "50%",
          transform: side === "top" || side === "bottom"
            ? "translateX(-50%) translateY(-50%)"
            : "translateX(-50%) translateY(-50%)"
        }}
      />
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent }
