import React, { useState } from 'react';
import { Building2, Shield, UserCheck, AlertCircle, Lock, User, Mail, Phone, FileText } from 'lucide-react';
import { ApiService } from '../services/api';
import type { UsuarioLogado } from '../types/tributario';

interface LoginProps {
  aoLogar: (usuario: UsuarioLogado) => void;
}

export const Login: React.FC<LoginProps> = ({ aoLogar }) => {
  const [modo, setModo] = useState<'login' | 'govbr' | 'cadastro'>('login');

  // Campos Login
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');

  // Campos Gov.br
  const [cpfGovBr, setCpfGovBr] = useState('');
  const [nomeGovBr, setNomeGovBr] = useState('');
  const [nivelGovBr, setNivelGovBr] = useState<'OURO' | 'PRATA' | 'BRONZE'>('OURO');

  // Campos Cadastro
  const [nomeCadastro, setNomeCadastro] = useState('');
  const [cpfCadastro, setCpfCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [telefoneCadastro, setTelefoneCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLoginPadrao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador || !senha) {
      setErro('Informe o CPF ou E-mail e a senha.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resp = await ApiService.login(identificador, senha);
      aoLogar(resp.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha na autenticação.');
    } finally {
      setCarregando(false);
    }
  };

  const handleLoginGovBr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpfGovBr) {
      setErro('Informe o CPF para validação no Login Único Gov.br.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resp = await ApiService.autenticarGovBr(cpfGovBr, nomeGovBr || undefined, nivelGovBr);
      aoLogar(resp.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha na autenticação Gov.br.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCadastro || !cpfCadastro || !emailCadastro || !senhaCadastro) {
      setErro('Preencha nome, CPF, e-mail e senha.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resp = await ApiService.cadastrarUsuario({
        nome: nomeCadastro,
        cpf: cpfCadastro,
        email: emailCadastro,
        telefone: telefoneCadastro,
        senha: senhaCadastro,
      });
      aoLogar(resp.usuario);
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar contribuinte.');
    } finally {
      setCarregando(false);
    }
  };

  const entrarComAcessoTeste = async (id: string, pass: string) => {
    setIdentificador(id);
    setSenha(pass);
    setErro(null);
    setCarregando(true);
    try {
      const resp = await ApiService.login(id, pass);
      aoLogar(resp.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha no acesso de teste.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-center py-10 px-4 font-sans">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Cabeçalho Sóbrio Vinho & Preto */}
        <div className="border-b-2 border-[#7f1d1d] pb-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded bg-[#7f1d1d] text-white flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-950">
              SITRIB • SEFIN PALMAS
            </h1>
            <p className="text-xs text-neutral-500">
              Sistema Integrado de Gestão Tributária e Auditoria Fiscal • PostgreSQL
            </p>
          </div>
        </div>

        {/* Abas: Login CPF/Email | Gov.br | Cadastro de Contribuinte */}
        <div className="grid grid-cols-3 border border-neutral-300 rounded overflow-hidden text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setModo('login');
              setErro(null);
            }}
            className={`py-2.5 text-center transition-colors ${
              modo === 'login'
                ? 'bg-[#7f1d1d] text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            E-mail ou CPF
          </button>
          <button
            type="button"
            onClick={() => {
              setModo('govbr');
              setErro(null);
            }}
            className={`py-2.5 text-center border-x border-neutral-300 transition-colors ${
              modo === 'govbr'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Login Gov.br
          </button>
          <button
            type="button"
            onClick={() => {
              setModo('cadastro');
              setErro(null);
            }}
            className={`py-2.5 text-center transition-colors ${
              modo === 'cadastro'
                ? 'bg-neutral-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Caixa Central do Formulário */}
        <div className="bg-white border border-neutral-300 rounded p-6 space-y-5">
          {erro && (
            <div className="p-3 bg-red-50 border-l-4 border-[#7f1d1d] text-[#7f1d1d] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* MODO 1: LOGIN POR CPF OU E-MAIL */}
          {modo === 'login' && (
            <form onSubmit={handleLoginPadrao} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  CPF ou E-mail Cadastrado
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="CPF (ex: 0865743101) ou e-mail institucional"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-[#7f1d1d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded focus:outline-none focus:border-[#7f1d1d]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-2.5 bg-[#7f1d1d] hover:bg-[#601515] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-50"
              >
                {carregando ? 'Autenticando...' : 'Acessar Sistema'}
              </button>
            </form>
          )}

          {/* MODO 2: LOGIN ÚNICO GOV.BR (SANDBOX LOCAL) */}
          {modo === 'govbr' && (
            <form onSubmit={handleLoginGovBr} className="space-y-4">
              <div className="p-3 bg-neutral-100 border border-neutral-300 rounded text-xs text-neutral-700">
                <strong>Validação Gov.br Local:</strong> Cruza o CPF com a folha da SEFIN Palmas para atribuir perfil de <strong>Auditor Fiscal</strong> ou <strong>Cidadão Contribuinte (LGPD)</strong> sem bloqueio de IP externo.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  CPF do Titular Gov.br
                </label>
                <input
                  type="text"
                  value={cpfGovBr}
                  onChange={(e) => setCpfGovBr(e.target.value)}
                  placeholder="Ex: 0865743101 (Auditor) ou 123.456.789-01 (Cidadão)"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded font-mono focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Nome (Opcional)
                  </label>
                  <input
                    type="text"
                    value={nomeGovBr}
                    onChange={(e) => setNomeGovBr(e.target.value)}
                    placeholder="Titular do CPF"
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Selo Confiabilidade
                  </label>
                  <select
                    value={nivelGovBr}
                    onChange={(e: any) => setNivelGovBr(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white"
                  >
                    <option value="OURO">Ouro (Certificado/Facial)</option>
                    <option value="PRATA">Prata (Bancos)</option>
                    <option value="BRONZE">Bronze (Básico)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                {carregando ? 'Validando Vínculo Gov.br...' : 'Entrar com Gov.br'}
              </button>
            </form>
          )}

          {/* MODO 3: CADASTRO DE CONTRIBUINTE */}
          {modo === 'cadastro' && (
            <form onSubmit={handleCadastro} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Nome Completo / Razão Social
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={nomeCadastro}
                    onChange={(e) => setNomeCadastro(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    CPF ou CNPJ
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={cpfCadastro}
                      onChange={(e) => setCpfCadastro(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={telefoneCadastro}
                      onChange={(e) => setTelefoneCadastro(e.target.value)}
                      placeholder="(63) 90000-0000"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={emailCadastro}
                    onChange={(e) => setEmailCadastro(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-neutral-700 mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={senhaCadastro}
                    onChange={(e) => setSenhaCadastro(e.target.value)}
                    placeholder="Crie uma senha"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                {carregando ? 'Cadastrando...' : 'Concluir Cadastro e Entrar'}
              </button>
            </form>
          )}

          {/* BOTÕES DE ACESSO RÁPIDO DE TESTE (AUDITOR, GESTOR E CIDADÃO) */}
          <div className="pt-4 border-t border-neutral-200 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Acessos Diretos de Homologação (1-Clique):
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => entrarComAcessoTeste('0865743101', '109924303')}
                className="w-full p-2.5 text-left border border-neutral-300 hover:border-[#7f1d1d] rounded flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-[#7f1d1d] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Auditor Fiscal (Adriel • CPF 0865743101)
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Vinho: Painel Geral, Fila de Cobrança, Revisão de Multas e Assistentes Fiscais
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                  Entrar
                </span>
              </button>

              <button
                type="button"
                onClick={() => entrarComAcessoTeste('gestor@sefin.palmas.to.gov.br', 'sefin123')}
                className="w-full p-2.5 text-left border border-neutral-300 hover:border-neutral-900 rounded flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Gestor Tributário (Diretoria SEFIN)
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Preto: Macrorregiões de Palmas, Análise de Capacidade e Arrecadação Municipal
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                  Entrar
                </span>
              </button>

              <button
                type="button"
                onClick={() => entrarComAcessoTeste('carlos.siqueira@email.com', 'cidadao123')}
                className="w-full p-2.5 text-left border border-neutral-300 hover:border-neutral-600 rounded flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Cidadão Contribuinte (CPF 123.456.789-01)
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Cinza: Apenas seu próprio Dossiê (Trava LGPD), Transparência e Simulador
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">
                  Entrar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
