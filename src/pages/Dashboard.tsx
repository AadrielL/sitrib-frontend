import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  AlertTriangle,
  Scale,
  Users,
  TrendingUp,
  Cpu,
  ArrowRight,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { ItemFilaCobranca, IndicadoresDashboard } from '../types/tributario';

interface DashboardProps {
  fila: ItemFilaCobranca[];
  aoVerFila: () => void;
  aoConsultarCpf: (cpf: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ fila, aoVerFila, aoConsultarCpf }) => {
  const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null);
  const [sincronizando, setSincronizando] = useState<boolean>(false);
  const [mensagemSinc, setMensagemSinc] = useState<string | null>(null);

  const carregarIndicadores = async () => {
    try {
      const dados = await ApiService.obterIndicadoresDashboard();
      setIndicadores(dados);
    } catch (err: unknown) {
      console.error('Erro ao carregar indicadores:', err);
    }
  };

  useEffect(() => {
    carregarIndicadores();
  }, []);

  const handleSincronizarETL = async () => {
    setSincronizando(true);
    setMensagemSinc(null);
    try {
      const res = await ApiService.sincronizarETL();
      setMensagemSinc(res.mensagem);
      await carregarIndicadores();
      setTimeout(() => setMensagemSinc(null), 3500);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel Geral de Arrecadação e Fiscalização</h2>
          <p className="text-sm text-slate-500">
            Visão consolidada de tributos municipais, dívida ativa e inteligência de cobrança de Palmas / TO.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSincronizarETL}
            disabled={sincronizando}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${sincronizando ? 'animate-spin' : ''}`} />
            Sincronizar Dados (ETL)
          </button>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            Base Ativa: Exercício 2026
          </span>
        </div>
      </div>

      {mensagemSinc && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensagemSinc}</span>
        </div>
      )}

      {/* Cards de Métricas Principais (KPIs - RF10) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Arrecadação Estimada
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {(indicadores?.total_arrecadado_estimado ?? 45890000).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
          <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Estimativa auditada com base na PGV</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dívida Ativa Registrada
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {(indicadores?.total_divida_ativa ?? 32431.25).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Débitos ativos e ajuizados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inadimplentes Ativos
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {(indicadores?.contribuintes_inadimplentes ?? 3)} Contribuintes
          </div>
          <div className="mt-1 text-xs text-rose-600 font-medium">
            <span>Priorizados no Max-Heap de cobrança</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dados IBGE Palmas / TO
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {(indicadores?.indicadores_ibge?.populacao ?? 313349).toLocaleString('pt-BR')} hab.
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Renda média: R$ {(indicadores?.indicadores_ibge?.renda_media ?? 3250.5).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Grid Central: Fila de Cobrança (Heap) + Arquitetura de Estruturas de Dados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Top Prioridade de Cobrança (Max-Heap) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Fila Prioritária de Cobrança (Max-Heap)
              </h3>
              <p className="text-xs text-slate-500">
                Ordenação logarítmica O(log n) por score de inadimplência e valor devido.
              </p>
            </div>
            <button
              onClick={aoVerFila}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Ver fila completa
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Score Risco</th>
                  <th className="px-4 py-3">Contribuinte</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Débito Total</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fila.slice(0, 4).map((item) => (
                  <tr key={item.cpf_cnpj} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          item.score >= 80
                            ? 'bg-rose-100 text-rose-800'
                            : item.score >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.score} pts
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.nome}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.cpf_cnpj}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.valor_total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => aoConsultarCpf(item.cpf_cnpj)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold hover:underline"
                      >
                        Consultar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card Lateral: Tecnologias e Estruturas da Sprint 2 */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Cpu className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Engenharia do SITRIB</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Estruturas de Dados Integradas</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              O backend em Python e o frontend em React consomem estruturas fundamentais para alta volumetria:
            </p>

            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                  O(1)
                </span>
                <div>
                  <strong className="text-white">Tabela Hash:</strong> Indexação direta e instantânea de débitos fiscais por CPF/CNPJ.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500/20 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                  O(log n)
                </span>
                <div>
                  <strong className="text-white">Max-Heap (Fila):</strong> Ordenação automática dos devedores mais críticos por score.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-500/20 text-purple-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                  Grafo
                </span>
                <div>
                  <strong className="text-white">Rede de Relações:</strong> Cruzamento Contribuintes → Imóveis → Processos Judiciais.
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700 text-center">
            <span className="text-[11px] text-slate-400">
              Projeto Integrador UFT • Ciência da Computação
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
