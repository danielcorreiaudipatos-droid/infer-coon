# RD Station - Estratégia de Cidades para ONZAP

## Objetivo
Validar ONZAP começando com cidades de alto potencial, expandindo conforme crescimento.

---

## Fase 1: MVP - 5 Cidades Prioritárias (Semana 1-2)

### 1. **São Paulo - SP** 🏆 (COMEÇAR AQUI)
- **População:** 12 milhões
- **Empresas estimadas:** 50.000+
- **Segmentos mais lucrativos:**
  - Pizzarias (2.000+) → R$ 4.000/campanha
  - Restaurantes (5.000+) → R$ 10.000/campanha
  - Salões de beleza (10.000+) → R$ 20.000/campanha
  - Clínicas médicas (3.000+) → R$ 6.000/campanha

**Meta semana 1:** 10 campanhas × R$ 5.000 média = **R$ 50.000**

---

### 2. **Rio de Janeiro - RJ** 🌊
- **População:** 6.7 milhões
- **Empresas:** 25.000+
- **Segmentos:** Turismo, Hotelaria, Restaurantes
- **Meta:** 5 campanhas × R$ 3.000 = **R$ 15.000**

---

### 3. **Belo Horizonte - MG** 
- **População:** 2.7 milhões
- **Empresas:** 15.000+
- **Segmentos:** Tecnologia, Varejo, Serviços
- **Meta:** 3 campanhas × R$ 2.000 = **R$ 6.000**

---

### 4. **Brasília - DF** 💼
- **População:** 3.1 milhões
- **Empresas:** 20.000+ (muitas governo-relacionadas)
- **Segmentos:** Consultoria, Imobiliária, Educação
- **Meta:** 2 campanhas × R$ 3.000 = **R$ 6.000**

---

### 5. **Salvador - BA** 🏖️
- **População:** 2.9 milhões
- **Empresas:** 12.000+
- **Segmentos:** Turismo, Comércio, Serviços
- **Meta:** 2 campanhas × R$ 2.000 = **R$ 4.000**

**TOTAL FASE 1: R$ 81.000 (2 semanas)**

---

## Fase 2: Expansão - Próximas 10 Cidades (Semana 3-4)

### Cidades Secundárias
1. **Curitiba - PR** (1.9M habitantes)
2. **Porto Alegre - RS** (1.4M)
3. **Recife - PE** (1.6M)
4. **Fortaleza - CE** (2.7M)
5. **Manaus - AM** (2.2M)
6. **Goiânia - GO** (1.5M)
7. **Campinas - SP** (1.2M) ← Segunda maior de SP
8. **Santos - SP** (430K) ← Porto turístico
9. **Jundiaí - SP** (420K) ← Industrial
10. **Sorocaba - SP** (680K) ← Industrial

**Potencial:** +R$ 100.000/2 semanas

**TOTAL MÊS 1: ~R$ 181.000**

---

## Segmentos Mais Lucrativos por Cidade

### São Paulo 🥇
```
1. Salões de beleza (10.000+) → R$ 2/contato
2. Restaurantes (5.000+) → R$ 3/contato
3. Clínicas médicas (3.000+) → R$ 4/contato
4. Barbearias (5.000+) → R$ 1.50/contato
5. Oficinas mecânicas (3.000+) → R$ 2/contato
6. Imobiliárias (2.000+) → R$ 5/contato
7. Academias (2.000+) → R$ 2.50/contato
8. Fotógrafos (1.500+) → R$ 2/contato
```

**Exemplo campanha:**
- Restaurantes em SP: 5.000 contatos
- Preço: R$ 3/contato
- Receita bruta: R$ 15.000
- Custo (WhatsApp + RD Station): R$ 500
- **Lucro: R$ 14.500**

---

### Rio de Janeiro 🌊
```
1. Hotéis/Pousadas (1.000+) → R$ 5/contato
2. Restaurantes (3.000+) → R$ 3/contato
3. Agências de turismo (800+) → R$ 4/contato
4. Clínicas médicas (2.000+) → R$ 4/contato
5. Salões de beleza (6.000+) → R$ 2/contato
```

---

### Brasília 💼
```
1. Consultoria (2.000+) → R$ 6/contato
2. Escritórios de advocacia (1.000+) → R$ 7/contato
3. Imobiliárias (500+) → R$ 5/contato
4. Empresas de TI (1.500+) → R$ 5/contato
```

---

## Integração no Código

### 1. Update RdStationService

```typescript
// src/services/rd-station.service.ts
async searchCompaniesByCity(city: string, segment?: string, limit: number = 100) {
  try {
    const query = segment 
      ? `${segment} em ${city}`
      : `${city}`;

    const response = await axios.get(`${this.baseUrl}/companies/search`, {
      params: {
        q: query,
        limit,
        filters: {
          city: city,
          segment: segment || null,
        },
      },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return response.data.companies.map(company => ({
      id: company.id,
      name: company.legal_name,
      city: company.city,
      segment: company.segment,
      cnpj: company.cnpj,
      phone: company.phone,
      email: company.email,
    }));
  } catch (error) {
    console.error('RD Station search error:', error);
    throw error;
  }
}

async getCompaniesBySegmentAndCity(city: string, segment: string, limit: number = 100) {
  return this.searchCompaniesByCity(city, segment, limit);
}
```

### 2. Update OnzapDashboardController

```typescript
@Post('search-by-city')
async searchByCity(
  @Body() dto: {
    city: string;
    segment: string; // "Pizzaria", "Restaurante", "Salão de beleza", etc
    limit?: number;
  },
  @Req() req
) {
  const companies = await this.rdStation.getCompaniesBySegmentAndCity(
    dto.city,
    dto.segment,
    dto.limit || 50
  );

  // Calcular preço baseado no segmento
  const segmentPrices = {
    'Consultoria': 6,
    'Imobiliária': 5,
    'Clínica': 4,
    'Restaurante': 3,
    'Salão': 2,
    'Barberia': 1.50,
    'Oficina': 2,
    'Hotel': 5,
  };

  const pricePerContact = segmentPrices[dto.segment] || 2.50;

  return {
    city: dto.city,
    segment: dto.segment,
    companies: companies.length,
    pricePerContact,
    estimatedRevenue: companies.length * pricePerContact,
    companies: companies.map(c => ({
      ...c,
      estimatedValue: pricePerContact,
    })),
  };
}

@Get('cities-ranking')
async getCitiesRanking() {
  return {
    phase1: [
      { city: 'São Paulo', population: 12000000, priority: 1 },
      { city: 'Rio de Janeiro', population: 6700000, priority: 2 },
      { city: 'Belo Horizonte', population: 2700000, priority: 3 },
      { city: 'Brasília', population: 3100000, priority: 4 },
      { city: 'Salvador', population: 2900000, priority: 5 },
    ],
    phase2: [
      { city: 'Curitiba', population: 1900000, priority: 6 },
      { city: 'Fortaleza', population: 2700000, priority: 7 },
      { city: 'Manaus', population: 2200000, priority: 8 },
      { city: 'Recife', population: 1600000, priority: 9 },
      { city: 'Porto Alegre', population: 1400000, priority: 10 },
    ],
  };
}
```

### 3. Testar no Swagger

```bash
# Buscar pizzarias em SP
POST /api/onzap/search-by-city
{
  "city": "São Paulo",
  "segment": "Pizzaria",
  "limit": 100
}

# Resposta esperada:
{
  "city": "São Paulo",
  "segment": "Pizzaria",
  "companies": 500,
  "pricePerContact": 2,
  "estimatedRevenue": 1000,
  "companies": [...]
}
```

---

## Plano de Execução - Semana 1

### Segunda (hoje) - Setup
- [ ] Contratar RD Station Básico (R$ 99)
- [ ] Integrar RdStationService com métodos de cidade
- [ ] Update OnzapDashboardController

### Terça - Testes SP
- [ ] Testar busca "Pizzaria em São Paulo"
- [ ] Testar busca "Restaurante em São Paulo"
- [ ] Testar busca "Salão em São Paulo"
- [ ] Criar 3 campanhas piloto

### Quarta - Expansão RJ
- [ ] Testar busca em Rio
- [ ] Criar 2 campanhas RJ

### Quinta - Testes MG + DF
- [ ] Testes BH
- [ ] Testes Brasília

### Sexta - Go Live
- [ ] 10 campanhas rodando em 5 cidades
- [ ] Validar receita vs custo
- [ ] Planejar Fase 2

---

## Previsão de Receita

| Fase | Período | Campanhas | Valor/Campanha | Receita | Custo |  Lucro |
|------|---------|-----------|-----------------|---------|-------|--------|
| MVP | 1-2 sem | 27 | R$ 3.000 | R$ 81.000 | R$ 500 | R$ 80.500 |
| Expansão | 3-4 sem | 40 | R$ 2.500 | R$ 100.000 | R$ 700 | R$ 99.300 |
| **MÊS 1** | **Total** | **67** | **-** | **R$ 181.000** | **R$ 1.200** | **R$ 179.800** |

**Custos:**
- RD Station: R$ 99/mês
- WhatsApp (Twilio): ~R$ 0.10/msg × 50.000 msgs = R$ 5.000/mês
- **Total: R$ 5.099 mensais**

**Net Profit Mês 1: R$ 175.901** (ROI: 3.450%)

---

## Cidades Próximas (Fase 2)

Se validar em 5 cidades, expandir para:
- Todo São Paulo (interior) - 50+ cidades
- Todo Rio de Janeiro
- Minas Gerais (20+ cidades)
- Santa Catarina
- Paraná
- Rio Grande do Sul

**Potencial nacional:** R$ 2-5M/mês com 50+ cidades rodando

---

## Recomendação Final

✅ **Começar com São Paulo**
- Maior mercado (12M habitantes)
- Mais empresas para validar
- Maior potencial de receita
- Menos fricção (usuários já conhecem plataforma)

**Estratégia:** 
1. Semana 1: Validar 5 cidades (R$ 81K receita)
2. Semana 2: Expandir para 15 cidades
3. Semana 3-4: Otimizar e atingir 50 cidades
4. Mês 2: Escalar para Growth ou Enterprise plan (500K+ contatos)

**Launch:** Segunda-feira, começando São Paulo 🚀
