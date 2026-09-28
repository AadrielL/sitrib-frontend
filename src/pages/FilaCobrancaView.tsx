import React from 'react';
import { ListOrdered, ShieldAlert, Cpu } from 'lucide-react';
import type { ItemFilaCobranca } from '../types/tributario';

interface FilaCobrancaViewProps {
  fila: ItemFilaCobranca[];
  aoConsultarCpf: (cpf: string) => void;
}

export const FilaCobrancaView: React.FC<FilaCobrancaViewProps> = ({ fila, aoConsultarCpf }) => {
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fila de Prioridade de Cobrança Fiscal</h2>
          <p className="text-sm text-slate-500">
            Algoritmo Max-Heap (Sprint 2 - <code>src/fila_cobranca.py</code>) ordenando automaticamente os casos mais críticos.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Complexidade: O(log n) Heap Binário</span>
        </div>
      </div>

      {/* Explicação da Estrutura */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs text-slate-600 flex items-start gap-4">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
          <ListOrdered className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-1">Como a Fila de Cobrança Opera</h4>
          <p className="leading-relaxed">
            A estrutura armazena tuplas ordenadas pelo score de inadimplência (calculado com base no valor da dívida, tempo de atraso e existência de processos judiciais). O contribuinte com maior severidade sempre ocupa o topo da fila (raiz do heap), permitindo à equipe fazendária disparar cobranças imediatas sem necessidade de ordenar toda a base cadastral a cada consulta.
          </p>
        </div>
      </div>

      {/* Listagem Completa da Fila */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Ranking de Criticidade ({fila.length} Contribuintes Priorizados)
          </span>
          <span className="text-xs text-slate-400">
            Ordem decrescente de Score
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {fila.map((item, index) => (
            <div
              key={item.cpf_cnpj}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm font-mono shrink-0">
                  #{index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.nome}</span>
                    {item.tem_processo_judicial && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Execução Ajuizada
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {item.cpf_cnpj} • {item.quantidade_debitos} débito(s) registrado(s)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">Valor Devido</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="w-24 text-right">
                  <div className="text-xs text-slate-400 font-medium">Score</div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.score >= 80 ? 'bg-rose-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-700">{item.score}</span>
                  </div>
                </div>

                <button
                  onClick={() => aoConsultarCpf(item.cpf_cnpj)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Abrir Dossiê
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
