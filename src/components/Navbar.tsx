import React from 'react';
import {
  LayoutDashboard,
  Search,
  Calculator,
  ListOrdered,
  Building2,
  ShieldCheck,
  BrainCircuit,
  LogOut,
  User,
  Shield,
  BarChart3,
} from 'lucide-react';
import type { UsuarioLogado } from '../types/tributario';

export type AbaNavegacao = 'dashboard' | 'busca' | 'simulador' | 'fila' | 'predicao';

interface NavbarProps {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  usuario: UsuarioLogado | null;
  aoSair: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ abaAtiva, aoMudarAba, usuario, aoSair }) => {
  const perfil = usuario?.perfil || 'administrador';

  const getPerfilBadge = () => {
    if (perfil === 'administrador') {
      return (
        <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
          <Shield className="w-3.5 h-3.5" /> Auditor Fiscal
        </span>
      );
    }
    if (perfil === 'gestao') {
      return (
        <span className="flex items-center gap-1 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full font-medium">
          <BarChart3 className="w-3.5 h-3.5" /> Gestor Tributário
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-full font-medium">
        <User className="w-3.5 h-3.5" /> Contribuinte
      </span>
    );
  };

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      {/* Topo institucional */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SITRIB
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Sprint 4
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Sistema Integrado de Gestão Tributária • Município de Palmas / TO
            </p>
          </div>
        </div>

        {/* Informações do Usuário e Logout */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            {getPerfilBadge()}
            <span className="text-xs text-slate-200 font-medium max-w-[160px] truncate">
              {usuario?.nome || 'Usuário'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LGPD Ativa</span>
          </div>

          <button
            onClick={aoSair}
            title="Sair do sistema"
            className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 px-3 py-1.5 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Barra de abas de navegação filtrada por perfil */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-3 overflow-x-auto py-2">
        {/* Dashboard (Auditor e Gestão) */}
        {(perfil === 'administrador' || perfil === 'gestao') && (
          <button
            onClick={() => aoMudarAba('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              abaAtiva === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Geral</span>
          </button>
        )}

        {/* Busca Fiscal */}
        <button
          onClick={() => aoMudarAba('busca')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            abaAtiva === 'busca'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{perfil === 'consulta' ? 'Meus Débitos (CPF)' : 'Consulta Fiscal Geral'}</span>
        </button>

        {/* Fila de Cobrança (Apenas Auditor) */}
        {perfil === 'administrador' && (
          <button
            onClick={() => aoMudarAba('fila')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              abaAtiva === 'fila'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Fila de Devedores (Heap)</span>
          </button>
        )}

        {/* Predição Machine Learning (Auditor e Gestão) */}
        {(perfil === 'administrador' || perfil === 'gestao') && (
          <button
            onClick={() => aoMudarAba('predicao')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              abaAtiva === 'predicao'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Inteligência & ML (Sprint 4)</span>
          </button>
        )}

        {/* Simulador de Tributos */}
        <button
          onClick={() => aoMudarAba('simulador')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
            abaAtiva === 'simulador'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{perfil === 'consulta' ? 'Simulador Próprio' : 'Simulador de Alíquotas'}</span>
        </button>
      </nav>
    </header>
  );
};
