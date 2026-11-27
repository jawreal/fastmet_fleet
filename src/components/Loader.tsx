import { cn } from "@/lib/utils";
type LoaderProps = React.ComponentProps<"span">;

export default function DataLoader({ className, ...props }: LoaderProps) {
  return (
    <span
      aria-label="Loading"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {/* Same animation on all three dots, offset by 0ms / 150ms / 300ms.
          Timeline: dot1 up -> dot2 up -> dot3 up -> repeat */}
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-2 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
