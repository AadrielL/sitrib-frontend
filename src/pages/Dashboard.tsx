import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
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
  const [indicadores, setIndicadores] = useState<(IndicadoresDashboard & Record<string, any>) | null>(null);
  const [parecerIA, setParecerIA] = useState<any>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagem, setMensagem] = useState<string>('');

  const carregarDados = async () => {
    const ind = await ApiService.obterIndicadores();
    setIndicadores(ind);
    const par = await ApiService.obterParecerExecutivoIA('DASHBOARD');
    setParecerIA(par);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleSincronizarBanco = async () => {
    setCarregando(true);
    setMensagem('');
    try {
      const res = await ApiService.sincronizarBanco();
      await carregarDados();
      if (aoRecarregarDados) aoRecarregarDados();
      setMensagem(res.mensagem || 'Banco PostgreSQL sincronizado.');
    } catch (err: any) {
      setMensagem(err.message || 'Modo exemplo local ativo.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Institucional — Área: Auditoria (Vinho) */}
      <div className="border-b-2 border-[#7f1d1d] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#7f1d1d]">
            Área de Auditoria Fiscal • SEFIN Palmas
          </span>
          <h2 className="text-xl font-bold text-neutral-950 mt-0.5">
            Painel Geral de Arrecadação e Fiscalização
          </h2>
          <p className="text-xs text-neutral-500">
            Visão consolidada do estoque da Dívida Ativa, Arrecadação Municipal Oficial e indicadores socioeconômicos de Palmas.
          </p>
        </div>

        <button
          onClick={handleSincronizarBanco}
          disabled={carregando}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#7f1d1d] hover:bg-[#601515] text-white rounded text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin' : ''}`} />
          <span>{carregando ? 'Atualizando...' : 'Atualizar Base Cadastral'}</span>
        </button>
      </div>

      {mensagem && (
        <div className="p-3 bg-neutral-100 border-l-4 border-[#7f1d1d] text-neutral-800 text-xs">
          {mensagem}
        </div>
      )}

      {/* Métricas Sóbrias (Fundo Branco, Borda Cinza e Destaque Vinho/Preto) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-neutral-300 border-t-4 border-t-[#7f1d1d] rounded">
          <div className="text-[11px] font-bold uppercase text-neutral-500">
            Dívida Ativa Registrada
          </div>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            {(indicadores?.total_divida_ativa ?? 1084481.25).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {indicadores?.contribuintes_inadimplentes ?? fila.length} contribuintes •{' '}
            {indicadores?.total_processos_ajuizados ?? 7} execuções
          </div>
        </div>

        <div className="bg-white p-4 border border-neutral-300 border-t-4 border-t-neutral-900 rounded">
          <div className="text-[11px] font-bold uppercase text-neutral-500">
            Arrecadação Municipal Oficial
          </div>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            {(indicadores?.total_arrecadado_estimado ?? 1810016926.07).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {(indicadores?.registros_prefeitura_portal_novo ?? 10000).toLocaleString('pt-BR')} registros contábeis auditados
          </div>
        </div>

        <div className="bg-white p-4 border border-neutral-300 border-t-4 border-t-neutral-600 rounded">
          <div className="text-[11px] font-bold uppercase text-neutral-500">
            População & Renda IBGE Palmas
          </div>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            {(indicadores?.indicadores_ibge?.populacao ?? 313349).toLocaleString('pt-BR')} hab.
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Renda Média Domiciliar: R$ {(indicadores?.indicadores_ibge?.renda_media ?? 3250.5).toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 border border-neutral-300 border-t-4 border-t-[#7f1d1d] rounded">
          <div className="text-[11px] font-bold uppercase text-neutral-500">
            Índice Fiscal Palmas 2026
          </div>
          <div className="text-xl font-bold font-mono text-neutral-950 mt-1">
            UFIP: {indicadores?.indice_2026?.ufip_palmas_2026 ?? 'R$ 4,48'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            IPCA Referência: {indicadores?.indice_2026?.ipca_referencia ?? '4.62%'} a.a.
          </div>
        </div>
      </div>

      {/* Resumo da Fila Prioritária de Cobrança */}
      <div className="bg-white border border-neutral-300 rounded overflow-hidden">
        <div className="px-5 py-3.5 bg-neutral-100 border-b border-neutral-300 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-950">
              Topo da Fila Prioritária de Cobrança e Conciliação
            </h3>
            <p className="text-[11px] text-neutral-500">
              Ordenação orientada por impacto fiscal e potencial de recuperação (Sigilo Fiscal Art. 198 CTN & LGPD).
            </p>
          </div>
          <button
            onClick={aoVerFila}
            className="text-xs font-bold text-[#7f1d1d] hover:underline flex items-center gap-1"
          >
            <span>Abrir Fila Completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-600 uppercase border-b border-neutral-200">
              <tr>
                <th className="px-4 py-2.5">Score</th>
                <th className="px-4 py-2.5">Contribuinte</th>
                <th className="px-4 py-2.5">Documento</th>
                <th className="px-4 py-2.5">Bairro</th>
                <th className="px-4 py-2.5 text-right">Débito Total</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {fila.slice(0, 5).map((item) => (
                <tr key={item.cpf_cnpj} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5 font-mono font-bold text-[#7f1d1d]">{item.score} pts</td>
                  <td className="px-4 py-2.5 font-semibold text-neutral-900">{item.nome}</td>
                  <td className="px-4 py-2.5 font-mono text-neutral-600">{item.cpf_cnpj}</td>
                  <td className="px-4 py-2.5 text-neutral-600">{item.bairro_principal || 'Plano Diretor'}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-neutral-950">
                    {item.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => aoConsultarCpf(item.cpf_cnpj)}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-[#7f1d1d] text-white rounded text-[11px] font-semibold transition-colors"
                    >
                      Dossiê
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Síntese Cognitiva da IA ("Texto para Pensar" do Auditor) */}
      {parecerIA && parecerIA.topicos_para_pensar_ia && (
        <div className="bg-white border border-neutral-300 rounded p-5 space-y-4">
          <div className="border-b border-neutral-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                Apoio à Decisão Humana (Art. 20 LGPD)
              </span>
              <h3 className="text-sm font-bold text-neutral-950">
                Síntese Analítica da IA — Pontos de Reflexão para o Auditor Fiscal
              </h3>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              Cruzamento Cadastral & Socioeconômico (IBGE)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parecerIA.topicos_para_pensar_ia.map((t: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-neutral-50 border border-neutral-200 border-l-4 border-l-neutral-900 rounded space-y-2"
              >
                <h4 className="text-xs font-bold text-neutral-950">{t.titulo}</h4>
                <p className="text-xs text-neutral-700 leading-relaxed">{t.analise_ia}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(t.colunas_utilizadas || []).map((col: string) => (
                    <span
                      key={col}
                      className="px-2 py-0.5 bg-white border border-neutral-300 rounded text-[10px] font-mono text-neutral-600"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
