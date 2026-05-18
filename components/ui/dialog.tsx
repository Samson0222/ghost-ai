"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

/**
 * Renders the dialog root container and forwards received props to the underlying dialog primitive.
 *
 * @param props - Props applied to the dialog root element
 * @returns The dialog root element with applied props
 */
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * Renders a dialog trigger element and forwards all props to the underlying primitive while adding a `data-slot="dialog-trigger"` attribute.
 *
 * @param props - Props forwarded to `DialogPrimitive.Trigger`
 * @returns The rendered trigger element
 */
function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * Wraps and renders the dialog portal element with a standardized `data-slot="dialog-portal"` attribute.
 *
 * @returns The portal element that renders dialog content into a DOM portal.
 */
function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * Renders a dialog close control that forwards all received props to the underlying primitive.
 *
 * @param props - Props forwarded to the underlying `DialogPrimitive.Close` element
 * @returns A `DialogPrimitive.Close` element with `data-slot="dialog-close"` and the forwarded props
 */
function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * Renders the dialog backdrop with default positioning, visual styling, and open/close animations.
 *
 * @param className - Additional CSS class names to merge with the component's default classes
 * @param props - Other props forwarded to the underlying backdrop primitive
 * @returns The dialog backdrop element with merged classes and forwarded props
 */
function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders dialog content inside a portal with a backdrop and an optional close control.
 *
 * @param className - Additional CSS classes merged into the content container.
 * @param children - Content rendered inside the dialog popup.
 * @param showCloseButton - When `true`, renders a close control in the top-right corner; when `false`, omits the control.
 * @param props - Additional props forwarded to the underlying dialog popup primitive.
 * @returns The dialog popup element (wrapped in a portal) including the overlay and optional close button.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-2 right-2"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

/**
 * Layout container for dialog header content that applies default vertical spacing.
 *
 * @param className - Additional CSS classes to merge with the component's default header classes
 * @returns A `div` element rendered as the dialog header container
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/**
 * Renders a dialog footer container with responsive layout, themed styling, and an optional close control.
 *
 * @param showCloseButton - If `true`, renders a `DialogPrimitive.Close` styled as an outline button labeled "Close"
 * @returns A React element representing the dialog footer
 */
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

/**
 * Renders dialog title text with default heading typography and allows additional class overrides.
 *
 * @returns The dialog title element with default heading styles and any supplied `className` merged.
 */
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a dialog description element with muted, small text and standardized link underline/hover styles.
 *
 * @returns A DialogPrimitive.Description element whose classes apply small, muted text and ensure anchor tags are underlined with proper offset and hover color; any provided `className` is merged into the element's classes.
 */
function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
