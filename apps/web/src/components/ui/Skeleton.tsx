import { cn } from "../../utils/cn"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "circular" | "rectangular" | "card";
    width?: string | number;
    height?: string | number;
}

function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    ...props
}: SkeletonProps) {
    const variants = {
        text: "h-4 w-full rounded-md",
        circular: "rounded-full",
        rectangular: "rounded-xl",
        card: "rounded-2xl h-32",
    };

    return (
        <div
            className={cn(
                "animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]",
                variants[variant],
                className
            )}
            style={{ width, height }}
            {...props}
        />
    );
}

// Pre-built skeleton patterns for common use cases
function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-1/2 h-3" />
                </div>
            </div>
            <Skeleton variant="rectangular" className="h-20" />
            <div className="flex gap-2">
                <Skeleton variant="rectangular" className="h-8 w-20" />
                <Skeleton variant="rectangular" className="h-8 w-24" />
            </div>
        </div>
    );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <Skeleton variant="text" className="w-48" />
            </div>
            <div className="divide-y divide-gray-50">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton variant="rectangular" className="w-16 h-8" />
                        <Skeleton variant="text" className="flex-1" />
                        <Skeleton variant="rectangular" className="w-24 h-6" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function SkeletonList({ items = 3 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                    <Skeleton variant="circular" className="w-10 h-10" />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-2/3" />
                        <Skeleton variant="text" className="w-1/3 h-3" />
                    </div>
                    <Skeleton variant="rectangular" className="w-16 h-8" />
                </div>
            ))}
        </div>
    );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonList };
