import * as React from "react"
import { cn } from "@/lib/utils"

function AppName({
  className
}) {
  const appName = import.meta.env.VITE_APP_NAME

  return (
    <div>
      <h1 className="text-3xl font-medium">{appName}</h1>
    </div>
  );
}

export { AppName }
