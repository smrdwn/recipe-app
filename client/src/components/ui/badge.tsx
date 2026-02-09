import * as React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--border)] bg-sand/60 px-3 py-1 text-xs font-medium text-ink",
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";

export { Badge };
