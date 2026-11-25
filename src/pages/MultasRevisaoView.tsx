import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Building2,
  Lightbulb,
} from 'lucide-react';
import { ApiService } from '../services/api';

export const MultasRevisaoView: React.FC = () => {
  const [carregando, setCarregando] = useState(false);
  const [dadosAuditoria, setDadosAuditoria] = useState<any>(null);
  const [casosHomologados, setCasosHomologados] = useState<Record<string, { status: string; justificativa: string }>>({});
  const [justificativaTexto, setJustificativaTexto] = useState<string>('');
  const [casoSelecionado, setCasoSelecionado] = useState<string | null>(null);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const resp = await ApiService.obterAuditoriaMultasEPerfis();
      setDadosAuditoria(resp);
    } catch (err) {
      console.error('Falha ao carregar auditoria de multas:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const homologarRevisao = (casoId: string, decisao: 'HOMOLOGADO' | 'REJEITADO') => {
    setCasosHomologados((prev) => ({
      ...prev,
      [casoId]: {
        status: decisao,
        justificativa: justificativaTexto || (decisao === 'HOMOLOGADO' ? 'Revisão acatada com base no Art. 20 LGPD e Súmula Vinculante STF.' : 'Mantido lançamento original após reanálise do auditor.'),
      },
    }));
    setCasoSelecionado(null);
    setJustificativaTexto('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-neutral-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#7f1d1d]">
              Auditoria Fiscal & Human-in-the-Loop
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Revisão de Multas & Perfis de Devedores</h1>
          <p className="text-sm text-neutral-600">
            Detecção de anomalias em cálculos manuais de multas tributárias e auditoria humana mandante conforme o Art. 20 da LGPD.
          </p>
        </div>

        <button
          onClick={carregarDados}
          disabled={carregando}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#7f1d1d] text-white rounded hover:bg-[#991b1b] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
          <span>{carregando ? 'Atualizando...' : 'Recarregar Anomalias'}</span>
        </button>
      </div>

      {/* Alerta Institucional LGPD Art. 20 */}
      <div className="p-4 bg-neutral-50 border-l-4 border-[#7f1d1d] rounded text-xs text-neutral-800 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-neutral-900">
          <ShieldCheck className="w-4 h-4 text-[#7f1d1d]" />
          <span>Garantia de Revisão Humana (Lei 13.709/2018 - LGPD, Art. 20)</span>
        </div>
        <p className="text-neutral-600 leading-relaxed">
          Nenhuma multa ou lançamento tributário é cancelado ou reajustado de forma 100% autônoma pela IA. O modelo atua como ferramenta de triagem prévia, apontando divergências matemáticas e violações de jurisprudência (ex: multas confiscatórias acima de 20% ou juros anatocistas) para decisão do auditor fiscal habilitado.
        </p>
      </div>

      {/* Casos com Suspeita de Erro Humano de Cálculo */}
      <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Casos com Suspeita de Erro no Cálculo da Multa</h2>
            <p className="text-xs text-neutral-500">
              Lançamentos fiscais manuais que violaram limites de razoabilidade, juros legais ou jurisprudência do STF.
            </p>
          </div>
          <span className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 font-mono rounded">
            {dadosAuditoria?.casos_analisados?.length || 0} pendências identificadas
          </span>
        </div>

        <div className="space-y-4">
          {(!dadosAuditoria || !dadosAuditoria.casos_analisados || dadosAuditoria.casos_analisados.length === 0) ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              Nenhuma anomalia crítica pendente no momento.
            </div>
          ) : (
            dadosAuditoria.casos_analisados.map((caso: any) => {
              const homologacao = casosHomologados[caso.id];
              return (
                <div
                  key={caso.id}
                  className={`border rounded p-4 transition-colors ${
                    homologacao
                      ? homologacao.status === 'HOMOLOGADO'
                        ? 'border-neutral-300 bg-neutral-50'
                        : 'border-neutral-300 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{caso.contribuinte}</span>
                        <span className="font-mono text-xs text-neutral-500">({caso.documento})</span>
                        <span className="text-[10px] px-2 py-0.5 bg-neutral-200 text-neutral-800 font-medium rounded">
                          {caso.tributo} • {caso.ano_exercicio}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-700 mt-1 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#7f1d1d] shrink-0" />
                        <span>Diagnóstico da IA: {caso.erro_detectado}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        {caso.detalhe_tecnico}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wide">Comparativo de Valor</div>
                      <div className="text-xs text-neutral-500 line-through">
                        Original: R$ {caso.valor_original.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm font-bold font-mono text-[#7f1d1d]">
                        Revisado: R$ {caso.valor_revisado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-neutral-600 mt-0.5">
                        Divergência: R$ {(caso.valor_original - caso.valor_revisado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Painel de Ação Humana */}
                  <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-neutral-600">
                      {homologacao ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-neutral-800" />
                          <span>
                            Decisão: <strong>{homologacao.status}</strong> — {homologacao.justificativa}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-500">
                          Aguardando homologação de Auditor Fiscal habilitado.
                        </span>
                      )}
                    </div>

                    {!homologacao && (
                      <div className="flex items-center gap-2">
                        {casoSelecionado === caso.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Justificativa da decisão..."
                              value={justificativaTexto}
                              onChange={(e) => setJustificativaTexto(e.target.value)}
                              className="px-2.5 py-1 text-xs border border-neutral-300 rounded focus:border-[#7f1d1d] outline-none"
                            />
                            <button
                              onClick={() => homologarRevisao(caso.id, 'HOMOLOGADO')}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#7f1d1d] text-white rounded hover:bg-[#991b1b]"
                            >
                              Confirmar Correção
                            </button>
                            <button
                              onClick={() => homologarRevisao(caso.id, 'REJEITADO')}
                              className="px-2.5 py-1 text-xs font-semibold bg-neutral-200 text-neutral-800 rounded hover:bg-neutral-300"
                            >
                              Manter Original
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setCasoSelecionado(caso.id);
                              setJustificativaTexto('');
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Avaliar Caso</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mapeamento de Perfis que Tendem a Dever Mais e Maneiras de Contornar */}
      <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
        <div className="border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#7f1d1d]" />
            <h2 className="text-base font-bold text-neutral-900">Perfis de Devedores Recorrentes & Estratégias de Regularização</h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Segmentação baseada no histórico de Palmas e alternativas municipais para evitar execuções judiciais morosas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(dadosAuditoria?.perfis_inadimplencia || []).map((perfil: any, idx: number) => (
            <div key={idx} className="border border-neutral-200 rounded p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7f1d1d]">
                    Perfil #{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded">
                    Risco: {perfil.grau_risco || 'Alto'}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-neutral-900 mt-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{perfil.categoria}</span>
                </h3>
                <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                  <strong>Causa Raiz:</strong> {perfil.motivo_recorrencia}
                </p>
                <div className="mt-2 text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-700">Volume estimado:</span> {perfil.volume_estimado}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 bg-neutral-50 -mx-4 -mb-4 p-3 rounded-b">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Solução & Saída Fiscal:</span>
                </div>
                <p className="text-[11px] text-neutral-700 mt-1 leading-snug">
                  {perfil.estrategia_saida}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
