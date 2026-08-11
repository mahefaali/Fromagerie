import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "./../../lib/utils"

export interface SearchInputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode
}

function SearchInput({ className, icon = <Search className="size-4" />, ...props }: SearchInputProps) {
  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-3.5 text-stone-400 pointer-events-none flex items-center justify-center">
        {icon}
      </div>
      <input
        type="search"
        data-slot="search-input"
        className={cn(
          "file:text-foreground placeholder:text-stone-400 border-stone-200/80 flex h-11 w-full min-w-0 rounded-2xl border bg-white dark:bg-stone-900 px-3.5 py-2 pl-10 text-base shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { SearchInput }