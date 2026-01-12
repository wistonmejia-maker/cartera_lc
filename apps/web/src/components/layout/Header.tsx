import { Bell, Search } from 'lucide-react';

export const Header = () => {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 px-6 flex items-center justify-between ml-0 md:ml-64 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="relative hidden lg:block">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar unidad, residente..."
                        className="pl-9 pr-4 py-2 bg-gray-100/50 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all outline-none text-gray-700 placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="relative p-2 ml-auto text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>

                <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        WM
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium text-gray-700">Wiston Mejia</p>
                        <p className="text-xs text-gray-400">Administrador</p>
                    </div>
                </button>
            </div>
        </header>
    );
};
