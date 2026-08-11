import * as React from "react"
import { cn } from "./../../lib/utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: React.ReactNode
  icon?: React.ReactNode
}

export function StatCard({ title, value, icon, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col gap-2 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
        {icon && <span className="shrink-0 text-stone-500 dark:text-stone-400">{icon}</span>}
        <span className="text-sm font-medium leading-none text-stone-600 dark:text-stone-400">
          {title}
        </span>
      </div>
      <div className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
        {value}
      </div>
    </div>
  )
}