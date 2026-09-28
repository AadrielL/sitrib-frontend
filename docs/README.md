# Documentação Oficial do Frontend — SITRIB

**Sistema Integrado de Gestão Tributária Municipal (Palmas / TO)**  
**Responsável pelo Frontend:** Adriel Morais (Product Owner / Desenvolvedor)  
**Tecnologias:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React

---

## 1. Visão Geral

O frontend do **SITRIB** foi desenvolvido como uma Single Page Application (SPA) moderna, desacoplada e independente do backend em Python. Ele fornece uma interface institucional completa e interativa para gestores fiscais, auditores e cidadãos, consumindo as regras de negócio de cálculo tributário, fila de prioridade (Max-Heap) e rede de relacionamentos patrimoniais (Grafo).

### Por que o Frontend é Desacoplado?
1. **Independência de Desenvolvimento:** Permite que a interface evolua sem depender das alterações de banco de dados ou controllers em Python feitas pelos outros membros da equipe.
2. **Repositório Próprio:** A pasta `frontend/` está pronta para ter seu próprio repositório no GitHub (`sitrib-frontend`), sem poluir o repositório acadêmico da disciplina.
3. **Modo Híbrido (Mock + API):** Funciona 100% de forma autônoma utilizando a massa de dados realista espelhada de `seeds/mock_data.py`. Quando o backend expuser endpoints RESTful na Sprint 3, a conexão será imediata via `ApiService`.

---

## 2. Início Rápido

### Pré-requisitos
* **Node.js:** versão 20+ ou 24+
* **npm:** versão 10+ ou 11+

### Comandos de Execução
No diretório `frontend/`:

```powershell
# 1. Instalar as dependências
npm install

# 2. Executar em modo de desenvolvimento (Live Reload)
npm run dev

# 3. Compilar para produção (Type-check e Build otimizado)
npm run build

# 4. Pré-visualizar o build de produção localmente
npm run preview
```

Após rodar `npm run dev`, abra no navegador: `http://localhost:5173`.

---

## 3. Mapa da Documentação Técnica

Para facilitar o entendimento de toda a equipe e permitir manutenções futuras sem dificuldades, a documentação está dividida nos seguintes guias:

1. **[Arquitetura e Fluxo de Dados](arquitetura_e_fluxo.md):** Estrutura de diretórios, separação em camadas e gerenciamento de estado.
2. **[Guia de Componentes e Páginas](guia_componentes_e_paginas.md):** Explicação detalhada de cada página (`Dashboard`, `BuscaFiscal`, `FilaCobrancaView`, `SimuladorTributario`) e componentes.
3. **[Integração com o Backend em Python](integracao_com_backend.md):** Como o frontend consome e espelha o Max-Heap, a Tabela Hash, o Grafo e os Seeds do backend.
4. **[Guia de Estilização e Design System](guia_estilizacao_e_design.md):** Cores institucionais, tipografia, badges e convenções do Tailwind CSS v4.
