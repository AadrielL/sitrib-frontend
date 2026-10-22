import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  Clock,
  Terminal,
  RefreshCw,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { LogOperacao } from '../types/tributario';

export const AuditoriaLogsView: React.FC = () => {
  const [logs, setLogs] = useState<LogOperacao[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [filtroAcao, setFiltroAcao] = useState<string>('TODAS');
  const [carregando, setCarregando] = useState<boolean>(true);

  const carregarLogs = async () => {
    setCarregando(true);
    try {
      const dados = await ApiService.listarLogs();
      setLogs(dados);
    } catch (err: unknown) {
      console.error('Falha ao carregar logs:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, []);

  const logsFiltrados = logs.filter((log) => {
    const atendeFiltro = filtroAcao === 'TODAS' || log.acao === filtroAcao;
    const termo = busca.toLowerCase();
    const atendeBusca =
      log.usuario.toLowerCase().includes(termo) ||
      log.detalhes.toLowerCase().includes(termo) ||
      log.acao.toLowerCase().includes(termo) ||
      log.ip_origem.toLowerCase().includes(termo);

    return atendeFiltro && atendeBusca;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Trilha de Auditoria e Logs de Operações (RF11 / RNF05)
          </h2>
          <p className="text-sm text-slate-500">
            Rastreabilidade completa de cálculos tributários, alterações de alíquotas e simulações com autoria e IP.
          </p>
        </div>

        <button
          onClick={carregarLogs}
          disabled={carregando}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
          Atualizar Logs
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por usuário, detalhe da ação, cálculo ou IP..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 font-medium">Ação:</span>
          <select
            value={filtroAcao}
            onChange={(e) => setFiltroAcao(e.target.value)}
            className="px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none"
          >
            <option value="TODAS">Todas as Operações</option>
            <option value="CALCULO">Cálculos Fiscais</option>
            <option value="SIMULACAO">Simulações de Reajuste</option>
            <option value="ALTERACAO_ALIQUOTA">Alterações de Alíquota</option>
            <option value="CADASTRO_TRIBUTO">Cadastros</option>
          </select>
        </div>
      </div>

      {/* Lista de Registros de Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Eventos Registrados em Ordem Cronológica</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {logsFiltrados.length} evento(s)
          </span>
        </div>

        {logsFiltrados.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Nenhum registro de auditoria encontrado para os critérios selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logsFiltrados.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        log.acao === 'ALTERACAO_ALIQUOTA'
                          ? 'bg-rose-100 text-rose-800'
                          : log.acao === 'CALCULO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.acao === 'SIMULACAO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {log.acao}
                    </span>

                    <span className="font-mono text-slate-400 text-[11px]">{log.id}</span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">{log.detalhes}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{log.usuario}</strong>
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1 font-mono">
                      <Terminal className="w-3 h-3 text-slate-400" />
                      {log.ip_origem}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono sm:text-right shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.data_hora}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
