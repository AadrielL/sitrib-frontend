import React, { useState } from 'react';
import { BrainCircuit, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Building, DollarSign, Calendar } from 'lucide-react';
import { ApiService } from '../services/api';
import type { PredicaoInadimplenciaResponse } from '../types/tributario';

export const PredicaoMLView: React.FC = () => {
  const [valorDebito, setValorDebito] = useState<number>(12500);
  const [diasAtraso, setDiasAtraso] = useState<number>(450);
  const [rendaMedia, setRendaMedia] = useState<number>(3200);
  const [bairro, setBairro] = useState<string>('Centro');
  const [carregando, setCarregando] = useState<boolean>(false);
  const [resultado, setResultado] = useState<PredicaoInadimplenciaResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const executarPredicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const resp = await ApiService.predizerInadimplencia(valorDebito, diasAtraso, rendaMedia, bairro);
      setResultado(resp);
    } catch (err: any) {
      setErro(err.message || 'Falha ao executar predição do modelo.');
    } finally {
      setCarregando(false);
    }
  };

  const getCorFaixa = (faixa: string) => {
    if (faixa.includes('Alta')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (faixa.includes('Média')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-emerald-600" />
            Inteligência Fiscal & Predição de Inadimplência
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Inferência ao vivo via Random Forest e Scoring de Recuperabilidade da Dívida Ativa (Sprint 4)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Modelo Serializado .joblib</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulário de Parâmetros */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            Simular Perfil de Débito
          </h3>

          <form onSubmit={executarPredicao} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor Total do Débito (R$)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={valorDebito}
                  onChange={(e) => setValorDebito(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dias de Inadimplência / Atraso
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={diasAtraso}
                  onChange={(e) => setDiasAtraso(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-400">
                {diasAtraso < 365 ? 'Débito recente (< 1 ano)' : diasAtraso < 1095 ? 'Débito intermediário (1 a 3 anos)' : 'Débito antigo (> 3 anos)'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Bairro / Setor Censitário de Palmas
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={bairro}
                  onChange={(e) => {
                    setBairro(e.target.value);
                    if (e.target.value === 'Taquaralto') setRendaMedia(1800);
                    else if (e.target.value === '104 Sul') setRendaMedia(5200);
                    else setRendaMedia(3250);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Centro">Centro / Plano Diretor (R$ 3.250)</option>
                  <option value="104 Sul">104 Sul (R$ 5.200)</option>
                  <option value="Taquaralto">Taquaralto / Região Sul (R$ 1.800)</option>
                  <option value="Jardim Aureny III">Jardim Aureny III (R$ 2.100)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-sm transition text-sm flex items-center justify-center gap-2"
            >
              <BrainCircuit className="w-4 h-4" />
              {carregando ? 'Calculando Inferência...' : 'Executar Predição com IA'}
            </button>
          </form>

          {erro && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-7 space-y-4">
          {resultado ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-slate-800 text-lg">Diagnóstico da Dívida Ativa</h4>
                <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${getCorFaixa(resultado.faixa_recuperabilidade)}`}>
                  {resultado.faixa_recuperabilidade}
                </span>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Probabilidade de Inadimplência</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">{resultado.probabilidade_inadimplencia}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Risco de não pagamento</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Chance de Recuperação Amigável</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">{resultado.probabilidade_recuperacao}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Eficácia em cobrança direta</div>
                </div>
              </div>

              {/* Ação Recomendada */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <div className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recomendação Operacional da SEFIN
                </div>
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                  {resultado.recomendacao_fiscal}
                </p>
              </div>

              {/* Detalhes de Auditoria e Fairness */}
              <div className="text-xs text-slate-400 pt-3 border-t border-slate-100 flex flex-wrap justify-between gap-2">
                <span>Modelo: <strong className="text-slate-600">{resultado.modelo_utilizado}</strong></span>
                <span>Prioridade na Fila: <strong className="text-slate-600">Nível {resultado.prioridade_execucao}</strong></span>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[320px]">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h4 className="text-base font-semibold text-slate-700">Aguardando Parâmetros</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Preencha os valores ao lado e clique em &quot;Executar Predição&quot; para consultar os algoritmos de Machine Learning da SEFIN Palmas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
