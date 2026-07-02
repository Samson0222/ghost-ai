"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@/lib/utils"

/**
 * A configurable scrollable container that composes a viewport, scrollbar, and corner.
 *
 * Merges `className` with a base container class, applies viewport sizing and focus styles, and forwards remaining props to the underlying scroll area root.
 *
 * @param className - Additional CSS class names to apply to the root container
 * @param children - Rendered content placed inside the scroll viewport
 * @param props - Additional props forwarded to `ScrollAreaPrimitive.Root`
 * @returns The composed ScrollArea React element containing a viewport, scrollbar, and corner
 */
function ScrollArea({
  className,
  children,
  viewportRef,
  ...props
}: ScrollAreaPrimitive.Root.Props & {
  viewportRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

/**
 * Renders a styled scrollbar with an internal thumb that adapts layout and sizing based on orientation.
 *
 * @param className - Additional CSS class names to apply to the scrollbar container
 * @param orientation - Scrollbar orientation, either `"vertical"` or `"horizontal"`
 * @param props - Remaining props forwarded to the underlying `ScrollAreaPrimitive.Scrollbar` component
 * @returns The rendered scrollbar element
 */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar }
