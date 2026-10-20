import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Receipt,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type {
  TipoTributo,
  TributoConfig,
  ResultadoCalculo,
} from '../types/tributario';

export const CalculoTributoView: React.FC = () => {
  const [tributos, setTributos] = useState<TributoConfig[]>([]);
  const [tipoTributo, setTipoTributo] = useState<TipoTributo>('IPTU');
  const [baseCalculo, setBaseCalculo] = useState<number>(350000);
  const [aliquotaPersonalizada, setAliquotaPersonalizada] = useState<number>(1.25);
  const [deducoes, setDeducoes] = useState<number>(0);
  const [isencaoPct, setIsencaoPct] = useState<number>(0);

  const [calculando, setCalculando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);

  useEffect(() => {
    ApiService.listarTributos().then((lista) => {
      setTributos(lista);
      const inicial = lista.find((t) => t.tipo === 'IPTU');
      if (inicial) {
        setAliquotaPersonalizada(inicial.aliquota_padrao);
      }
    });
  }, []);

  const handleMudarTributo = (novoTipo: TipoTributo) => {
    setTipoTributo(novoTipo);
    const encontrado = tributos.find((t) => t.tipo === novoTipo);
    if (encontrado) {
      setAliquotaPersonalizada(encontrado.aliquota_padrao);
    }
  };

  const handleCalcular = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculando(true);
    try {
      const res = await ApiService.calcularTributo({
        tipo_tributo: tipoTributo,
        base_calculo: baseCalculo,
        aliquota_personalizada: aliquotaPersonalizada,
        deducoes,
        isencao_percentual: isencaoPct,
      });
      setResultado(res);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setCalculando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Motor Oficial de Cálculo Tributário Municipal (RF05)
        </h2>
        <p className="text-sm text-slate-500">
          Aplicação direta das regras fiscais de Palmas/TO com emissão da memória detalhada de cálculo passo a passo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Entrada de Dados (Formulário) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calculator className="w-5 h-5 text-emerald-600" />
            Parâmetros do Lançamento Fiscal
          </h3>

          <form onSubmit={handleCalcular} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tributo Municipal Alvo
              </label>
              <select
                value={tipoTributo}
                onChange={(e) => handleMudarTributo(e.target.value as TipoTributo)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="IPTU">IPTU - Imposto Predial e Territorial Urbano</option>
                <option value="ISS">ISS - Imposto Sobre Serviços de Qualquer Natureza</option>
                <option value="TAXA_LIXO">Taxa de Resíduos Sólidos Domiciliares</option>
                <option value="ALVARA">Taxa de Funcionamento / Alvará</option>
                <option value="COSIP">COSIP - Iluminação Pública</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Base de Cálculo (Valor Venal / Faturamento Bruto)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  value={baseCalculo}
                  onChange={(e) => setBaseCalculo(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alíquota Aplicada (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    required
                    value={aliquotaPersonalizada}
                    onChange={(e) => setAliquotaPersonalizada(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deduções Legais (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={deducoes}
                    onChange={(e) => setDeducoes(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Isenção / Desconto Específico (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={isencaoPct}
                  onChange={(e) => setIsencaoPct(parseInt(e.target.value, 10))}
                  className="flex-1 accent-emerald-600"
                />
                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 w-12 text-center">
                  {isencaoPct}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ex: Pagamento em cota única ou incentivos de lei municipal.
              </p>
            </div>

            <button
              type="submit"
              disabled={calculando}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {calculando ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Executar Apuração Fiscal
            </button>
          </form>
        </div>

        {/* Painel de Resultados com Memória de Cálculo Passo a Passo */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Extrato e Memória de Cálculo (RF05)
          </h3>

          {!resultado ? (
            <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-slate-300" />
              <p className="font-medium text-slate-600">Aguardando execução do cálculo</p>
              <p className="text-slate-400 max-w-sm">
                Preencha a base de cálculo e alíquota ao lado para conferir a memória aritmética auditável.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
              {/* Card de Valor Final */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                    Valor Líquido Devido ao Município
                  </span>
                  <div className="text-3xl font-extrabold font-mono mt-0.5">
                    {resultado.valor_liquido_devido.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>
                  <div className="text-[11px] text-emerald-100 font-mono mt-1">
                    Protocolo: {resultado.id_calculo} • {resultado.data_execucao}
                  </div>
                </div>

                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Cards Intermediários */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Valor Bruto</div>
                  <div className="text-base font-bold text-slate-800 mt-1 font-mono">
                    {resultado.valor_bruto.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Deduções</div>
                  <div className="text-base font-bold text-slate-800 mt-1 font-mono">
                    - {resultado.deducoes_aplicadas.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-slate-500 font-medium">Isenção Fiscal</div>
                  <div className="text-base font-bold text-emerald-700 mt-1 font-mono">
                    - {resultado.isencao_aplicada.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>
                </div>
              </div>

              {/* Detalhamento Passo a Passo */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  Passo a Passo da Memória de Cálculo (Auditabilidade)
                </h4>

                <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-700">
                  {resultado.memoria_calculo.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
                <span>Conforme Código Tributário do Município de Palmas</span>
                <span className="text-emerald-700 font-semibold font-mono">
                  SITRIB • Cálculo Homologado
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
