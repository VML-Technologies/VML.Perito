import * as React from "react"
import { cn } from "@/lib/utils"

function AppName({
  className
}) {
  const appName = import.meta.env.VITE_APP_NAME

  return (
    <div className={cn("min-w-0 max-w-full", className)}>
      <h1 className="text-base sm:text-lg font-semibold text-center leading-snug break-words text-gray-800">
        {appName}
      </h1>
    </div>
  );
}

export { AppName }
