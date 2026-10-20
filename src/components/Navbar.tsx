import React from 'react';
import {
  LayoutDashboard,
  Search,
  Calculator,
  ListOrdered,
  Building2,
  ShieldCheck,
  Coins,
  Receipt,
} from 'lucide-react';

export type AbaNavegacao =
  | 'dashboard'
  | 'busca'
  | 'simulador'
  | 'fila'
  | 'tributos'
  | 'calculo';

interface NavbarProps {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ abaAtiva, aoMudarAba }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      {/* Topo institucional */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SITRIB
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Sprint 3 Ready
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Sistema Integrado de Gestão Tributária • Município de Palmas / TO
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LGPD & TLS 1.3 Ativos</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            PO: <span className="text-emerald-400 font-semibold">Adriel Morais</span>
          </div>
        </div>
      </div>

      {/* Barra de abas de navegação */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
        <button
          onClick={() => aoMudarAba('dashboard')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            abaAtiva === 'dashboard'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Geral</span>
        </button>

        <button
          onClick={() => aoMudarAba('busca')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            abaAtiva === 'busca'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Consulta Fiscal</span>
        </button>

        <button
          onClick={() => aoMudarAba('calculo')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            abaAtiva === 'calculo'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Cálculo de Tributos (RF05)</span>
        </button>

        <button
          onClick={() => aoMudarAba('tributos')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            abaAtiva === 'tributos'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Tributos & Alíquotas (RF04)</span>
        </button>

        <button
          onClick={() => aoMudarAba('simulador')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            abaAtiva === 'simulador'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simulador & Cenários</span>
        </button>

        <button
          onClick={() => aoMudarAba('fila')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            abaAtiva === 'fila'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Fila de Cobrança (Heap)</span>
        </button>
      </nav>
    </header>
  );
};
