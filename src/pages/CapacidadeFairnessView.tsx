import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Percent,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { AvaliacaoCapacidadeFairnessResponse } from '../types/tributario';

export const CapacidadeFairnessView: React.FC = () => {
  const [valorDebito, setValorDebito] = useState<number>(2800);
  const [diasAtraso, setDiasAtraso] = useState<number>(480);
  const [tipoTributo, setTipoTributo] = useState<'IPTU' | 'ISS' | 'TAXA_LIXO'>('IPTU');
  const [tipoPessoa, setTipoPessoa] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const [bairro, setBairro] = useState<string>('Jardim Aureny III');
  const [qtdImoveis, setQtdImoveis] = useState<number>(1);
  const [avaliacaoFairness, setAvaliacaoFairness] = useState<AvaliacaoCapacidadeFairnessResponse | null>(null);
  const [avaliando, setAvaliando] = useState(false);
  const [acordoSalvo, setAcordoSalvo] = useState(false);

  const aplicarCenario = (
    debito: number,
    dias: number,
    trib: 'IPTU' | 'ISS' | 'TAXA_LIXO',
    pessoa: 'FISICA' | 'JURIDICA',
    bairroNome: string,
    imoveis: number
  ) => {
    setValorDebito(debito);
    setDiasAtraso(dias);
    setTipoTributo(trib);
    setTipoPessoa(pessoa);
    setBairro(bairroNome);
    setQtdImoveis(imoveis);
    setAvaliacaoFairness(null);
    setAcordoSalvo(false);
  };

  const handleAvaliar = async () => {
    setAvaliando(true);
    setAcordoSalvo(false);
    try {
      const resp = await ApiService.avaliarCapacidadeFairness({
        valor_debito: valorDebito,
        dias_atraso: diasAtraso,
        tipo_tributo: tipoTributo,
        tipo_pessoa: tipoPessoa,
        bairro,
        quantidade_imoveis: qtdImoveis,
      });
      setAvaliacaoFairness(resp);
    } catch (err) {
      console.error('Falha ao avaliar capacidade:', err);
    } finally {
      setAvaliando(false);
    }
  };

  const diag = avaliacaoFairness?.diagnostico_capacidade_contributiva;
  const audit = avaliacaoFairness?.auditoria_vies_e_lgpd;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Inteligência Fiscal & Justiça Tributária
          </span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">Capacidade Contributiva & Fairness</h1>
        <p className="text-sm text-neutral-600">
          Diferenciação algorítmica entre inadimplência involuntária (vulnerabilidade) e evasão fiscal contumaz, mitigando vieses geográficos.
        </p>
      </div>

      {/* Botões de Cenários Pré-configurados (1 Clique) */}
      <div className="bg-white border border-neutral-200 rounded p-4 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          Cenários de Teste Rápidos (1-Clique):
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => aplicarCenario(2800, 480, 'IPTU', 'FISICA', 'Jardim Aureny III', 1)}
            className="p-2.5 text-left border border-neutral-200 rounded hover:border-neutral-400 bg-neutral-50 hover:bg-white transition-colors"
          >
            <div className="text-xs font-bold text-neutral-900">1. Cidadão Vulnerável</div>
            <div className="text-[11px] text-neutral-500">Jd. Aureny III • IPTU R$ 2.800 • 1 Imóvel</div>
          </button>

          <button
            onClick={() => aplicarCenario(185000, 720, 'ISS', 'JURIDICA', 'Plano Diretor Sul', 4)}
            className="p-2.5 text-left border border-neutral-200 rounded hover:border-neutral-400 bg-neutral-50 hover:bg-white transition-colors"
          >
            <div className="text-xs font-bold text-neutral-900">2. Grande Devedor Corporativo</div>
            <div className="text-[11px] text-neutral-500">Plano Diretor • ISS R$ 185.000 • PJ</div>
          </button>

          <button
            onClick={() => aplicarCenario(14200, 240, 'IPTU', 'FISICA', 'Graciosa', 2)}
            className="p-2.5 text-left border border-neutral-200 rounded hover:border-neutral-400 bg-neutral-50 hover:bg-white transition-colors"
          >
            <div className="text-xs font-bold text-neutral-900">3. Médio Porte Habitacional</div>
            <div className="text-[11px] text-neutral-500">Orla Graciosa • IPTU R$ 14.200 • 2 Imóveis</div>
          </button>
        </div>
      </div>

      {/* Formulário de Parâmetros */}
      <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
        <h2 className="text-base font-bold text-neutral-900">Parâmetros do Caso em Análise</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Valor do Débito (R$)</label>
            <input
              type="number"
              step="100"
              value={valorDebito}
              onChange={(e) => setValorDebito(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Dias de Inadimplência</label>
            <input
              type="number"
              value={diasAtraso}
              onChange={(e) => setDiasAtraso(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Tipo de Tributo</label>
            <select
              value={tipoTributo}
              onChange={(e) => setTipoTributo(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
            >
              <option value="IPTU">IPTU</option>
              <option value="ISS">ISS</option>
              <option value="TAXA_LIXO">Taxa de Lixo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Tipo de Personalidade</label>
            <select
              value={tipoPessoa}
              onChange={(e) => setTipoPessoa(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
            >
              <option value="FISICA">Pessoa Física (CPF)</option>
              <option value="JURIDICA">Pessoa Jurídica (CNPJ)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Bairro / Setor (Palmas)</label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Qtd. de Imóveis no Cadastro</label>
            <input
              type="number"
              min="1"
              value={qtdImoveis}
              onChange={(e) => setQtdImoveis(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleAvaliar}
            disabled={avaliando}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{avaliando ? 'Avaliando Capacidade...' : 'Avaliar Capacidade & Propor Negociação'}</span>
          </button>
        </div>
      </div>

      {/* Resultado da Avaliação */}
      {avaliacaoFairness && diag && (
        <div className="bg-white border border-neutral-200 rounded p-5 space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  !diag.pode_pagar ? 'bg-[#7f1d1d]' : 'bg-neutral-900'
                }`} />
                <h3 className="text-base font-bold text-neutral-900">
                  Classificação: {diag.classificacao}
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Comprometimento de Renda Estimado:{' '}
                <strong className="font-mono text-neutral-900">
                  {diag.indice_comprometimento_renda_12x_pct}%
                </strong>
                {diag.renda_media_setor_ibge ? ` (Renda média estimada do setor: R$ ${diag.renda_media_setor_ibge.toLocaleString('pt-BR')})` : ''}
              </p>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded text-xs text-neutral-700">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Sigilo Fiscal (LGPD): <strong>{audit?.blind_inference_sem_cpf_nome ? 'Proteção Ativa (Sem Dados Pessoais)' : 'Ativo'}</strong>
              </span>
            </div>
          </div>

          {/* Justificativa e Parecer de Fairness */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-700 leading-relaxed space-y-1">
            <div className="font-semibold text-neutral-900">Parecer Ético e Mitigação de Viés (Fairness):</div>
            <div>{audit?.parecer_etico_fairness || 'Inferência realizada com isolamento de viés socioespacial.'}</div>
            <div className="text-[11px] text-neutral-500 pt-1">
              Fundamento Legal: {audit?.fundamento_legal || 'Artigo 145, § 1º da CF/88 (Capacidade Contributiva) e Artigo 20 da LGPD.'}
            </div>
          </div>

          {/* Proposta de Acordo / Instrumento Fiscal */}
          <div className="border border-neutral-200 rounded p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Instrumento Fiscal Recomendado
              </h4>
              <span className="text-[11px] font-mono font-semibold text-neutral-700">
                {diag.instrumento_fiscal_recomendado}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded">
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Condição de Entrada</span>
                </div>
                <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                  {!diag.pode_pagar ? 'Isento / 5%' : '10% a 20%'}
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded">
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Prazo Sugerido</span>
                </div>
                <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                  {!diag.pode_pagar ? '36 a 60 parcelas' : '12 a 24 parcelas'}
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded">
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  <span>Anistia de Juros/Multa</span>
                </div>
                <div className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                  {!diag.pode_pagar ? 'Até 90%' : 'Até 40%'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-neutral-500">
                {acordoSalvo ? (
                  <span className="text-neutral-900 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-neutral-800" />
                    Termo homologado pelo auditor fiscal e arquivado no processo.
                  </span>
                ) : (
                  <span>A recomendação atende às diretrizes de equidade fiscal.</span>
                )}
              </div>

              {!acordoSalvo && (
                <button
                  onClick={() => setAcordoSalvo(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 text-white rounded hover:bg-neutral-800"
                >
                  Homologar Termo de Acordo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
