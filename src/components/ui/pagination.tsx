"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className="flex items-center" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
  disabled?: boolean
} & React.ComponentProps<typeof Button>

function PaginationLink({
  className,
  isActive,
  disabled,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size={size}
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "h-8 w-8 text-xs cursor-pointer select-none rounded-full transition-all",
        isActive && "bg-primary text-primary-foreground font-bold shadow-sm hover:bg-primary/90",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="icon"
      className={cn("h-8 w-8 rounded-full", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="icon"
      className={cn("h-8 w-8 rounded-full", className)}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next</span>
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex h-8 w-8 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}