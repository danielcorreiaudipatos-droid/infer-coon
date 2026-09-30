with open('frontend/infer_landing.html', encoding='utf-8') as f:
    content = f.read()

# R$119,90 anchor
# -25% mensal: 119,90 x 0.75 = 89,925 -> R$89,93
# -50% anual:  119,90 x 0.50 = 59,95 -> R$59,95 = R$719,40/ano

content = content.replace('R$&nbsp;119,00', 'R$&nbsp;119,90')
content = content.replace('R$&nbsp;89,25',  'R$&nbsp;89,93')
content = content.replace('R$&nbsp;59,50',  'R$&nbsp;59,95')
content = content.replace('R$&nbsp;714,00', 'R$&nbsp;719,40')
content = content.replace('R$ 49,90', 'R$ 119,90')
content = content.replace('R$ 79,90', 'R$ 119,90')

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Precos atualizados para R$119,90!")
