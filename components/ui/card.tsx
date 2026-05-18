import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Render a styled container used as the root of a Card UI, providing layout, spacing, and visual affordances for composed Card subcomponents.
 *
 * @param size - Controls compactness and spacing of the card. Accepts `"default"` (regular spacing) or `"sm"` (reduced spacing).
 * @returns A React `div` element configured as the Card container with `data-slot="card"` and `data-size` set to `size`.
 */
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled container for a card's header slot.
 *
 * @param className - Optional additional class names to merge with the component's default utility classes
 * @returns A `<div>` element with `data-slot="card-header"` and layout, spacing, and responsive classes applied
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a card title container with heading typography and size-aware styling.
 *
 * Applies heading font weight, base text size, and tighter line-height, and reduces the text size when the parent `Card` has `data-size="sm"`. Accepts all standard `div` props (including `className`) which are merged into the element.
 *
 * @returns The rendered card title `div` element.
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled container for a card's description.
 *
 * @returns A `div` element with `data-slot="card-description"` and muted description typography classes
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Renders a positioned wrapper for action controls within a Card.
 *
 * @param className - Additional CSS classes to merge with the component's positioning classes
 * @param props - Other HTML `div` props applied to the rendered element
 * @returns A `div` element with `data-slot="card-action"` and positioning classes that place its content in the top-right area of the card
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a container for card content with horizontal padding that adjusts when the parent card's `data-size` is `sm`, and sets `data-slot="card-content"`.
 *
 * @param className - Additional CSS classes to merge with the default padding classes.
 * @returns The rendered `div` element for the card's content slot.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

/**
 * Renders a card footer container with footer-specific layout and styling.
 *
 * @returns A `div` element with `data-slot="card-footer"` that provides a horizontal flex layout, rounded bottom corners, top border, muted background, and size-dependent padding.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
