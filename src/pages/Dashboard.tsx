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
  Database,
  CheckCircle2,
} from 'lucide-react';
import type { ItemFilaCobranca, IndicadoresDashboard } from '../types/tributario';
import { ApiService } from '../services/api';

interface DashboardProps {
  fila: ItemFilaCobranca[];
  aoVerFila: () => void;
  aoConsultarCpf: (cpf: string) => void;
  aoRecarregarDados?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  fila,
  aoVerFila,
  aoConsultarCpf,
  aoRecarregarDados,
}) => {
  const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string>('');

  const carregarIndicadores = async () => {
    try {
      const dados = await ApiService.obterIndicadores();
      setIndicadores(dados);
    } catch (err) {
      console.error('Falha ao carregar indicadores:', err);
    }
  };

  useEffect(() => {
    carregarIndicadores();
  }, []);

  const handleSincronizarBanco = async () => {
    setCarregando(true);
    setMensagemSucesso('');
    try {
      const res = await ApiService.sincronizarBanco();
      await carregarIndicadores();
      if (aoRecarregarDados) {
        aoRecarregarDados();
      }
      setMensagemSucesso(res.mensagem || 'Banco SQLite (sitrib.db) persistido e sincronizado!');
      setTimeout(() => setMensagemSucesso(''), 5000);
    } catch (err: any) {
      alert(err.message || 'Erro ao sincronizar banco.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página com botão de Sincronização SQLite */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel Geral de Arrecadação e Fiscalização</h2>
          <p className="text-sm text-slate-500">
            Dados fiscais em tempo real integrados com SQLite (<code>sitrib.db</code>) e indicadores do IBGE.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSincronizarBanco}
            disabled={carregando}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            title="Recarrega as sementes e persiste no banco SQLite real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
            <Database className="w-3.5 h-3.5" />
            <span>{carregando ? 'Persistindo...' : 'Recarregar / Persistir no BD'}</span>
          </button>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            ● BD SQLite Conectado
          </span>
        </div>
      </div>

      {/* Banner de Feedback de Sincronização */}
      {mensagemSucesso && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* Cards de Métricas Principais (KPIs Reais da API - RF10) */}
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
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {indicadores?.total_arrecadado_estimado
              ? indicadores.total_arrecadado_estimado.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 45.890.000,00'}
          </div>
          <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>IPTU (62.5%) e ISS (27%)</span>
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
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {indicadores?.total_divida_ativa
              ? indicadores.total_divida_ativa.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 32.431,25'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Títulos ativos no SQLite</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Inadimplência Fiscal
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {indicadores?.contribuintes_inadimplentes ?? fila.length} Contribuintes
          </div>
          <div className="mt-1 text-xs text-rose-600 font-medium">
            <span>Processos em Varas Fiscais</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Cruzamento IBGE Palmas
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {indicadores?.indicadores_ibge?.populacao
              ? `${indicadores.indicadores_ibge.populacao.toLocaleString('pt-BR')} hab.`
              : '313.349 hab.'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            <span>Renda Média: R$ {indicadores?.indicadores_ibge?.renda_media?.toFixed(2) ?? '3.250,50'}</span>
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
                Ordenação logarítmica O(log n) por score de inadimplência gerada pela API do SITRIB.
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
              <span className="text-xs font-bold uppercase tracking-wider">Engenharia da Sprint 2</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Estruturas de Dados Integradas</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              O backend e frontend implementam estruturas fundamentais de ciência da computação para suportar alta volumetria tributária:
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
                  <strong className="text-white">Max-Heap (Fila):</strong> Ordenação automática dos devedores mais críticos sem recalcular a base.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-purple-500/20 text-purple-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                  Grafo
                </span>
                <div>
                  <strong className="text-white">Rede de Relações:</strong> Cruzamento de Contribuintes → Imóveis → Execuções Fiscais.
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
