# Guia de Estilização e Design System

## 1. Identidade Visual Institucional

O SITRIB foi concebido com uma linguagem visual sóbria, elegante e oficial, típica de portais fazendários e secretarias de finanças de grandes capitais:

* **Cor Primária (Ações e Destaques):** `Emerald` (Esmeralda / Verde Institucional)
  * `bg-emerald-600`, `hover:bg-emerald-700`
  * Representa regularidade fiscal, sustentabilidade e integridade municipal.
* **Cor Secundária (Fundo Escuro e Estrutura):** `Slate` (Ardósia / Azul Acentuado)
  * `bg-slate-900` no Navbar e cards de destaque; `bg-slate-50` no plano de fundo geral.
* **Cores Semânticas de Alerta:**
  * **Regularidade / Sucesso:** `bg-emerald-100 text-emerald-800`
  * **Alerta / Débito Pendente:** `bg-amber-100 text-amber-800`
  * **Execução Fiscal / Alto Risco:** `bg-rose-100 text-rose-800`

---

## 2. Tipografia e Legibilidade

* **Fonte Principal:** Família Inter / sans-serif do sistema.
* **Campos Numéricos e Documentos:** Fonte monoespaçada (`font-mono`):
  * CPF, CNPJ, Inscrição Imobiliária (CCI) e Códigos de Débito utilizam fontes de largura fixa para facilitar a leitura rápida de dígitos e verificação de fraudes.

---

## 3. Ícones do Sistema

A biblioteca **Lucide React** foi selecionada pela leveza e consistência geométrica:
* `Building2`: Marca institucional da Prefeitura / Secretaria de Finanças.
* `LayoutDashboard`: Painel de Indicadores (RF10).
* `Search`: Consulta cadastral e fiscal unificada (RF06).
* `ListOrdered`: Fila de prioridade de cobrança (Heap).
* `Calculator`: Simulador tributário (RF05/06/07).
* `Scale`: Processos judiciais na Vara de Execução Fiscal.
* `ShieldCheck`: Selo de conformidade com LGPD e TLS 1.3.

---

## 4. Como Adicionar Novos Estilos e Componentes

1. Mantenha os novos componentes dentro de `src/components/`.
2. Utilize exclusivamente classes de utilitário do Tailwind CSS para evitar conflitos de escopo CSS.
3. Garanta que botões de ação e links possuam estados claros de `hover`, `active` e `disabled`.
