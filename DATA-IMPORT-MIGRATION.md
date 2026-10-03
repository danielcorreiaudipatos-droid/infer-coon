# 📥 MECANISMO DE IMPORTAÇÃO DE DADOS — on.imob

## 🎯 Objetivo
Permitir que clientes migrem de **Jetimob**, **Imobisoft** ou **SICADI** para **on.imob** sem perder dados e com **ZERO fricção**.

---

## ⚡ Como Funciona

### **Passo 1: Preview (Sem Salvar)**

Cliente faz upload do arquivo CSV/Excel da plataforma antiga:

```
POST /api/import/preview
├─ arquivo: dados_jetimob.csv
├─ plataforma_origem: "jetimob"
└─ tipo_dados: "leads" ou "imoveis"
```

**Sistema retorna:**
```json
{
  "total_linhas": 250,
  "importaveis": 245,
  "campos_mapeados": ["nome", "telefone", "email", "tipo_imovel"],
  "campos_obrigatorios_faltando": {
    "nome": [5, 12, 45],  // linhas com campo vazio
    "endereco": [120]
  },
  "preview": [
    {"nome": "João Silva", "telefone": "11999999", "email": "joao@email.com"},
    {"nome": "Maria Santos", "telefone": null, "email": "maria@email.com"}
  ],
  "avisos": [
    "⚠️ Campo 'nome' vazio em 3 linhas",
    "⚠️ Campo 'endereco' vazio em 1 linha"
  ]
}
```

---

### **Passo 2: Validação (Com Checklist)**

Cliente vê:
- ✅ Campos que podem ser importados
- ⚠️ Campos faltando (obrigatórios)
- ❌ Linhas com erro (deve corrigir)

**Checklist interativo:**
```
[ ] 245 registros estão prontos para importar
[ ] 5 registros têm dados faltando (corrigir ou pular)
[ ] Revisar campo "email" (será deixado em branco se vazio)
[ ] Confirmar importação
```

---

### **Passo 3: Executar Importação**

```
POST /api/import/execute
├─ arquivo: dados_jetimob.csv
├─ plataforma_origem: "jetimob"
├─ tipo_dados: "leads"
└─ escritorio_id: "123"
```

**Sistema salva no banco e retorna:**
```json
{
  "status": "importacao_concluida",
  "ids_importados": [1, 2, 3, ..., 245],
  "relatorio": {
    "total_leads": 250,
    "leads_importados": 245,
    "leads_erro": 5,
    "campos_obrigatorios_faltando": {
      "nome": [5, 12, 45],
      "endereco": [120]
    }
  },
  "proximos_passos": [
    "✓ 245 leads importados!",
    "→ Você tem 5 registros com dados faltando",
    "→ Clique 'Completar dados' para editar",
    "→ Depois publique no VivaReal/ZapImóveis"
  ]
}
```

---

## 🔄 Mapeamento de Campos

### **Jetimob → on.imob**

| Jetimob | on.imob | Tipo | Obrigatório |
|---------|---------|------|-------------|
| `nome_cliente` | `nome` | string | ✅ |
| `telefone_cliente` | `telefone` | string | ❌ |
| `email_cliente` | `email` | string | ❌ |
| `tipo_imovel_interesse` | `tipo_imovel` | string | ❌ |
| `cidade_interesse` | `cidade` | string | ❌ |
| `tipo_interesse` | `interesse` | string | ❌ |
| `status_lead` | `status` | string | ❌ |
| `data_cadastro` | `data_criacao` | datetime | ❌ |
| `observacoes` | `notas` | string | ❌ |

### **Imobisoft → on.imob**

| Imobisoft | on.imob | Tipo | Obrigatório |
|-----------|---------|------|-------------|
| `nome` | `nome` | string | ✅ |
| `celular` | `telefone` | string | ❌ |
| `email` | `email` | string | ❌ |
| `tipo_imovel` | `tipo_imovel` | string | ❌ |
| `status` | `status` | string | ❌ |
| `notas` | `notas` | string | ❌ |

### **SICADI → on.imob**

| SICADI | on.imob | Tipo | Obrigatório |
|--------|---------|------|-------------|
| `nome_cliente` | `nome` | string | ✅ |
| `telefone` | `telefone` | string | ❌ |
| `email` | `email` | string | ❌ |
| `tipo_imovel` | `tipo_imovel` | string | ❌ |
| `status` | `status` | string | ❌ |

---

## 📊 Campos Obrigatórios vs Opcionais

### **Leads (Contatos)**

| Campo | Obrigatório | Exemplos |
|-------|-------------|----------|
| `nome` | ✅ | João Silva |
| `telefone` | ❌ | 11999999999 |
| `email` | ❌ | joao@email.com |
| `tipo_imovel` | ❌ | apto, casa, comercial |
| `cidade` | ❌ | São Paulo |
| `interesse` | ❌ | venda, aluguel, compra |
| `status` | ❌ | prospect, negociando, vendido |
| `notas` | ❌ | Texto livre |

### **Imóveis (Propriedades)**

| Campo | Obrigatório | Exemplos |
|-------|-------------|----------|
| `titulo` | ✅ | Apto 2 quartos em Pinheiros |
| `endereco` | ✅ | Rua das Flores, 123, São Paulo |
| `tipo` | ✅ | apto, casa, comercial, terreno |
| `dormitorios` | ❌ | 2, 3, 4 |
| `banheiros` | ❌ | 1, 2, 3 |
| `area_total` | ❌ | 100.5 |
| `preco` | ❌ | 500000 |
| `descricao` | ❌ | Texto livre |
| `status` | ❌ | ativo, vendido, alugado |

---

## 🛡️ Processamento & Validação

### **1. Limpeza de Dados**

```python
# Remover espaços em branco
"  João Silva  " → "João Silva"

# Normalizar telefones
"(11) 9999-9999" → "11999999999"

# Normalizar datas
"15/10/2023" → "2023-10-15T00:00:00"

# Remover duplicatas
(João Silva, 11999999) + (João Silva, 11999999) → 1 registro
```

### **2. Validação**

```
✓ Campo obrigatório preenchido
✓ Formato válido (telefone, email, data)
✓ Sem duplicatas
✓ Caracteres válidos (sem quebras de linha)
```

### **3. Campos em Branco**

```
Opcional:
  Campo vazio → Não importa (deixa em branco no on.imob)
  
Obrigatório:
  Campo vazio → ERRO (linha não importada)
  Deve corrigir ou pular linha
```

---

## 🎨 Interface de Importação

### **Tela 1: Upload**

```
┌─────────────────────────────────────┐
│  IMPORTAR DADOS DA SUA PLATAFORMA   │
├─────────────────────────────────────┤
│                                     │
│  De qual plataforma você vem?       │
│  ○ Jetimob                          │
│  ○ Imobisoft                        │
│  ○ SICADI                           │
│                                     │
│  O que quer importar?               │
│  ○ Leads (contatos)                 │
│  ○ Imóveis (propriedades)           │
│                                     │
│  [  Selecione arquivo CSV/Excel  ]  │
│                                     │
│           [ PRÓXIMO ]               │
│                                     │
└─────────────────────────────────────┘
```

### **Tela 2: Preview**

```
┌─────────────────────────────────────┐
│  PREVIEW DA IMPORTAÇÃO              │
├─────────────────────────────────────┤
│                                     │
│  Total de registros: 250            │
│  Prontos para importar: 245 ✓       │
│  Com erro: 5 ⚠️                     │
│                                     │
│  ❌ Campos obrigatórios faltando:   │
│  ├─ "nome" em linhas: 5, 12, 45     │
│  └─ "endereco" em linha: 120        │
│                                     │
│  📝 Preview (primeiros 5):          │
│  ├─ João Silva | 11999999 | prospect│
│  ├─ Maria Santos | | negociando    │
│  ├─ [...]                          │
│                                     │
│  [ Corrigir arquivo ] [ Importar ]  │
│                                     │
└─────────────────────────────────────┘
```

### **Tela 3: Confirmação**

```
┌─────────────────────────────────────┐
│  IMPORTAÇÃO CONCLUÍDA! ✅            │
├─────────────────────────────────────┤
│                                     │
│  ✅ 245 leads importados             │
│  ⚠️ 5 com dados faltando             │
│                                     │
│  📋 Próximos passos:                │
│  1. Revisar dados faltando          │
│  2. Editar registros com erro       │
│  3. Publicar no VivaReal/ZapImóveis │
│                                     │
│  [ Ver dados importados ]           │
│  [ Editar registros com erro ]      │
│  [ Publicar agora ]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 📈 Impacto no Mercado

### **Por que isso é CRÍTICO?**

1. **Reduz fricção de migração**
   - Antes: Reentrar 250 leads = 1 dia de trabalho
   - Agora: Upload arquivo = 5 minutos

2. **Switching cost baixo**
   - Clientes de Jetimob/Imobisoft não têm medo de mudar
   - "Todos meus dados vêm comigo"

3. **Vantagem competitiva**
   - Jetimob não tem importação
   - Imobisoft tem, mas é complexa
   - on.imob tem, e é simples

4. **Crescimento rápido**
   - Cada cliente que muda leva 100-500 leads
   - Esses leads trazem imóveis
   - Imóveis trazem comissões

### **Estimativa de Impacto:**

```
Cliente médio em Jetimob:
├─ 200 leads
├─ 50 imóveis ativos
└─ ~R$ 30k/ano em comissão

Se você ganha 50 clientes migrados:
├─ 10.000 leads importados
├─ 2.500 imóveis importados
├─ R$ 1.5M/ano em potencial de comissão
└─ Valor ENORME para on.imob

Seu LTV por cliente sai de:
├─ R$ 4.788/ano (novo)
└─ Para R$ 30k+/ano (migrado)
```

---

## 🚀 Diferenciais Implementados

```
✅ Mapeamento automático de campos (Jetimob, Imobisoft, SICADI)
✅ Preview antes de salvar (zero risco)
✅ Validação completa (campos obrigatórios, duplicatas, formato)
✅ Limpeza de dados (telefones, datas, espaços)
✅ Relatório detalhado (o que importou, o que não)
✅ Checklist de dados faltando
✅ Interface simples (3 telas)
✅ Templates CSV com exemplos
✅ API para integração programática
```

---

## 📝 Endpoints Disponíveis

```
GET  /api/import/status-plataformas
     ├─ Plataformas suportadas
     ├─ Campos mapeados
     └─ Formatos suportados

POST /api/import/preview
     ├─ Preview (sem salvar)
     ├─ Validação
     └─ Relatório de erros

POST /api/import/execute
     ├─ Importação de verdade
     ├─ Salva no banco
     └─ Retorna IDs

GET  /api/import/template-download/{plataforma}
     └─ Baixa template CSV
```

---

## 💡 Caso de Uso: Migração Real

### **Cliente em Jetimob quer mudar**

```
1. Cliente entra em on.imob
2. Clica "Importar dados"
3. Seleciona "Jetimob"
4. Faz download dos leads em Jetimob (CSV)
5. Upload em on.imob
6. Vê preview: 245 leads prontos, 5 com erro
7. Corrigi os 5 em Excel (2 minutos)
8. Upload de novo
9. Clica "Importar"
10. Tela: "✓ 250 leads importados!"
11. Vai para dashboard, começa a usar

Total de tempo: ~10 minutos
Resultado: Cliente 100% migrado, dados intactos
```

---

## ⚠️ Dados Não Importados

Campos que não tem equivalente (deixam em branco):

```
Jetimob                  on.imob
─────────────────────────────────
(não mapeia)        ←    nota_fiscal
(não mapeia)        ←    vistoria
(não mapeia)        ←    split_config
(não mapeia)        ←    comissao_percentual
```

Cliente pode preencher depois manualmente (opcional).

---

## 🎯 Positioning

**Mensagem de venda:**

> "Venha com seus dados. Não deixe nada para trás.
>
> Em 10 minutos, 250 leads estão em on.imob.
>
> Jetimob não deixa você levar nada.
> Imobisoft exporta, mas é manual.
> on.imob? Clique. Pronto."

Isso é um **game-changer** para ganhar mercado.
