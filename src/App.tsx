import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Navbar';
import type { AbaNavegacao } from './components/Navbar';
import { AcessibilidadeBar } from './components/AcessibilidadeBar';
import type { ModoVisual } from './components/AcessibilidadeBar';
import { Dashboard } from './pages/Dashboard';
import { BuscaFiscal } from './pages/BuscaFiscal';
import { FilaCobrancaView } from './pages/FilaCobrancaView';
import { MultasRevisaoView } from './pages/MultasRevisaoView';
import { MacrorregioesView } from './pages/MacrorregioesView';
import { CapacidadeFairnessView } from './pages/CapacidadeFairnessView';
import { AgentesView } from './pages/AgentesView';
import { ReceitasPrefeituraView } from './pages/ReceitasPrefeituraView';
import { SimuladorTributario } from './pages/SimuladorTributario';
import { Login } from './pages/Login';
import { AgenteFlutuanteCopilot } from './components/AgenteFlutuanteCopilot';
import { ApiService } from './services/api';
import type { ItemFilaCobranca, UsuarioLogado } from './types/tributario';
import { WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(() => ApiService.obterUsuarioSalvo());
  const [abaAtiva, setAbaAtiva] = useState<AbaNavegacao>('painel');
  const [sidebarAberta, setSidebarAberta] = useState<boolean>(true);
  const [fila, setFila] = useState<ItemFilaCobranca[]>([]);
  const [cpfParaConsulta, setCpfParaConsulta] = useState<string>('');
  const [offlineAtivo, setOfflineAtivo] = useState<boolean>(false);

  // Estados de Acessibilidade
  const [modoVisual, setModoVisual] = useState<ModoVisual>('padrao');
  const [escalaFonte, setEscalaFonte] = useState<number>(1.0);

  const handleMudarEscalaFonte = (delta: number) => {
    setEscalaFonte((prev) => {
      const novo = Math.round((prev + delta) * 10) / 10;
      return Math.min(Math.max(novo, 0.8), 1.5);
    });
  };

  const carregarFila = () => {
    if (!usuario || usuario.perfil === 'consulta') return;
    ApiService.listarFilaCobranca()
      .then((dados) => {
        setFila(dados);
        setOfflineAtivo(ApiService.offlineFallbackAtivo);
      })
      .catch((err) => {
        console.error('Falha ao listar fila de cobrança:', err);
        setOfflineAtivo(true);
      });
  };

  useEffect(() => {
    if (usuario) {
      if (usuario.perfil === 'consulta') {
        setAbaAtiva('dossie');
        setCpfParaConsulta(usuario.cpf || '');
      } else {
        setAbaAtiva('painel');
        carregarFila();
      }
    }
  }, [usuario]);

  const handleLogin = (u: UsuarioLogado) => {
    setUsuario(u);
    if (u.perfil === 'consulta') {
      setAbaAtiva('dossie');
      setCpfParaConsulta(u.cpf || '');
    } else {
      setAbaAtiva('painel');
    }
  };

  const handleLogout = () => {
    ApiService.encerrarSessao();
    setUsuario(null);
    setCpfParaConsulta('');
    setFila([]);
  };

  const handleConsultarCpf = (cpf: string) => {
    setCpfParaConsulta(cpf);
    setAbaAtiva('dossie');
  };

  const classeContainer = `min-h-screen flex flex-col font-sans transition-all duration-200 ${
    modoVisual === 'contraste' ? 'modo-alto-contraste bg-black text-white' : 'bg-neutral-50 text-neutral-900'
  } ${modoVisual === 'limpo' ? 'modo-limpo' : ''}`;

  return (
    <div className={classeContainer} style={{ fontSize: `${escalaFonte * 100}%` }}>
      {/* Barra de Acessibilidade Superior */}
      <AcessibilidadeBar
        abaAtiva={abaAtiva}
        aoMudarAba={setAbaAtiva}
        modoVisual={modoVisual}
        aoMudarModoVisual={setModoVisual}
        escalaFonte={escalaFonte}
        aoMudarEscalaFonte={handleMudarEscalaFonte}
        usuario={usuario}
        aoSair={handleLogout}
      />

      {/* Se não estiver logado, exibe tela de login sóbria */}
      {!usuario ? (
        <Login aoLogar={handleLogin} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Retrátil na Lateral Esquerda */}
          <Sidebar
            abaAtiva={abaAtiva}
            aoMudarAba={setAbaAtiva}
            usuario={usuario}
            aberta={sidebarAberta}
            aoAlternar={() => setSidebarAberta(!sidebarAberta)}
            aoSair={handleLogout}
          />

          {/* Área Central Principal */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Aviso Discreto de Conexão / Fallback de Exemplo */}
            {offlineAtivo && (
              <aside
                aria-label="Notificação de status da conexão"
                className="bg-neutral-100 border-b border-neutral-300 px-4 py-2 text-xs text-neutral-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <WifiOff className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span>
                    <strong>Modo de Contingência:</strong> Conexão temporária com a base central indisponível. Operando com dados locais de contingência estruturados.
                  </span>
                </div>
                <button
                  onClick={carregarFila}
                  className="underline text-neutral-900 font-semibold hover:text-neutral-700"
                >
                  Tentar reconectar
                </button>
              </aside>
            )}

            {/* Conteúdo Centralizado da Ferramenta Selecionada */}
            <main className="flex-1 p-6 md:p-8">
              {abaAtiva === 'painel' && (
                <Dashboard
                  fila={fila}
                  aoVerFila={() => setAbaAtiva('fila')}
                  aoConsultarCpf={handleConsultarCpf}
                  aoRecarregarDados={carregarFila}
                />
              )}

              {abaAtiva === 'dossie' && (
                <BuscaFiscal cpfInicial={cpfParaConsulta} />
              )}

              {abaAtiva === 'fila' && (
                <FilaCobrancaView
                  fila={fila}
                  aoConsultarCpf={handleConsultarCpf}
                  aoRecarregarDados={carregarFila}
                />
              )}

              {abaAtiva === 'multas' && (
                <MultasRevisaoView />
              )}

              {abaAtiva === 'macrorregioes' && (
                <MacrorregioesView />
              )}

              {abaAtiva === 'capacidade' && (
                <CapacidadeFairnessView />
              )}

              {abaAtiva === 'agentes' && (
                <AgentesView />
              )}

              {abaAtiva === 'receitas' && (
                <ReceitasPrefeituraView />
              )}

              {abaAtiva === 'simulador' && (
                <SimuladorTributario />
              )}
            </main>

            {/* Rodapé Institucional Sóbrio */}
            <footer className="bg-white border-t border-neutral-200 py-4 px-6 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <strong>SITRIB PALMAS</strong> • SEFIN / Ciência da Computação UFT 2026
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span>Sessão: <strong className="text-neutral-800">{usuario.nome}</strong></span>
                <span>•</span>
                <span className="uppercase text-[#7f1d1d] font-bold">{usuario.perfil}</span>
                <span>•</span>
                <span>WCAG AAA</span>
              </div>
            </footer>
          </div>

          {/* Copilot Flutuante Global do Agente (ReAct & Navegação por Linguagem Natural) */}
          <AgenteFlutuanteCopilot abaAtiva={abaAtiva} aoMudarAba={setAbaAtiva} />
        </div>
      )}
    </div>
  );
};

export default App;
