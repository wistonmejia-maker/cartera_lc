import { useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface DropZoneProps {
    isDragging: boolean;
    file: File | null;
    error: string | null;
    isProcessing: boolean;
    periodLabel: string;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DropZone = ({
    isDragging,
    file,
    error,
    isProcessing,
    periodLabel,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileSelect,
}: DropZoneProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative cursor-pointer border-3 border-dashed rounded-[24px] p-12
                    transition-all duration-300 ease-out text-center
                    ${isDragging
                        ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-xl shadow-indigo-100'
                        : file
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-gray-200 bg-gray-50/50 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    onChange={onFileSelect}
                    className="hidden"
                />

                {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-indigo-600 font-bold">Procesando archivo...</p>
                    </div>
                ) : file ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-emerald-100 rounded-[24px] flex items-center justify-center">
                            <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500 mt-1">Listo para {periodLabel}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className={`
                            w-20 h-20 rounded-[24px] flex items-center justify-center transition-colors
                            ${isDragging ? 'bg-indigo-200' : 'bg-gray-100'}
                        `}>
                            <Upload className={`w-10 h-10 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <p className="text-lg font-black text-gray-800">
                                {isDragging ? '¡Suelta aquí!' : 'Arrastra tu archivo Excel'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                o <span className="text-indigo-600 font-bold underline">haz clic para buscar</span>
                            </p>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Solo archivos .xlsx</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
};
