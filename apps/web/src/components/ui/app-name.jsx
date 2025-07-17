import * as React from "react"
import { cn } from "@/lib/utils"

function AppName({
  className
}) {
  const appName = import.meta.env.VITE_APP_NAME

  return (
    <div className={cn("min-w-0", className)}>
      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium truncate">
        {appName}
      </h1>
    </div>
  );
}

export { AppName }
