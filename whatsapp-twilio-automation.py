#!/usr/bin/env python3
# 🚀 WhatsApp Automation com Twilio
# Pronto para usar!

import os
from twilio.rest import Client
from datetime import datetime
import json

# ========================================
# 1. CONFIGURAÇÃO INICIAL
# ========================================

# Pegar do seu Twilio Console
ACCOUNT_SID = 'seu_account_sid_aqui'  # De https://console.twilio.com
AUTH_TOKEN = 'seu_auth_token_aqui'    # De https://console.twilio.com
WHATSAPP_FROM = '+1234567890'  # Seu número Twilio verificado
YOUR_WHATSAPP = '+5511999999999'  # Seu WhatsApp pessoal (para testes)

# Inicializar cliente Twilio
client = Client(ACCOUNT_SID, AUTH_TOKEN)

# ========================================
# 2. FUNÇÕES DE ENVIO
# ========================================

def send_whatsapp(to_number, message_body):
    """
    Enviar mensagem WhatsApp

    Args:
        to_number: Número em formato +55XXXXXXX
        message_body: Texto da mensagem (máx 1600 caracteres)
    """
    try:
        message = client.messages.create(
            from_=f'whatsapp:{WHATSAPP_FROM}',
            body=message_body,
            to=f'whatsapp:{to_number}'
        )
        print(f"✅ Mensagem enviada para {to_number}: {message.sid}")
        return message.sid
    except Exception as e:
        print(f"❌ Erro ao enviar para {to_number}: {str(e)}")
        return None


def welcome_message(nome, numero):
    """Mensagem de boas-vindas para novo inscrever"""
    message = f"""🎉 Bem-vindo ao ADS Inteligente, {nome}!

Você foi inscrito nos Founding Members!

✅ 14 dias GRÁTIS para testar
✅ 33% OFF para SEMPRE (congelado 24 meses)
✅ Comunidade exclusiva no Discord

🚀 Começar: https://ads-inteligente.com.br

Próximo sorteio: SEXTA-FEIRA (30 dias grátis!)

Qualquer dúvida, é só chamar!"""

    send_whatsapp(numero, message)


def trial_reminder(nome, numero, dias_restantes):
    """Lembrete para usuário em trial"""
    message = f"""⏰ Lembrete {nome}

Seu teste tem apenas {dias_restantes} dias restantes!

Não esqueça de:
✅ Criar sua primeira campanha
✅ Testar Auto-Ad-Creator
✅ Conectar Meta/Google

Precisa de ajuda? Responde aqui!

🔗 https://ads-inteligente.com.br/help"""

    send_whatsapp(numero, message)


def friday_giveaway_reminder(numero):
    """Lembrete de sorteio na sexta"""
    message = """🎰 SORTEIO HOJE!

Oi! Você se inscreveu para o sorteio?

Hoje tem: 30 DIAS GRÁTIS do Starter (R$199)

📱 Inscrever: https://ads-inteligente.com.br

Boa sorte! 🍀"""

    send_whatsapp(numero, message)


def giveaway_winner(nome, numero):
    """Mensagem para ganhador do sorteio"""
    message = f"""🎉 PARABÉNS {nome}!

VOCÊ GANHOU!

30 DIAS GRÁTIS do Starter (R$199)

Para ativar seu prêmio:
🔗 https://ads-inteligente.com.br/activate?code=[WINNER_CODE]

Obrigado por ser parte da comunidade!

Compartilhe com seus amigos também! 📢"""

    send_whatsapp(numero, message)


def giveaway_loser(nome, numero):
    """Mensagem para quem não ganhou"""
    message = f"""😅 Que pena {nome}...

Você não foi sorteado dessa vez.

MAS você ainda pode:

✅ Testar 14 dias GRÁTIS
✅ Usar cupom 30% OFF (R$280)
✅ Concorrer NOVAMENTE sexta!

🚀 https://ads-inteligente.com.br

Abraços! 🚀"""

    send_whatsapp(numero, message)


def conversion_offer(nome, numero):
    """Oferta para converter trial em cliente"""
    message = f"""💎 Oi {nome}!

Seu teste está acabando...

Quer virar Founding Member?

Benefícios exclusivos:
✅ Preço congelado por 24 MESES
✅ 33% OFF permanente
✅ Comunidade privada Discord
✅ Suporte prioritário

Opções:
💰 Starter: R$199/mês
💰 Professional: R$399/mês (TOP)
💰 Plus: R$599/mês

📱 Clica aqui: https://ads-inteligente.com.br/checkout

Dúvida? Chama no WhatsApp!"""

    send_whatsapp(numero, message)


def customer_onboarding(nome, numero):
    """Welcome para novo customer"""
    message = f"""🎉 Bem-vindo {nome}!

Você é oficialmente um Founding Member!

Seus próximos passos:

1️⃣ Conectar Meta/Google [Link]
2️⃣ Criar campanha [Link]
3️⃣ Usar Auto-Ad-Creator [Link]
4️⃣ Entrar no Discord [Link]

Suporte: responda aqui!

Vamos crescer juntos! 🚀"""

    send_whatsapp(numero, message)


# ========================================
# 3. AUTOMAÇÕES AGENDADAS
# ========================================

def send_daily_reminders():
    """Executar todos os dias (usar cron job ou scheduler)"""
    # Ler lista de emails/números do seu banco de dados
    users_in_trial = [
        {"name": "João", "number": "+551199999999", "days_left": 3},
        {"name": "Maria", "number": "+551188888888", "days_left": 2},
    ]

    for user in users_in_trial:
        trial_reminder(user['name'], user['number'], user['days_left'])
        print(f"⏰ Lembrete enviado para {user['name']}")


def send_friday_giveaway():
    """Executar toda sexta-feira às 20:00 (usar cron)"""
    # Ler todos os inscritos no sorteio
    giveaway_users = [
        "+551199999999",
        "+551188888888",
        "+551177777777",
    ]

    for number in giveaway_users:
        friday_giveaway_reminder(number)

    print(f"✅ {len(giveaway_users)} lembretes de sorteio enviados")


def announce_giveaway_winner(winner_name, winner_number, loser_numbers):
    """Anunciar resultado do sorteio"""
    # Enviar para ganhador
    giveaway_winner(winner_name, winner_number)
    print(f"🏆 Mensagem ganador enviada para {winner_name}")

    # Enviar para perdedores
    for number in loser_numbers:
        giveaway_loser("Amigo", number)
    print(f"📢 {len(loser_numbers)} mensagens de sorteio enviadas")


# ========================================
# 4. INTEGRAÇÃO COM DATABASE
# ========================================

def send_automated_sequences():
    """
    Ler CSV/JSON com inscritos e enviar automações
    Exemplo de estrutura esperada:
    """

    # Exemplo de dados
    subscribers = [
        {
            "name": "João Silva",
            "number": "+551199999999",
            "email": "joao@email.com",
            "status": "new",  # new, trial, customer
            "days_in_trial": 0,
            "created_at": "2026-10-01"
        },
        {
            "name": "Maria Santos",
            "number": "+551188888888",
            "email": "maria@email.com",
            "status": "trial",
            "days_in_trial": 5,
            "created_at": "2026-09-26"
        }
    ]

    for subscriber in subscribers:
        if subscriber['status'] == 'new':
            welcome_message(subscriber['name'], subscriber['number'])

        elif subscriber['status'] == 'trial' and subscriber['days_in_trial'] == 3:
            trial_reminder(subscriber['name'], subscriber['number'], 14 - subscriber['days_in_trial'])

        elif subscriber['status'] == 'trial' and subscriber['days_in_trial'] == 13:
            conversion_offer(subscriber['name'], subscriber['number'])


# ========================================
# 5. SCRIPT DE TESTE
# ========================================

if __name__ == "__main__":
    print("🚀 WhatsApp Automation - ADS Inteligente")
    print("=" * 50)

    # TESTE 1: Enviar mensagem de teste
    print("\n📝 TESTE 1: Enviando mensagem de teste...")
    test_message = """🚀 ADS Inteligente - Teste de integração WhatsApp

Este é um teste! Se você recebeu, a integração funcionou! ✅

Próximo passo: Configurar automações.

#TestMessage"""

    send_whatsapp(YOUR_WHATSAPP, test_message)

    # TESTE 2: Simular welcome de novo inscrito
    print("\n🎉 TESTE 2: Simulando welcome...")
    welcome_message("Você", YOUR_WHATSAPP)

    # TESTE 3: Simular lembrete trial
    print("\n⏰ TESTE 3: Simulando lembrete trial...")
    trial_reminder("Você", YOUR_WHATSAPP, 3)

    # TESTE 4: Simular oferta de conversão
    print("\n💎 TESTE 4: Simulando oferta conversão...")
    conversion_offer("Você", YOUR_WHATSAPP)

    print("\n✅ TODOS OS TESTES CONCLUÍDOS!")
    print("\n📌 Próximas ações:")
    print("1. Verificar mensagens no seu WhatsApp")
    print("2. Se recebeu, integração está OK!")
    print("3. Integrar com seu banco de dados")
    print("4. Configurar cron jobs para automações")
    print("\n🔗 Cron examples:")
    print("# Lembretes diários (10:00)")
    print("0 10 * * * /usr/bin/python3 /caminho/whatsapp-twilio-automation.py send_daily_reminders")
    print("\n# Sorteio sexta-feira (20:00)")
    print("0 20 * * 5 /usr/bin/python3 /caminho/whatsapp-twilio-automation.py send_friday_giveaway")

