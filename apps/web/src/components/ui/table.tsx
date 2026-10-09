"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Built from divs that behave like a table from md up (display: table / table-row / ...) and become
 * stacked, card-style rows below md - the same way the phone app lists its data. No real <table>
 * element is rendered, so a phone never gets a sideways-scrolling grid. ARIA roles keep it a table
 * for screen readers.
 */

function Table({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="table-container" className="relative w-full md:overflow-x-auto">
      <div
        role="table"
        data-slot="table"
        className={cn("w-full text-sm max-md:flex max-md:flex-col max-md:gap-2 md:table md:caption-bottom", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="rowgroup"
      data-slot="table-header"
      className={cn("max-md:hidden md:table-header-group [&_[role=row]]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="rowgroup"
      data-slot="table-body"
      className={cn("max-md:flex max-md:flex-col max-md:gap-2 md:table-row-group md:[&_[role=row]:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="rowgroup"
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium md:table-footer-group", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="row"
      data-slot="table-row"
      className={cn(
        "transition-colors has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        // phone: a card row, like the app's lists
        "max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:gap-y-1 max-md:rounded-2xl max-md:border max-md:border-border max-md:bg-card max-md:px-3.5 max-md:py-3 max-md:shadow-sm",
        // desktop: a table row
        "md:table-row md:border-b md:hover:bg-muted/50",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="columnheader"
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground md:table-cell [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="cell"
      data-slot="table-cell"
      className={cn(
        "md:table-cell md:p-2 md:align-middle md:whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        "max-md:min-w-0 max-md:first:w-full max-md:last:ml-auto max-md:[&.text-right]:ml-auto",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground md:table-caption", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
