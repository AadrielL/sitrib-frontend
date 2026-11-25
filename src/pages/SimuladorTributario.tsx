import React, { useState } from 'react';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { ApiService } from '../services/api';
import type { TipoTributo, CenarioSimulacao } from '../types/tributario';

export const SimuladorTributario: React.FC = () => {
  const [tributo, setTributo] = useState<TipoTributo>('IPTU');
  const [aliquotaAtual, setAliquotaAtual] = useState<number>(1.25);
  const [aliquotaProposta, setAliquotaProposta] = useState<number>(1.5);
  const [baseCalculo, setBaseCalculo] = useState<number>(200000000);
  const [cenarios, setCenarios] = useState<CenarioSimulacao[]>([]);
  const [simulando, setSimulando] = useState(false);

  const handleSimular = async () => {
    setSimulando(true);
    try {
      const novoCenario = await ApiService.simularReajuste(
        tributo,
        aliquotaAtual,
        aliquotaProposta,
        baseCalculo
      );
      setCenarios((prev) => [novoCenario, ...prev]);
    } catch (err) {
      console.error('Falha ao simular reajuste:', err);
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            Transparência Fiscal & Planejamento Tributário
          </span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Simulador de Reajuste & Cenários Fiscais</h1>
        <p className="text-sm text-neutral-600">
          Projeção orçamentária do impacto de alterações de alíquotas (IPTU, ISS, Taxas) sobre a arrecadação do Município de Palmas.
        </p>
      </div>

      {/* Parâmetros da Simulação */}
      <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
        <h2 className="text-base font-bold text-neutral-900">Parâmetros da Modelagem</h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Tipo de Tributo</label>
            <select
              value={tributo}
              onChange={(e) => setTributo(e.target.value as TipoTributo)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-neutral-800"
            >
              <option value="IPTU">IPTU (Predial e Territorial)</option>
              <option value="ISS">ISS (Serviços)</option>
              <option value="TAXA_LIXO">Taxa de Resíduos Sólidos</option>
              <option value="ALVARA">Taxa de Localização / Alvará</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Alíquota Atual (%)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              value={aliquotaAtual}
              onChange={(e) => setAliquotaAtual(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Alíquota Proposta (%)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              value={aliquotaProposta}
              onChange={(e) => setAliquotaProposta(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Base de Cálculo Total (R$)</label>
            <input
              type="number"
              step="1000000"
              value={baseCalculo}
              onChange={(e) => setBaseCalculo(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSimular}
            disabled={simulando}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{simulando ? 'Calculando impacto...' : 'Simular Projeção de Arrecadação'}</span>
          </button>
        </div>
      </div>

      {/* Histórico de Cenários Simulados */}
      <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h2 className="text-base font-bold text-neutral-900">Cenários Fiscais Projetados</h2>
          <span className="text-xs text-neutral-500 font-mono">
            {cenarios.length} simulação(ões) nesta sessão
          </span>
        </div>

        {cenarios.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Nenhuma simulação realizada ainda. Ajuste as alíquotas acima e clique em &quot;Simular Projeção&quot;.
          </div>
        ) : (
          <div className="space-y-3">
            {cenarios.map((cenario) => {
              const diferencaPositiva = cenario.diferenca >= 0;
              return (
                <div
                  key={cenario.id}
                  className="border border-neutral-200 rounded p-4 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">{cenario.tributo}</span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {cenario.aliquota_atual}% &rarr; {cenario.aliquota_proposta}%
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600">
                      Base Tributável:{' '}
                      <strong className="font-mono text-neutral-800">
                        R$ {cenario.base_calculo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-neutral-400 font-bold">Arrecadação Atual</div>
                      <div className="text-xs font-mono font-medium text-neutral-700">
                        R$ {cenario.valor_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase text-neutral-400 font-bold">Projeção Nova</div>
                      <div className="text-xs font-mono font-bold text-neutral-900">
                        R$ {cenario.valor_projetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="text-right pl-4 border-l border-neutral-200">
                      <div className="text-[10px] uppercase text-neutral-400 font-bold">Impacto Orçamentário</div>
                      <div className="text-sm font-mono font-bold text-neutral-900 flex items-center justify-end gap-1">
                        {diferencaPositiva ? (
                          <TrendingUp className="w-3.5 h-3.5 text-neutral-900" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-neutral-600" />
                        )}
                        <span>
                          {diferencaPositiva ? '+' : ''}
                          R$ {cenario.diferenca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        ({diferencaPositiva ? '+' : ''}
                        {cenario.variacao_percentual.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
