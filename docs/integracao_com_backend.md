# Integração do Frontend com o Backend em Python

Este guia explica como a camada do frontend se conecta conceitualmente e tecnicamente com os módulos desenvolvidos no backend em Python (`projetointegradorUFT`).

---

## 1. Mapeamento das Estruturas da Sprint 2

| Estrutura no Backend (Python) | Componente no Frontend (React/TS) | Como se Comunicam / Espelham |
|---|---|---|
| **Max-Heap** (`src/fila_cobranca.py`) | `src/pages/FilaCobrancaView.tsx` | O backend gerencia o heap `(-score, cpf)`; o frontend consome a lista ordenada via `ApiService.listarFilaCobranca()`. |
| **Tabela Hash** (`src/tabela_hash.py`) | `src/services/api.ts` | O backend faz a busca indexada em $O(1)$; o frontend consome débitos imediatos sem varrer coleções lentas. |
| **Grafo** (`src/grafo.py`) | `src/pages/BuscaFiscal.tsx` | O backend mapeia Contribuinte $\rightarrow$ Imóveis $\rightarrow$ Processos; o frontend renderiza visualmente essa teia de relações. |
| **Seeds** (`seeds/mock_data.py`) | `src/services/mockData.ts` | Conjunto idêntico de contribuintes de Palmas/TO, débitos de IPTU/ISS e processos de execução fiscal. |
| **BuscaService** (`src/services/busca_service.py`) | `ApiService.buscarContribuinte` | Mesmas validações de 11 dígitos (CPF) e 14 dígitos (CNPJ) e mesmas mensagens de erro para documentos não encontrados. |

---

## 2. Contrato de Endpoints RESTful para a Sprint 3

Quando a equipe (Gabriel, João Pedro e Rayssa) implementar a camada de Controllers e endpoints HTTP no backend (usando FastAPI ou Flask), o `src/services/api.ts` consumirá as seguintes rotas:

### 1. `GET /api/v1/contribuintes/{cpf_cnpj}`
* **Parâmetro:** `cpf_cnpj` (com ou sem pontuação).
* **Resposta Esperada (JSON):**
```json
{
  "contribuinte": {
    "nome": "Carlos Eduardo Siqueira",
    "cpf_cnpj": "123.456.789-01",
    "email": "carlos.siqueira@email.com",
    "telefone": "(63) 98111-2030",
    "tipo_pessoa": "FISICA"
  },
  "imoveis": [
    {
      "inscricao_cci": "CCI-104-NORTE-01",
      "endereco": "Quadra 104 Norte, Alameda 02, Lote 15",
      "tipo_imovel": "RESIDENCIAL",
      "valor_venal": 280000.0,
      "bairro": "Plano Diretor Norte",
      "cep": "77006-020"
    }
  ],
  "dividas": [
    {
      "codigo_debito": "DEB-2023-IPTU-104",
      "ano_exercicio": 2023,
      "valor_original": 2450.0,
      "juros_multa": 380.5,
      "status": "ATIVO",
      "tipo_tributo": "IPTU"
    }
  ],
  "processos": [
    {
      "numero_processo": "0012345-67.2023.8.27.2729",
      "vara": "1ª Vara de Execução Fiscal e Tributária de Palmas",
      "data_autuacao": "2023-04-18",
      "codigo_debito": "DEB-2022-IPTU-104",
      "status_processo": "EM_ANDAMENTO"
    }
  ]
}
```

### 2. `GET /api/v1/cobranca/fila-prioridade`
* **Retorno:** Array de objetos contendo `score`, `cpf_cnpj`, `nome`, `valor_total` e `tem_processo_judicial`, ordenados decrescente pelo Max-Heap.

### 3. `POST /api/v1/tributos/simular-reajuste`
* **Payload:**
```json
{
  "tributo": "IPTU",
  "aliquota_atual": 1.25,
  "aliquota_proposta": 1.5,
  "base_calculo": 200000000.0
}
```

---

## 3. Como Ativar o Backend Real no Frontend

No arquivo `frontend/src/services/api.ts`, existe a constante `USAR_BACKEND_REAL`:
```typescript
const USAR_BACKEND_REAL = import.meta.env.VITE_USAR_API === 'true';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
```

Para conectar ao servidor Python:
1. Crie um arquivo `frontend/.env`:
   ```env
   VITE_USAR_API=true
   VITE_API_URL=http://localhost:8000/api/v1
   ```
2. Inicie o servidor Python no backend.
3. O frontend automaticamente chaveará do modo mock em memória para as chamadas HTTP reais via `fetch`.
