import React, { useState, useEffect } from 'react';
import {
  Coins,
  History,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { TributoConfig } from '../types/tributario';

export const CadastroTributos: React.FC = () => {
  const [tributos, setTributos] = useState<TributoConfig[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [tributoSelecionado, setTributoSelecionado] = useState<TributoConfig | null>(null);

  // Estados do Modal de Edição de Alíquota
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [novaAliquota, setNovaAliquota] = useState<number>(0);
  const [motivoDecreto, setMotivoDecreto] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('Auditor Fiscal / Secretaria de Finanças');
  const [salvando, setSalvando] = useState<boolean>(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const lista = await ApiService.listarTributos();
      setTributos(lista);
      if (lista.length > 0 && !tributoSelecionado) {
        setTributoSelecionado(lista[0]);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirModalAjuste = (t: TributoConfig) => {
    setTributoSelecionado(t);
    setNovaAliquota(t.aliquota_padrao);
    setMotivoDecreto('');
    setMensagemSucesso(null);
    setMensagemErro(null);
    setModalAberto(true);
  };

  const handleSalvarAliquota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tributoSelecionado) return;

    if (novaAliquota <= 0) {
      setMensagemErro('A alíquota deve ser maior que zero.');
      return;
    }
    if (!motivoDecreto.trim()) {
      setMensagemErro('Informe a base legal ou motivo do decreto da alteração.');
      return;
    }

    setSalvando(true);
    setMensagemErro(null);

    try {
      const atualizado = await ApiService.atualizarAliquota(
        tributoSelecionado.codigo,
        novaAliquota,
        motivoDecreto,
        responsavel
      );

      setTributos((prev) =>
        prev.map((item) => (item.codigo === atualizado.codigo ? atualizado : item))
      );
      setTributoSelecionado(atualizado);
      setMensagemSucesso(`Alíquota de ${atualizado.nome} atualizada com sucesso para ${novaAliquota}%!`);
      setTimeout(() => setModalAberto(false), 1400);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMensagemErro(err.message);
      } else {
        setMensagemErro('Falha ao atualizar alíquota.');
      }
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Cadastro e Parametrização de Tributos (RF04 / RF08)
          </h2>
          <p className="text-sm text-slate-500">
            Gerenciamento das alíquotas oficiais municipais de Palmas/TO e histórico auditável de vigências.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Parâmetros Oficiais Homologados
          </span>
        </div>
      </div>

      {carregando ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Carregando tributos municipais...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Lista de Tributos Cadastrados */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              Tributos Municipais Vigentes ({tributos.length})
            </h3>

            <div className="space-y-3">
              {tributos.map((t) => {
                const isSelected = tributoSelecionado?.codigo === t.codigo;
                return (
                  <div
                    key={t.codigo}
                    onClick={() => setTributoSelecionado(t)}
                    className={`bg-white p-5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {t.tipo}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                            {t.categoria}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{t.codigo}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{t.nome}</h4>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-medium">Alíquota Atual</div>
                          <div className="text-xl font-bold font-mono text-emerald-600">
                            {t.aliquota_padrao}%
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalAjuste(t);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Reajustar
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">{t.descricao}</p>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Base legal: {t.base_legal}</span>
                      <span>{t.historico?.length || 0} alteração(ões) registrada(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna 2: Detalhes e Linha do Tempo de Vigências (RF08) */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Histórico de Tarifas (RF08)
            </h3>

            {tributoSelecionado ? (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Tributo Selecionado
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-0.5">
                    {tributoSelecionado.nome}
                  </h4>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Alíquota vigente: <strong>{tributoSelecionado.aliquota_padrao}%</strong>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h5 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-slate-400" />
                    Registro de Vigências Anteriores
                  </h5>

                  {(!tributoSelecionado.historico || tributoSelecionado.historico.length === 0) ? (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 italic">
                      Nenhuma alteração de tarifa registrada para este tributo desde a implantação.
                    </div>
                  ) : (
                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                      {tributoSelecionado.historico.map((h) => (
                        <div key={h.id} className="relative pl-7 text-xs space-y-1">
                          <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-slate-900">
                              {h.aliquota_anterior}% → {h.aliquota_nova}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {h.data_alteracao}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {h.motivo_decreto}
                          </p>
                          <div className="text-[10px] text-slate-400">
                            Autor: <strong>{h.responsavel}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => abrirModalAjuste(tributoSelecionado)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Registrar Nova Vigência
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                Selecione um tributo ao lado para inspecionar o histórico.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Reajuste de Alíquota */}
      {modalAberto && tributoSelecionado && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Atualizar Alíquota Oficial</h3>
                <p className="text-xs text-slate-500">
                  {tributoSelecionado.nome} ({tributoSelecionado.tipo})
                </p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarAliquota} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 font-medium">Alíquota Anterior</div>
                  <div className="text-lg font-bold font-mono text-slate-700 mt-0.5">
                    {tributoSelecionado.aliquota_padrao}%
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nova Alíquota Proposta (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      min="0.01"
                      required
                      value={novaAliquota}
                      onChange={(e) => setNovaAliquota(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo / Decreto Governamental (Base Legal)
                </label>
                <textarea
                  rows={3}
                  required
                  value={motivoDecreto}
                  onChange={(e) => setMotivoDecreto(e.target.value)}
                  placeholder="Ex: Decreto Municipal nº 1.950/2026 - Readequação fiscal orçamentária"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Servidor Responsável (Auditoria)
                </label>
                <input
                  type="text"
                  required
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {mensagemErro && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{mensagemErro}</span>
                </div>
              )}

              {mensagemSucesso && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{mensagemSucesso}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {salvando ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirmar Vigência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
