import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { ApiService } from '../services/api';
import type { TipoTributo, CenarioSimulacao } from '../types/tributario';

export const SimuladorTributario: React.FC = () => {
  const [tributo, setTributo] = useState<TipoTributo>('IPTU');
  const [aliquotaAtual, setAliquotaAtual] = useState<number>(1.25);
  const [aliquotaProposta, setAliquotaProposta] = useState<number>(1.5);
  const [baseCalculo, setBaseCalculo] = useState<number>(200000000); // 200 milhões de base venal
  const [cenarios, setCenarios] = useState<CenarioSimulacao[]>([]);
  const [simulando, setSimulando] = useState<boolean>(false);

  const handleSimular = async () => {
    setSimulando(true);
    try {
      const novoCenario = await ApiService.simularReajuste(
        tributo,
        aliquotaAtual,
        aliquotaProposta,
        baseCalculo
      );
      setCenarios([novoCenario, ...cenarios]);
    } catch (err: unknown) {
      console.error('Erro ao simular reajuste:', err);
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Simulador de Reajuste e Cenários Fiscais</h2>
        <p className="text-sm text-slate-500">
          Modelagem orçamentária do SITRIB (RF06 / RF07). Simule alterações de alíquotas e projete a arrecadação municipal.
        </p>
      </div>

      {/* Painel de Parâmetros de Entrada */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Definição dos Parâmetros da Simulação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Tributo</label>
            <select
              value={tributo}
              onChange={(e) => setTributo(e.target.value as TipoTributo)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="IPTU">IPTU (Imposto Predial e Territorial Urbano)</option>
              <option value="ISS">ISS (Imposto Sobre Serviços)</option>
              <option value="TAXA_LIXO">Taxa de Resíduos Sólidos</option>
              <option value="ALVARA">Taxa de Localização / Alvará</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Alíquota Atual (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                value={aliquotaAtual}
                onChange={(e) => setAliquotaAtual(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Alíquota Proposta (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0"
                value={aliquotaProposta}
                onChange={(e) => setAliquotaProposta(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Base de Cálculo Total (R$)</label>
            <input
              type="number"
              step="1000000"
              value={baseCalculo}
              onChange={(e) => setBaseCalculo(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSimular}
            disabled={simulando}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {simulando ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            Calcular Projeção
          </button>
        </div>
      </div>

      {/* Resultados e Comparador de Cenários (RF07) */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Cenários de Reajuste Analisados ({cenarios.length})</h3>

        {cenarios.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-sm">
            Nenhuma simulação gerada ainda. Ajuste as alíquotas acima e clique em &quot;Calcular Projeção&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cenarios.map((cenario) => (
              <div
                key={cenario.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cenario.nome}</h4>
                    <span className="text-xs text-slate-400 font-mono">
                      Base: {cenario.base_calculo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      cenario.diferenca >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {cenario.diferenca >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {cenario.variacao_percentual > 0 ? `+${cenario.variacao_percentual}%` : `${cenario.variacao_percentual}%`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-500 font-medium">Receita Atual ({cenario.aliquota_atual}%)</div>
                    <div className="text-base font-bold text-slate-800 mt-1">
                      {cenario.valor_atual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                    <div className="text-emerald-700 font-medium">Receita Projetada ({cenario.aliquota_proposta}%)</div>
                    <div className="text-base font-bold text-emerald-900 mt-1">
                      {cenario.valor_projetado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs flex justify-between items-center text-slate-600">
                  <span>Impacto Financeiro Líquido:</span>
                  <span className="font-bold font-mono text-sm text-slate-900">
                    {cenario.diferenca > 0 ? `+` : ''}
                    {cenario.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
