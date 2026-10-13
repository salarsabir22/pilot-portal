import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="status" className={cn("rounded-xl border border-border bg-secondary px-4 py-3 text-sm", className)} {...props} />;
}
