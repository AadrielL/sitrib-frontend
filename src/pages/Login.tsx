import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  ArrowRight,
  Lock,
  User,
  Mail,
  Phone,
  IdCard,
  BadgeCheck,
} from 'lucide-react';
import { ApiService } from '../services/api';
import type { UsuarioLogado } from '../types/tributario';

interface LoginProps {
  aoLogar: (usuario: UsuarioLogado) => void;
}

type ModoAcesso = 'login' | 'govbr' | 'cadastro';

export const Login: React.FC<LoginProps> = ({ aoLogar }) => {
  const [modo, setModo] = useState<ModoAcesso>('login');

  // Login padrão (CPF ou E-mail + Senha)
  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');

  // Login Gov.br
  const [cpfGov, setCpfGov] = useState('');
  const [nomeGov, setNomeGov] = useState('');
  const [nivelGov, setNivelGov] = useState<'OURO' | 'PRATA' | 'BRONZE'>('OURO');

  // Cadastro real
  const [nomeCad, setNomeCad] = useState('');
  const [cpfCad, setCpfCad] = useState('');
  const [emailCad, setEmailCad] = useState('');
  const [telefoneCad, setTelefoneCad] = useState('');
  const [senhaCad, setSenhaCad] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const limparErro = () => setErro(null);

  const handleLoginPadrao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador.trim() || !senha) {
      setErro('Informe seu CPF ou e-mail e sua senha.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await ApiService.login(identificador.trim(), senha);
      aoLogar(resposta.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha ao autenticar na SEFIN.');
    } finally {
      setCarregando(false);
    }
  };

  const handleLoginGovBr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfDigitos = cpfGov.replace(/\D/g, '');
    if (cpfDigitos.length < 10) {
      setErro('Informe um CPF válido para validar sua identidade via Gov.br.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await ApiService.autenticarGovBr(cpfDigitos, nomeGov.trim() || undefined, nivelGov);
      aoLogar(resposta.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha na autenticação com o Login Único Gov.br.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    const cpfDigitos = cpfCad.replace(/\D/g, '');
    if (!nomeCad.trim() || cpfDigitos.length < 10 || !emailCad.trim() || !senhaCad) {
      setErro('Preencha nome completo, CPF válido, e-mail e senha.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await ApiService.cadastrarUsuario({
        nome: nomeCad.trim(),
        cpf: cpfDigitos,
        email: emailCad.trim(),
        telefone: telefoneCad.trim() || undefined,
        senha: senhaCad,
      });
      aoLogar(resposta.usuario);
    } catch (err: any) {
      setErro(err.message || 'Falha ao realizar cadastro no SITRIB.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
          <Building2 className="w-9 h-9" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
          SITRIB Palmas
        </h2>
        <p className="mt-1.5 text-sm text-slate-400">
          Sistema Integrado de Gestão Tributária Municipal • SEFIN
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800 border border-slate-700 py-7 px-6 shadow-xl rounded-2xl sm:px-8">
          {/* Seletor de Modo de Acesso */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700 mb-6">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                limparErro();
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                modo === 'login'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>CPF / Senha</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModo('govbr');
                limparErro();
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                modo === 'govbr'
                  ? 'bg-[#1351B4] text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>gov.br</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModo('cadastro');
                limparErro();
              }}
              className={`py-2 px-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                modo === 'cadastro'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar</span>
            </button>
          </div>

          {erro && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* MODO 1: LOGIN OFICIAL COM CPF OU E-MAIL */}
          {modo === 'login' && (
            <form className="space-y-4" onSubmit={handleLoginPadrao}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  CPF ou E-mail Institucional
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="Digite seu CPF ou e-mail"
                    autoComplete="username"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {carregando ? 'Autenticando na SEFIN...' : 'Entrar no SITRIB'}
                {!carregando && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="pt-2 border-t border-slate-700/70">
                <button
                  type="button"
                  onClick={() => {
                    setModo('govbr');
                    limparErro();
                  }}
                  className="w-full py-2.5 px-4 bg-[#1351B4] hover:bg-[#0c3c8c] text-white font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar com <strong>gov.br</strong></span>
                </button>
              </div>
            </form>
          )}

          {/* MODO 2: AUTENTICAÇÃO GOV.BR (VALIDAÇÃO DE VÍNCULO SERVIDOR VS. CIDADÃO) */}
          {modo === 'govbr' && (
            <form className="space-y-4" onSubmit={handleLoginGovBr}>
              <div className="p-3.5 rounded-xl bg-[#1351B4]/15 border border-[#1351B4]/40 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                  <BadgeCheck className="w-4 h-4" /> Login Único Gov.br + Validação de Vínculo
                </div>
                O sistema valida sua identidade digital pelo CPF e cruza automaticamente com a base municipal para identificar se você é{' '}
                <strong className="text-white">Servidor/Auditor da SEFIN</strong> ou <strong className="text-white">Cidadão Contribuinte</strong>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  CPF (Conta gov.br)
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={cpfGov}
                    onChange={(e) => setCpfGov(e.target.value)}
                    placeholder="Somente números ou 000.000.000-00"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1351B4] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nome Completo (Opcional se já vinculado)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={nomeGov}
                    onChange={(e) => setNomeGov(e.target.value)}
                    placeholder="Nome conforme cadastro gov.br"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1351B4] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Selo de Confiabilidade gov.br
                </label>
                <select
                  value={nivelGov}
                  onChange={(e) => setNivelGov(e.target.value as 'OURO' | 'PRATA' | 'BRONZE')}
                  className="w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#1351B4] text-sm"
                >
                  <option value="OURO">Nível OURO (Biometria / Certificado Digital)</option>
                  <option value="PRATA">Nível PRATA (Bancos / SIGEPE / Servidor)</option>
                  <option value="BRONZE">Nível BRONZE (Cadastro Básico)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 px-4 bg-[#1351B4] hover:bg-[#0c3c8c] text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {carregando ? 'Validando vínculo no Gov.br...' : 'Validar e Entrar com gov.br'}
                {!carregando && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

          {/* MODO 3: CADASTRO DE NOVO USUÁRIO */}
          {modo === 'cadastro' && (
            <form className="space-y-3.5" onSubmit={handleCadastro}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={nomeCad}
                    onChange={(e) => setNomeCad(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  CPF
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={cpfCad}
                    onChange={(e) => setCpfCad(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={emailCad}
                    onChange={(e) => setEmailCad(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Telefone (Opcional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={telefoneCad}
                    onChange={(e) => setTelefoneCad(e.target.value)}
                    placeholder="(63) 99999-9999"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Criar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={senhaCad}
                    onChange={(e) => setSenhaCad(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {carregando ? 'Criando conta no SITRIB...' : 'Concluir Cadastro e Entrar'}
                {!carregando && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          SITRIB • Autenticação Protegida por RBAC & LGPD • UFT 2026
        </div>
      </div>
    </div>
  );
};
