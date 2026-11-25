import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  Keyboard,
  Sparkles,
  X,
  LogOut,
} from 'lucide-react';
import type { AbaNavegacao } from './Navbar';
import type { UsuarioLogado } from '../types/tributario';

export type ModoVisual = 'padrao' | 'limpo' | 'contraste';

interface AcessibilidadeBarProps {
  abaAtiva: AbaNavegacao;
  aoMudarAba: (aba: AbaNavegacao) => void;
  modoVisual: ModoVisual;
  aoMudarModoVisual: (modo: ModoVisual) => void;
  escalaFonte: number;
  aoMudarEscalaFonte: (delta: number) => void;
  usuario?: UsuarioLogado | null;
  aoSair?: () => void;
}

export const AcessibilidadeBar: React.FC<AcessibilidadeBarProps> = ({
  abaAtiva,
  aoMudarAba,
  modoVisual,
  aoMudarModoVisual,
  escalaFonte,
  aoMudarEscalaFonte,
  usuario,
  aoSair,
}) => {
  const [ouvindoVoz, setOuvindoVoz] = useState(false);
  const [mensagemVoz, setMensagemVoz] = useState<string | null>(null);
  const [falando, setFalando] = useState(false);
  const [modalAtalhosAberto, setModalAtalhosAberto] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Inicializa o reconhecimento de voz do navegador (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'pt-BR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setOuvindoVoz(true);
        setMensagemVoz('Ouvindo... Diga "Busca", "Fila", "Dashboard", "IA" ou "Ler tela"');
      };

      recognition.onresult = (event: any) => {
        const texto = event.results[0][0].transcript.toLowerCase();
        setMensagemVoz(`Comando reconhecido: "${texto}"`);
        processarComandoVoz(texto);
      };

      recognition.onerror = () => {
        setOuvindoVoz(false);
        setMensagemVoz('Não foi possível captar o áudio. Tente novamente.');
        setTimeout(() => setMensagemVoz(null), 3000);
      };

      recognition.onend = () => {
        setOuvindoVoz(false);
        setTimeout(() => setMensagemVoz(null), 4000);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Atalhos de teclado globais (Alt + 1..5, Alt + V, Alt + L, Alt + C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      if (e.key === '1') {
        e.preventDefault();
        aoMudarAba('painel');
        falarTexto('Navegando para o Painel Geral.');
      } else if (e.key === '2') {
        e.preventDefault();
        aoMudarAba('dossie');
        falarTexto('Navegando para a Consulta e Dossiê Fiscal.');
      } else if (e.key === '3') {
        e.preventDefault();
        aoMudarAba('fila');
        falarTexto('Navegando para a Fila de Cobrança.');
      } else if (e.key === '4') {
        e.preventDefault();
        aoMudarAba('macrorregioes');
        falarTexto('Navegando para Macrorregiões Fiscais.');
      } else if (e.key === '5') {
        e.preventDefault();
        aoMudarAba('simulador');
        falarTexto('Navegando para o Simulador de Tributos.');
      } else if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        alternarMicrofone();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lerConteudoTela();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        aoMudarModoVisual(modoVisual === 'contraste' ? 'padrao' : 'contraste');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abaAtiva, modoVisual]);

  const processarComandoVoz = (comando: string) => {
    if (comando.includes('dash') || comando.includes('painel') || comando.includes('geral')) {
      aoMudarAba('painel');
      falarTexto('Abrindo Painel Geral.');
    } else if (comando.includes('busca') || comando.includes('dossiê') || comando.includes('cpf') || comando.includes('consultar')) {
      aoMudarAba('dossie');
      falarTexto('Abrindo Dossiê e Consulta Fiscal.');
    } else if (comando.includes('fila') || comando.includes('devedor') || comando.includes('cobrança')) {
      aoMudarAba('fila');
      falarTexto('Abrindo Fila de Cobrança.');
    } else if (comando.includes('multa') || comando.includes('revisão') || comando.includes('lgpd')) {
      aoMudarAba('multas');
      falarTexto('Abrindo Revisão de Multas.');
    } else if (comando.includes('região') || comando.includes('macrorregião') || comando.includes('território')) {
      aoMudarAba('macrorregioes');
      falarTexto('Abrindo Macrorregiões Fiscais.');
    } else if (comando.includes('capacidade') || comando.includes('negociação') || comando.includes('fairness')) {
      aoMudarAba('capacidade');
      falarTexto('Abrindo Capacidade e Negociação.');
    } else if (comando.includes('agente') || comando.includes('ia') || comando.includes('microsserviço')) {
      aoMudarAba('agentes');
      falarTexto('Abrindo Agentes Estritos de IA.');
    } else if (comando.includes('receita') || comando.includes('transparência') || comando.includes('prefeitura')) {
      aoMudarAba('receitas');
      falarTexto('Abrindo Receitas Oficiais da Prefeitura.');
    } else if (comando.includes('simulador') || comando.includes('reajuste') || comando.includes('alíquota')) {
      aoMudarAba('simulador');
      falarTexto('Abrindo Simulador de Tributos.');
    } else if (comando.includes('ler') || comando.includes('falar') || comando.includes('ajuda')) {
      lerConteudoTela();
    } else if (comando.includes('contraste')) {
      aoMudarModoVisual('contraste');
      falarTexto('Modo alto contraste ativado.');
    } else if (comando.includes('limpo') || comando.includes('idoso') || comando.includes('simplificado')) {
      aoMudarModoVisual('limpo');
      falarTexto('Modo de leitura limpa ativado.');
    } else if (comando.includes('padrão') || comando.includes('normal')) {
      aoMudarModoVisual('padrao');
      falarTexto('Modo visual padrão restaurado.');
    } else {
      falarTexto(`Comando "${comando}" não reconhecido. Tente falar painel, fila, dossiê ou macrorregiões.`);
    }
  };

  const alternarMicrofone = () => {
    if (!recognitionRef.current) {
      alert('Seu navegador não suporta reconhecimento de voz nativo (SpeechRecognition). Utilize Google Chrome ou Microsoft Edge.');
      return;
    }

    if (ouvindoVoz) {
      recognitionRef.current.stop();
      setOuvindoVoz(false);
      setMensagemVoz(null);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        setOuvindoVoz(false);
      }
    }
  };

  const falarTexto = (texto: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.onstart = () => setFalando(true);
    utterance.onend = () => setFalando(false);
    utterance.onerror = () => setFalando(false);

    window.speechSynthesis.speak(utterance);
  };

  const lerConteudoTela = () => {
    let texto = '';
    if (abaAtiva === 'painel') {
      texto = 'Você está no Painel Geral do SITRIB com indicadores fiscais e síntese analítica da SEFIN Palmas.';
    } else if (abaAtiva === 'dossie') {
      texto = 'Você está na Consulta e Dossiê Fiscal. Digite o CPF ou a inscrição do imóvel para inspecionar débitos e execuções.';
    } else if (abaAtiva === 'fila') {
      texto = 'Você está na Fila de Cobrança Max-Heap, priorizada por score de inadimplência e potencial de recuperação.';
    } else if (abaAtiva === 'multas') {
      texto = 'Você está na Revisão Humana de Multas e Anomalias de Cálculo com conformidade ao Artigo 20 da LGPD.';
    } else if (abaAtiva === 'macrorregioes') {
      texto = 'Você está no mapeamento territorial das 7 Macrorregiões Fiscais de Palmas com dados do IBGE e SEFIN.';
    } else if (abaAtiva === 'capacidade') {
      texto = 'Você está no painel de Capacidade Contributiva e Negociação com mitigação algorítmica de viés territorial.';
    } else if (abaAtiva === 'agentes') {
      texto = 'Você está no catálogo dos 4 Agentes Estritos integrados aos 4 Microsserviços com guardrails de conformidade.';
    } else if (abaAtiva === 'receitas') {
      texto = 'Você está na consulta de Receitas Reais da Prefeitura com mais de 182 mil registros e correção da armadilha contábil.';
    } else if (abaAtiva === 'simulador') {
      texto = 'Você está no Simulador de Reajuste Tributário para projeção orçamentária de alíquotas.';
    }
    falarTexto(texto);
  };

  const pararFala = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setFalando(false);
    }
  };

  return (
    <>
      {/* Barra de Acessibilidade no topo */}
      <div className="bg-slate-950 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Lado Esquerdo: Ferramentas de Voz e Fala */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
              Acessibilidade:
            </span>

            {/* Botão Microfone / Comando de Voz */}
            <button
              onClick={alternarMicrofone}
              title="Ativar comando de voz (Alt + V)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition font-medium ${
                ouvindoVoz
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {ouvindoVoz ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{ouvindoVoz ? 'Ouvindo...' : 'Comando de Voz'}</span>
            </button>

            {/* Leitor de Tela em Áudio */}
            {falando ? (
              <button
                onClick={pararFala}
                title="Parar leitura em voz alta"
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg border border-amber-500 transition"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Silenciar</span>
              </button>
            ) : (
              <button
                onClick={lerConteudoTela}
                title="Ouvir descrição da tela atual (Alt + L)"
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ouvir Tela</span>
              </button>
            )}
          </div>

          {/* Lado Direito: Modos Visuais, Tipografia e Atalhos */}
          <div className="flex items-center space-x-2">
            {/* Seletor de Modo Visual */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => aoMudarModoVisual('padrao')}
                title="Modo padrão completo"
                className={`px-2 py-1 rounded-md text-[11px] transition ${
                  modoVisual === 'padrao' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Padrão
              </button>
              <button
                onClick={() => aoMudarModoVisual('limpo')}
                title="Modo simplificado para idosos e baixa visão"
                className={`px-2 py-1 rounded-md text-[11px] transition ${
                  modoVisual === 'limpo' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Limpo
              </button>
              <button
                onClick={() => aoMudarModoVisual('contraste')}
                title="Modo alto contraste para daltonismo (Alt + C)"
                className={`px-2 py-1 rounded-md text-[11px] transition flex items-center gap-1 ${
                  modoVisual === 'contraste' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" /> Contraste
              </button>
            </div>

            {/* Ajuste de Tamanho da Fonte */}
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => aoMudarEscalaFonte(-0.1)}
                title="Diminuir texto"
                className="px-2 py-1 text-slate-400 hover:text-white text-[11px] font-bold"
              >
                A-
              </button>
              <span className="text-[10px] text-slate-500 font-mono px-1">
                {Math.round(escalaFonte * 100)}%
              </span>
              <button
                onClick={() => aoMudarEscalaFonte(0.1)}
                title="Aumentar texto"
                className="px-2 py-1 text-slate-400 hover:text-white text-[11px] font-bold"
              >
                A+
              </button>
            </div>

            {/* Modal de Atalhos de Teclado */}
            <button
              onClick={() => setModalAtalhosAberto(true)}
              title="Ver teclas de atalho (Keys)"
              className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition text-[11px]"
            >
              <Keyboard className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Atalhos (Keys)</span>
            </button>

            {/* Botão de Retorno ao Login */}
            {usuario && aoSair && (
              <button
                onClick={aoSair}
                title="Encerrar sessão e voltar à tela inicial de login"
                className="flex items-center gap-1.5 px-3 py-1 bg-red-950/80 hover:bg-red-800 text-red-200 hover:text-white border border-red-700/80 hover:border-red-500 rounded-lg transition font-semibold text-[11px] shadow-sm ml-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Voltar ao Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback visual de comando de voz ativo */}
        {mensagemVoz && (
          <div className="max-w-7xl mx-auto mt-2 p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{mensagemVoz}</span>
            </div>
            <button onClick={() => setMensagemVoz(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Modal de Teclas de Atalho (Keys) */}
      {modalAtalhosAberto && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <Keyboard className="w-5 h-5" /> Teclas de Atalho do SITRIB (Keys)
              </h3>
              <button
                onClick={() => setModalAtalhosAberto(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Você pode navegar por todo o sistema sem utilizar o mouse usando as combinações de tecla abaixo:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ir para o Painel Geral</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + 1</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ir para a Consulta e Dossiê Fiscal</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + 2</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ir para a Fila de Cobrança Max-Heap</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + 3</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ir para Macrorregiões Fiscais</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + 4</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ir para o Simulador de Tributos</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + 5</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ativar / Desativar Comando de Voz</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + V</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Ouvir resumo da tela em voz alta</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + L</kbd>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/60 rounded-lg border border-slate-700">
                <span>Alternar Modo de Alto Contraste (Daltonismo)</span>
                <kbd className="px-2 py-0.5 bg-slate-950 border border-slate-600 rounded text-emerald-400 font-mono">Alt + C</kbd>
              </div>
            </div>

            <button
              onClick={() => setModalAtalhosAberto(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition"
            >
              Entendido e Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
