import { cn } from "../../utils/cn";
import { FileX, Inbox, Search, Upload, AlertCircle, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: "default" | "compact" | "centered";
    className?: string;
}

const PRESET_ICONS: Record<string, LucideIcon> = {
    empty: Inbox,
    noResults: Search,
    noFile: FileX,
    upload: Upload,
    error: AlertCircle,
};

export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    variant = "default",
    className,
}: EmptyStateProps) {
    const variants = {
        default: "py-16 px-8",
        compact: "py-8 px-4",
        centered: "py-24 px-8",
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center",
                variants[variant],
                className
            )}
        >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}

// Pre-built empty state patterns
export function NoDataEmptyState({ onAction }: { onAction?: () => void }) {
    return (
        <EmptyState
            icon={Inbox}
            title="No hay datos disponibles"
            description="Carga un reporte de cartera para comenzar a gestionar los cobros."
            action={onAction ? { label: "Cargar Reporte", onClick: onAction } : undefined}
        />
    );
}

export function NoSearchResultsEmptyState({ searchTerm }: { searchTerm: string }) {
    return (
        <EmptyState
            icon={Search}
            title="Sin resultados"
            description={`No se encontraron coincidencias para "${searchTerm}". Intenta con otro término.`}
            variant="compact"
        />
    );
}

export function NoLettersEmptyState() {
    return (
        <EmptyState
            icon={FileX}
            title="Selecciona un deudor"
            description="Haz clic en un elemento de la lista para ver la vista previa de la carta."
            variant="compact"
        />
    );
}
