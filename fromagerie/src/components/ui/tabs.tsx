"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "./../../lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2 w-full", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 flex justify-center">
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "bg-muted/60 text-muted-foreground inline-flex items-center justify-center rounded-full p-1.5 gap-1 w-full sm:w-fit max-w-full overflow-hidden border border-border/30 shadow-sm",
          className
        )}
        {...props}
      />
    </div>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background inline-flex items-center justify-center gap-2 rounded-full px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 flex-1 sm:flex-initial cursor-pointer data-[state=active]:shadow-md [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none w-full min-w-0", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }