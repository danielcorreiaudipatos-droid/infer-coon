# RD Station API - Planos e Recomendação

## O que é RD Station?

RD Station é um banco de dados com **500.000+ empresas brasileiras verificadas** com informações completas:
- Razão Social
- CNPJ
- Endereço completo
- Telefone
- Email de contato
- Setor
- Número de funcionários
- Faturamento estimado

**Totalmente legal** sob LGPD (não é web scraping).

---

## Comparação de Planos

### Plano Básico - **R$ 99/mês** ✅ (RECOMENDADO para começar)

| Recurso | Incluído |
|---------|----------|
| **Dados de Empresas** | Até 10.000 registros/mês |
| **API Calls** | 100 requisições/dia |
| **Atualização de Dados** | Semanal |
| **Suporte** | Email |
| **Tempo de Resposta API** | < 2 segundos |

**Ideal para:** ONZAP começando (100-1000 buscas/dia)

**Caso de uso:** User abre ONZAP, procura "Pizzaria em SP" → API RD Station retorna 500 pizzarias com telefone/email → Envia WhatsApp automático

---

### Plano Growth - **R$ 299/mês** 

| Recurso | Incluído |
|---------|----------|
| **Dados de Empresas** | Até 50.000 registros/mês |
| **API Calls** | 500 requisições/dia |
| **Atualização de Dados** | A cada 3 dias |
| **Suporte** | Chat + Email |
| **Webhook** | Notificações em tempo real |

**Ideal para:** Crescimento (1000-5000 buscas/dia)

---

### Plano Enterprise - **Custom (R$ 1.500+/mês)**

| Recurso | Incluído |
|---------|----------|
| **Dados de Empresas** | Ilimitado |
| **API Calls** | Sem limite |
| **Atualização** | Tempo real |
| **Suporte** | Dedicated account manager |
| **SLA** | 99.9% uptime garantido |

**Ideal para:** Escala massiva (10.000+ buscas/dia)

---

## Recomendação para Infer Coon

### Fase 1 (Semana 1-4) - **Plano Básico R$ 99/mês** ✅

**Por quê?**
- ONZAP precisa de ~100 buscas de empresas/dia
- 100 req/dia × 30 dias = 3.000 requisições/mês (dentro do limite)
- R$ 99 é viável para validar o mercado

**Estratégia:**
1. User abre ONZAP
2. Digita: "Pizzaria em São Paulo"
3. Backend chama RD Station API
4. Recebe 500 pizzarias com dados completos
5. User seleciona quais enviar mensagem WhatsApp
6. ONZAP cobra R$ 2 por pizzaria (customizável)
7. Lucro: R$ 2 × 500 = R$ 1.000 potenciais
8. **ROI em 10 dias** (R$ 99 de custo recuperado)

---

### Fase 2 (Mês 2-3) - **Plano Growth R$ 299/mês** 

**Por quê?**
- Crescimento para 5.000+ buscas/dia
- Maior velocidade (< 2s vs < 5s)
- Webhook para sincronizar dados em tempo real

---

## Como Integrar no Código

### 1. Instalar SDK RD Station

```bash
npm install @rdstation/api-node
```

### 2. Criar serviço

```typescript
// src/services/rd-station.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RdStationService {
  private readonly apiKey = process.env.RD_STATION_API_KEY;
  private readonly baseUrl = 'https://api.rdstation.com/v1';

  async searchCompanies(query: string, limit: number = 50) {
    try {
      const response = await axios.get(`${this.baseUrl}/companies/search`, {
        params: {
          q: query, // "Pizzaria em SP"
          limit,
        },
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data.companies.map(company => ({
        id: company.id,
        name: company.legal_name,
        cnpj: company.cnpj,
        phone: company.phone,
        email: company.email,
        address: company.address,
        sector: company.sector,
        employees: company.employees_count,
        revenue: company.estimated_revenue,
      }));
    } catch (error) {
      console.error('RD Station API Error:', error);
      throw error;
    }
  }

  async getCompanyById(companyId: string) {
    const response = await axios.get(
      `${this.baseUrl}/companies/${companyId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      }
    );
    return response.data;
  }

  async getCompaniesBySegment(segment: string, limit: number = 100) {
    const response = await axios.get(`${this.baseUrl}/companies/search`, {
      params: {
        filters: [{ segment }],
        limit,
      },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
    return response.data.companies;
  }
}
```

### 3. Usar no Controller ONZAP

```typescript
// src/controllers/onzap-dashboard.controller.ts
import { RdStationService } from '../services/rd-station.service';

@Controller('api/onzap')
export class OnzapDashboardController {
  constructor(
    private rdStation: RdStationService,
    private twilio: TwilioService,
  ) {}

  @Post('search-companies')
  async searchCompanies(
    @Body() dto: { query: string; limit?: number },
    @Req() req
  ) {
    // Buscar empresas na RD Station
    const companies = await this.rdStation.searchCompanies(
      dto.query,
      dto.limit || 50
    );

    // Retornar com preço de envio
    return {
      companies: companies.map(c => ({
        ...c,
        pricePerMessage: 2, // R$ 2 por mensagem
      })),
      total: companies.length,
      estimatedCost: companies.length * 2,
    };
  }

  @Post('send-to-companies')
  async sendToCompanies(
    @Body() dto: {
      companyIds: string[];
      message: string;
    },
    @Req() req
  ) {
    const companies = await Promise.all(
      dto.companyIds.map(id => this.rdStation.getCompanyById(id))
    );

    // Enviar WhatsApp para cada empresa
    const results = await Promise.all(
      companies.map(company =>
        this.twilio.sendWhatsappMessage(company.phone, dto.message)
      )
    );

    // Debitar wallet do usuário
    const cost = dto.companyIds.length * 2;
    // await walletService.debit(userId, cost);

    return {
      sent: results.filter(r => r).length,
      cost,
      message: `Enviado para ${results.length} empresas. Debitado R$ ${cost} do seu wallet.`,
    };
  }
}
```

---

## Plano Contratação - Passo a Passo

### 1. Acesse https://www.rdstation.com/api/

### 2. Clique "Criar Conta" ou "Sign Up"

### 3. Preencha dados:
- Email
- Senha
- Tipo de negócio: SaaS / Plataforma

### 4. Escolha plano:
- ✅ **Básico R$ 99/mês** (recomendado inicialmente)
- Pagamento: Cartão ou boleto

### 5. Confirme email

### 6. Dentro da dashboard:
- Vá em "API Keys"
- Copie sua `API Key`

### 7. Adicione ao `.env`:
```env
RD_STATION_API_KEY=seu_api_key_aqui
```

### 8. Registre RdStationService no AppModule:

```typescript
// src/app.module.ts
import { RdStationService } from './services/rd-station.service';

@Module({
  // ...
  providers: [
    // ...
    RdStationService,
  ],
})
export class AppModule {}
```

---

## Cálculo de ROI

### Cenário: ONZAP com RD Station

**Custo:**
- RD Station: R$ 99/mês
- Twilio WhatsApp: ~R$ 0,10 por mensagem

**Receita (com preço R$ 2 por contato):**

| Mensagens/dia | Dias/mês | Total/mês | Receita | Lucro |
|---------------|----------|-----------|---------|-------|
| 100 | 30 | 3.000 | R$ 6.000 | **R$ 5.700** |
| 500 | 30 | 15.000 | R$ 30.000 | **R$ 29.400** |
| 1.000 | 30 | 30.000 | R$ 60.000 | **R$ 58.800** |

**Break-even:** 50 mensagens/dia (ganha em 2 dias)

---

## Sumário

| Item | Recomendação |
|------|-------------|
| **Plano Inicial** | Básico - R$ 99/mês ✅ |
| **Empresas/mês** | 10.000 registros (suficiente para validar) |
| **API Calls/dia** | 100 requisições (compatível com ONZAP) |
| **Tempo Setup** | 10 minutos |
| **ROI** | 2-10 dias |
| **Upgrade** | Growth (R$ 299) após 5.000+ buscas/dia |

**Próxima ação:** Contratar Plano Básico → Integrar RD Station no ONZAP → Adicionar busca de empresas na dashboard
