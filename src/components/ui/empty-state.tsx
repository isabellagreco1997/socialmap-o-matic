
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center space-y-4 px-4 py-12 text-center",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-10 w-10 text-muted-foreground" />}
      {title && <h3 className="font-semibold text-lg">{title}</h3>}
      {description && (
        <p className="text-sm text-muted-foreground max-w-[250px]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
