with open('frontend/infer_landing.html', encoding='utf-8') as f:
    content = f.read()

# Trocar o icone de balanca (justica) por um icone de escudo-check (confianca/certificacao)
old_icon = (
    '<svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'
    '<path d="M3 6l3 1m0 0l-3 9a5 5 0 006 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5 5 0 006 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>'
    '</svg>'
)

new_icon = (
    '<svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">'
    '<path stroke-linecap="round" stroke-linejoin="round" '
    'd="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.591 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>'
    '</svg>'
)

if old_icon in content:
    content = content.replace(old_icon, new_icon)
    with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Icone trocado com sucesso!")
else:
    print("AVISO: icone nao encontrado exatamente - verificar manualmente")
    # fallback: buscar e mostrar contexto
    idx = content.find('Usado em pericias')
    if idx == -1:
        idx = content.find('perícias')
    print(f"Contexto encontrado em idx={idx}:")
    print(content[max(0, idx-200):idx+200])
