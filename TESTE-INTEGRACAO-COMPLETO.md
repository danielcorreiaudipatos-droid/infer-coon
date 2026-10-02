# 🧪 GUIA COMPLETO DE TESTES — on.imob

## Objetivo
Testar TUDO que foi construído. Dados, funcionalidades, integrações, edge cases.

---

## 📋 Checklist de Testes

### ✅ MÓDULO 1: Autenticação & Login

```
[ ] Registrar novo usuário (email + senha)
    └─ Esperado: Conta criada, email de confirmação enviado

[ ] Fazer login com credenciais corretas
    └─ Esperado: Redirecionado ao dashboard

[ ] Tentar login com senha errada
    └─ Esperado: Erro "Senha incorreta", sem logar

[ ] Tentar login com email não registrado
    └─ Esperado: Erro "Usuário não existe"

[ ] Recuperar senha (forgot password)
    └─ Esperado: Email com link de reset recebido

[ ] Reset de senha com link inválido
    └─ Esperado: Erro "Link expirado ou inválido"

[ ] 2FA (two-factor authentication)
    └─ Esperado: SMS/app com código recebido
```

### ✅ MÓDULO 2: Branding

```
[ ] Upload logo (PNG, JPG, máx 2MB)
    └─ Esperado: Logo salvo e aparece no site

[ ] Upload logo inválido (muito grande)
    └─ Esperado: Erro "Arquivo muito grande"

[ ] Customizar cores
    └─ Esperado: Cores mudam em tempo real

[ ] Customizar nome da imobiliária
    └─ Esperado: Nome salvo e aparece em emails

[ ] Branding persiste após logout/login
    └─ Esperado: Mesmo branding quando volta
```

### ✅ MÓDULO 3: Importação de Dados

```
[ ] Importar leads de Jetimob (CSV)
    ├─ 250 leads com dados completos
    └─ Esperado: 250 leads importados, 0 erros

[ ] Importar imóveis de Imobisoft (Excel)
    ├─ 100 imóveis com dados completos
    └─ Esperado: 100 imóveis importados

[ ] Importar com campos faltando (dados obrigatórios)
    ├─ 50 leads, 10 sem nome
    └─ Esperado: 40 importados, 10 erro (mostra quais)

[ ] Importar CSV com encoding errado
    ├─ Arquivo em ANSI (não UTF-8)
    └─ Esperado: Erro "Encoding inválido"

[ ] Importar duplicatas
    ├─ Mesmo cliente 2x no arquivo
    └─ Esperado: Sistema remove duplicata, importa 1
```

### ✅ MÓDULO 4: Cadastro de Leads

```
[ ] Cadastrar lead manualmente (dados básicos)
    ├─ Nome, telefone, email
    └─ Esperado: Lead criado e aparece no CRM

[ ] Cadastrar lead sem nome
    └─ Esperado: Erro "Nome obrigatório"

[ ] Adicionar nota ao lead
    └─ Esperado: Nota aparece no histórico

[ ] Alterar status lead (Prospect → Negociando → Vendido)
    └─ Esperado: Status muda, comissão é calculada

[ ] Lead criado via WhatsApp automático
    ├─ Sistema recebe mensagem
    └─ Esperado: Lead criado automaticamente
```

### ✅ MÓDULO 5: Cadastro de Imóveis

```
[ ] Cadastrar imóvel (dados mínimos)
    ├─ Título, endereço, tipo
    └─ Esperado: Imóvel criado, ID gerado

[ ] Cadastrar sem endereço
    └─ Esperado: Erro "Endereço obrigatório"

[ ] Upload de 10 fotos
    ├─ Arquivos JPG/PNG válidos
    └─ Esperado: Todas salvas, pode ordenar

[ ] Upload foto muito grande (>5MB)
    └─ Esperado: Erro "Arquivo muito grande"

[ ] Editar imóvel (trocar preço, quartos)
    └─ Esperado: Alterações salvas

[ ] Deletar imóvel
    └─ Esperado: Imóvel removido, fotos deletadas
```

### ✅ MÓDULO 6: Avaliação Científica

```
[ ] Gerar avaliação para imóvel novo
    ├─ Dados: Apto, 2 quartos, 100m², São Paulo
    ├─ Tempo esperado: 5 segundos
    └─ Esperado: PDF gerado, valor min/max calculado

[ ] Gerar avaliação para diferente tipo
    ├─ Casa, 3 quartos, 200m², zona oeste
    └─ Esperado: Valor diferente (maior), PDF correto

[ ] Tentar gerar sem dados mínimos
    ├─ Faltam quartos/banheiros/área
    └─ Esperado: Erro "Dados insuficientes"

[ ] Reavaliação (após corrigir dados)
    ├─ Edita área de 100 → 110m²
    └─ Esperado: Novo PDF com valor ajustado

[ ] Intervalo de confiança 80%
    ├─ Valor min/max deve estar correto
    └─ Esperado: Diferença realistic (±10-15%)
```

### ✅ MÓDULO 7: Integrações Externas

```
[ ] Publicar em VivaReal (primeira vez)
    ├─ Autorizar on.imob na conta VivaReal
    ├─ Publicar imóvel
    └─ Esperado: Imóvel aparece em VivaReal em 30 seg

[ ] Atualizar preço em VivaReal
    ├─ Muda preço em on.imob
    ├─ Clica "Sincronizar"
    └─ Esperado: VivaReal atualiza em 30 seg

[ ] Despublicar imóvel
    ├─ Muda status para "Vendido"
    └─ Esperado: Desaparece do VivaReal em 1 min

[ ] ZapImóveis (mesmo que VivaReal)
    └─ Esperado: Mesmo funcionamento

[ ] Open Banking (conectar banco)
    ├─ Autorizar Itaú/Bradesco/Santander
    └─ Esperado: Saldo atualizado em tempo real

[ ] Conectar Open Banking com banco errado
    └─ Esperado: Erro "CPF não corresponde"
```

### ✅ MÓDULO 8: Pagamentos

```
[ ] PIX (receber pagamento)
    ├─ Cliente envia PIX de R$ 1.000
    ├─ Você tem chave PIX ativa
    └─ Esperado: Dinheiro chega em 30 seg, sistema registra

[ ] Boleto (receber pagamento)
    ├─ Gera boleto de R$ 2.000
    ├─ Cliente paga em 2 dias
    └─ Esperado: Pagamento reconhecido, dinheiro chega

[ ] Cartão (receber pagamento)
    ├─ Cliente paga R$ 500 com cartão
    ├─ Stripe autoriza
    └─ Esperado: Dinheiro chega em 3 dias, taxa 2.99%

[ ] Pagamento recusado
    ├─ Cartão expirado / sem fundo
    └─ Esperado: Sistema avisa cliente, guarda para retry

[ ] Split automático (95/5)
    ├─ Cliente paga R$ 10.000
    ├─ Split ativo para proprietário
    └─ Esperado: Você recebe R$ 9.500, proprietário R$ 500
```

### ✅ MÓDULO 9: WhatsApp IA

```
[ ] Cliente envia mensagem simples
    ├─ Mensagem: "Olá"
    └─ Esperado: IA responde com saudação

[ ] Cliente pergunta sobre imóvel
    ├─ Mensagem: "Vocês têm apto em Pinheiros?"
    └─ Esperado: IA sugere resposta relevante

[ ] Cliente pede agendar vistoria
    ├─ Mensagem: "Posso ver o imóvel?"
    └─ Esperado: IA sugere "Qual dia?", você aprova

[ ] Conversa persistente
    ├─ 10 mensagens no mesmo chat
    ├─ IA lembra contexto (nome, interesse)
    └─ Esperado: Respostas coerentes

[ ] Lead criado automaticamente
    ├─ Novo número no WhatsApp
    ├─ Sistema recebe mensagem
    └─ Esperado: Lead criado, conectado ao chat

[ ] IA não responde (erro Gemini)
    └─ Esperado: Sistema tenta novamente (retry automático)
```

### ✅ MÓDULO 10: Vistoria

```
[ ] Vistoria básica (5 fotos, 1 nota)
    ├─ Abre app
    ├─ Seleciona imóvel
    ├─ Tira 5 fotos
    ├─ Adiciona nota: "Imóvel em bom estado"
    └─ Esperado: PDF gerado em 30 seg

[ ] Vistoria com problemas marcados
    ├─ Marca: "Infiltração na sala"
    ├─ Marca: "Rachadura no piso"
    └─ Esperado: Checklist aparece no PDF

[ ] GPS funciona
    ├─ Cada foto tem coordenadas
    └─ Esperado: Mapa com fotos no relatório

[ ] Vistoria offline (app sem internet)
    ├─ Tira fotos sem internet
    ├─ Quando volta online
    └─ Esperado: Sincroniza automaticamente

[ ] Enviar vistoria para cliente
    ├─ Clica "Enviar Relatório"
    ├─ Email + WhatsApp automático
    └─ Esperado: Cliente recebe PDF
```

### ✅ MÓDULO 11: Sites Automáticos

```
[ ] Site gerado para imóvel
    ├─ Imóvel publicado
    ├─ Sistema gera site em 5 seg
    └─ Esperado: Site acessível em link único

[ ] Site tem todas as informações
    ├─ Fotos, descrição, preço
    ├─ Localização no Google Maps
    ├─ WhatsApp/Email CTA
    └─ Esperado: Tudo aparece

[ ] SEO funciona
    ├─ Abre site
    ├─ Inspeciona página (Ctrl+U)
    └─ Esperado: Schema.org JSON-LD presente

[ ] Mobile responsivo
    ├─ Abre site no celular
    └─ Esperado: Layout perfeito no mobile

[ ] Site carrega rápido
    ├─ Usa Google PageSpeed Insights
    └─ Esperado: >90 em desktop, >80 em mobile
```

### ✅ MÓDULO 12: Dashboard Financeiro

```
[ ] Dashboard mostra MRR correto
    ├─ Fez 3 vendas (R$ 1k, R$ 2k, R$ 3k)
    └─ Esperado: Total = R$ 6.000 este mês

[ ] Comissão por corretor está correta
    ├─ João fez 2 vendas (R$ 5k + R$ 5k)
    ├─ Maria fez 1 venda (R$ 10k)
    └─ Esperado: João = R$ 10k, Maria = R$ 10k

[ ] Cash flow 12 meses
    ├─ Gráfico mostra receita por mês
    └─ Esperado: Crescimento linear/exponencial

[ ] Alertas de inadimplência
    ├─ Boleto venceu 5 dias atrás
    └─ Esperado: Alerta no dashboard

[ ] Exportar relatório (PDF/Excel)
    ├─ Período: últimos 3 meses
    └─ Esperado: Arquivo baixado com dados corretos
```

### ✅ MÓDULO 13: Edge Cases & Erros

```
[ ] Sistema sem internet
    └─ Esperado: App salva dados localmente, sincroniza depois

[ ] Banco de dados desconectado
    └─ Esperado: Erro gracioso, não crasheia

[ ] Gemini API quota excedida
    └─ Esperado: Mensagem "Sistema ocupado, tente novamente"

[ ] Upload de arquivo corrompido
    └─ Esperado: Erro "Arquivo inválido"

[ ] Múltiplas requisições simultâneas
    ├─ 10 uploads de imóvel ao mesmo tempo
    └─ Esperado: Todos processados, sem conflitos

[ ] Usuário deleta conta
    ├─ Todos os dados devem ser removidos
    └─ Esperado: Deletado em 24h, sem recuperação
```

---

## 🗄️ Dados de Teste (Fixtures)

### Leads de Teste

```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "telefone": "11999999999",
    "email": "joao@email.com",
    "tipo_imovel": "apto",
    "cidade": "São Paulo",
    "interesse": "compra",
    "status": "prospect",
    "data_criacao": "2026-10-01"
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    "telefone": "11988888888",
    "email": "maria@email.com",
    "tipo_imovel": "casa",
    "cidade": "São Paulo",
    "interesse": "compra",
    "status": "negociando",
    "data_criacao": "2026-10-01"
  },
  {
    "id": 3,
    "nome": "Carlos Costa",
    "telefone": "11977777777",
    "email": "carlos@email.com",
    "tipo_imovel": "comercial",
    "cidade": "Rio de Janeiro",
    "interesse": "aluguel",
    "status": "vendido",
    "data_criacao": "2026-09-01"
  }
]
```

### Imóveis de Teste

```json
[
  {
    "id": 1,
    "titulo": "Apto 2 quartos Pinheiros",
    "endereco": "Rua das Flores, 123",
    "cidade": "São Paulo",
    "cep": "05429-000",
    "tipo": "apto",
    "dormitorios": 2,
    "banheiros": 1,
    "area_total": 100.5,
    "preco": 500000,
    "descricao": "Apto amplo, bem localizado",
    "status": "ativo"
  },
  {
    "id": 2,
    "titulo": "Casa 3 quartos Zona Oeste",
    "endereco": "Avenida Brasil, 456",
    "cidade": "São Paulo",
    "cep": "05678-000",
    "tipo": "casa",
    "dormitorios": 3,
    "banheiros": 2,
    "area_total": 200.0,
    "preco": 800000,
    "descricao": "Casa nova com piscina",
    "status": "ativo"
  },
  {
    "id": 3,
    "titulo": "Loja Centro",
    "endereco": "Rua Direita, 789",
    "cidade": "São Paulo",
    "cep": "01234-567",
    "tipo": "comercial",
    "area_total": 150.0,
    "preco": 300000,
    "descricao": "Loja bem localizada, movimento",
    "status": "vendido"
  }
]
```

### Proprietários/Locadores

```json
[
  {
    "id": 1,
    "nome": "Antonio Silva",
    "telefone": "11966666666",
    "email": "antonio@email.com",
    "cpf": "12345678900",
    "chave_pix": "antonio@email.com",
    "imovel_id": 1
  },
  {
    "id": 2,
    "nome": "Patricia Costa",
    "telefone": "11955555555",
    "email": "patricia@email.com",
    "cpf": "98765432100",
    "chave_pix": "11955555555",
    "imovel_id": 2
  }
]
```

### Transações (Repasses)

```json
[
  {
    "id": 1,
    "imovel_id": 1,
    "proprietario_id": 1,
    "valor_total": 10000,
    "valor_imobiliaria": 9500,
    "valor_proprietario": 500,
    "tipo_pagamento": "pix",
    "status": "pago",
    "data_transacao": "2026-10-01",
    "data_repasse": "2026-10-01"
  },
  {
    "id": 2,
    "imovel_id": 2,
    "proprietario_id": 2,
    "valor_total": 20000,
    "valor_imobiliaria": 19000,
    "valor_proprietario": 1000,
    "tipo_pagamento": "boleto",
    "status": "pago",
    "data_transacao": "2026-09-28",
    "data_repasse": "2026-10-01"
  }
]
```

---

## 🚀 Como Executar Testes

### Passo 1: População de Dados

```bash
# Inserir dados de teste no banco
sqlite3 on_imob.db < test_data.sql

# Ou via API:
curl -X POST http://localhost:8000/api/test/seed \
  -H "Content-Type: application/json"
```

### Passo 2: Rodar Testes Unitários

```bash
pytest tests/ -v
# Resultado: X passed, 0 failed
```

### Passo 3: Rodar Testes de Integração

```bash
pytest tests/integration/ -v --tb=short
# Resultado: X passed, 0 failed
```

### Passo 4: Manual Testing (Checklist Acima)

```
Para cada item do checklist:
1. Executar ação
2. Verificar resultado esperado
3. ✓ ou ✗ no checklist
4. Se ✗, documentar bug
```

### Passo 5: Performance Testing

```bash
# Teste de carga: 100 requisições simultâneas
locust -f locustfile.py --host=http://localhost:8000

# Resultado esperado:
# - Tempo médio resposta: <500ms
# - P95: <1000ms
# - Sem timeouts
```

---

## 🐛 Bugs Encontrados & Correções

| Bug | Severidade | Status | Solução |
|-----|---|---|---|
| [Bug será preenchido após testes] | - | - | - |

---

## ✅ Resultado Final

```
Após completar todos os testes:

TOTAL: X testes
PASSED: X ✓
FAILED: 0 ✗
SUCCESS RATE: 100%

STATUS: ✅ APROVADO PARA VENDA
```

---

Este documento será atualizado conforme os testes são executados.
