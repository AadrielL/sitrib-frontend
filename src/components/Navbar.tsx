import React from 'react';
import {
  LayoutDashboard,
  Search,
  ListOrdered,
  Scale,
  MapPin,
  FileWarning,
  Database,
  Bot,
  Calculator,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Building2,
} from 'lucide-react';
import type { UsuarioLogado } from '../types/tributario';

export type AbaNavegacao =
  | 'painel'
  | 'dossie'
  | 'fila'
  | 'multas'
  | 'macrorregioes'
  | 'capacidade'
  | 'agentes'
  | 'receitas'
  | 'simulador';

export type AreaSistema = 'AUDITORIA' | 'INTELIGENCIA' | 'TRANSPARENCIA';

export interface ItemMenu {
  id: AbaNavegacao;
  titulo: string;
  subtitulo: string;
  area: AreaSistema;
  perfis: ('administrador' | 'gestao' | 'consulta')[];
  icone: React.ReactNode;
}

export const ITENS_MENU: ItemMenu[] = [
  // ÁREA 1: AUDITORIA (Cor: Vinho #7f1d1d)
  {
    id: 'painel',
    titulo: 'Painel Geral',
    subtitulo: 'Visão Geral & Indicadores',
    area: 'AUDITORIA',
    perfis: ['administrador', 'gestao'],
    icone: <LayoutDashboard className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'fila',
    titulo: 'Fila de Cobrança',
    subtitulo: 'Priorização Inteligente de Débitos',
    area: 'AUDITORIA',
    perfis: ['administrador'],
    icone: <ListOrdered className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'multas',
    titulo: 'Revisão de Multas',
    subtitulo: 'Saneamento de Encargos & Defesa',
    area: 'AUDITORIA',
    perfis: ['administrador', 'gestao'],
    icone: <FileWarning className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'dossie',
    titulo: 'Dossiê CPF / Imóvel',
    subtitulo: 'Consulta Cadastral do Contribuinte',
    area: 'AUDITORIA',
    perfis: ['administrador', 'gestao', 'consulta'],
    icone: <Search className="w-4 h-4 shrink-0" />,
  },

  // ÁREA 2: INTELIGÊNCIA (Cor: Preto #111827)
  {
    id: 'macrorregioes',
    titulo: 'Macrorregiões Palmas',
    subtitulo: 'Mapa de Calor & Indicadores IBGE',
    area: 'INTELIGENCIA',
    perfis: ['administrador', 'gestao'],
    icone: <MapPin className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'capacidade',
    titulo: 'Capacidade & Negociação',
    subtitulo: 'Análise de Pagamento & Justiça Fiscal',
    area: 'INTELIGENCIA',
    perfis: ['administrador', 'gestao'],
    icone: <Scale className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'agentes',
    titulo: 'Assistentes Fiscais IA',
    subtitulo: 'Auditoria Especializada & Decisões',
    area: 'INTELIGENCIA',
    perfis: ['administrador', 'gestao'],
    icone: <Bot className="w-4 h-4 shrink-0" />,
  },

  // ÁREA 3: TRANSPARÊNCIA E CIDADÃO (Cor: Cinza #4b5563)
  {
    id: 'receitas',
    titulo: 'Receitas Municipais',
    subtitulo: 'Arrecadação Real & Transparência',
    area: 'TRANSPARENCIA',
    perfis: ['administrador', 'gestao', 'consulta'],
    icone: <Database className="w-4 h-4 shrink-0" />,
  },
  {
    id: 'simulador',
    titulo: 'Simulador de Reajuste',
    subtitulo: 'Projeção de Alíquotas IPTU e ISS',
    area: 'TRANSPARENCIA',
    perfis: ['administrador', 'gestao', 'consulta'],
    icone: <Calculator className="w-4 h-4 shrink-0" />,
  },
];

interface SidebarProps {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  usuario: UsuarioLogado;
  aberta: boolean;
  aoAlternar: () => void;
  aoSair: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  abaAtiva,
  aoMudarAba,
  usuario,
  aberta,
  aoAlternar,
  aoSair,
}) => {
  const perfil = usuario.perfil || 'consulta';
  const itensPermitidos = ITENS_MENU.filter((i) => i.perfis.includes(perfil));

  const getEstiloAtivo = (area: AreaSistema) => {
    if (area === 'AUDITORIA') {
      return 'bg-[#7f1d1d] text-white border-l-4 border-[#450a0a]';
    }
    if (area === 'INTELIGENCIA') {
      return 'bg-neutral-900 text-white border-l-4 border-neutral-500';
    }
    return 'bg-neutral-600 text-white border-l-4 border-neutral-800';
  };

  const renderSecao = (area: AreaSistema, rotulo: string, corDot: string) => {
    const lista = itensPermitidos.filter((i) => i.area === area);
    if (lista.length === 0) return null;

    return (
      <div className="mb-5">
        {aberta ? (
          <div className="px-3 mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <span className={`w-2 h-2 rounded-full ${corDot}`} />
            <span>{rotulo}</span>
          </div>
        ) : (
          <div className="my-2 border-t border-neutral-200" />
        )}

        <div className="space-y-1">
          {lista.map((item) => {
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => aoMudarAba(item.id)}
                title={!aberta ? `${item.titulo} — ${item.subtitulo}` : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors rounded-r-md ${
                  ativo
                    ? getEstiloAtivo(item.area)
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                {item.icone}
                {aberta && (
                  <div className="overflow-hidden">
                    <div className="font-semibold truncate">{item.titulo}</div>
                    <div
                      className={`text-[10px] truncate ${
                        ativo ? 'text-neutral-200' : 'text-neutral-400'
                      }`}
                    >
                      {item.subtitulo}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 transition-all duration-200 select-none ${
        aberta ? 'w-64' : 'w-16'
      }`}
    >
      {/* Topo da Sidebar */}
      <div>
        <div className="h-16 px-3 border-b border-neutral-200 flex items-center justify-between">
          {aberta && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded bg-[#7f1d1d] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-neutral-900">
                  SITRIB PALMAS
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  SEFIN • Sistema Fazendário Oficial
                </div>
              </div>
            </div>
          )}

          <button
            onClick={aoAlternar}
            title={aberta ? 'Recolher menu lateral' : 'Expandir menu lateral'}
            className="p-2 rounded text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 mx-auto"
          >
            {aberta ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>

        {/* Botão de Atalho Rápido para Voltar ao Login */}
        <div className="px-3 pt-2">
          {aberta ? (
            <button
              onClick={aoSair}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-red-50 hover:text-red-700 border border-neutral-200 hover:border-red-200 transition-colors shadow-sm cursor-pointer"
              title="Voltar à tela de Login / Trocar Perfil"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Voltar ao Login</span>
            </button>
          ) : (
            <button
              onClick={aoSair}
              className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-700 bg-neutral-100 hover:bg-red-50 hover:text-red-700 border border-neutral-200 hover:border-red-200 transition-colors cursor-pointer"
              title="Voltar ao Login"
            >
              <LogOut className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>

        {/* Navegação categorizada por cor/área */}
        <nav className="p-2 mt-2">
          {renderSecao('AUDITORIA', 'Auditoria (Vinho)', 'bg-[#7f1d1d]')}
          {renderSecao('INTELIGENCIA', 'Inteligência (Preto)', 'bg-neutral-900')}
          {renderSecao('TRANSPARENCIA', 'Transparência & Cidadão', 'bg-neutral-500')}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Perfil e Sair */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50">
        {aberta ? (
          <div className="space-y-2">
            <div className="px-2 py-1.5 bg-white border border-neutral-200 rounded">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#7f1d1d]">
                Perfil: {perfil === 'administrador' ? 'Auditor Fiscal' : perfil === 'gestao' ? 'Gestor' : 'Cidadão'}
              </div>
              <div className="text-xs font-semibold text-neutral-900 truncate">{usuario.nome}</div>
              {usuario.cpf && (
                <div className="text-[11px] font-mono text-neutral-500">{usuario.cpf}</div>
              )}
            </div>
            <button
              onClick={aoSair}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-semibold text-neutral-700 hover:text-white bg-neutral-200 hover:bg-[#7f1d1d] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        ) : (
          <button
            onClick={aoSair}
            title="Encerrar Sessão"
            className="w-full flex items-center justify-center p-2 rounded text-neutral-600 hover:text-white hover:bg-[#7f1d1d] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
