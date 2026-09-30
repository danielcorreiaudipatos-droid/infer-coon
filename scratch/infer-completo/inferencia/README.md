# COON Infer

Avaliação de imóveis por inferência estatística (ABNT NBR 14.653) com laudo completo em Word e PDF,
inventário dos documentos pela IA e vistoria de vizinhança. Roda na nuvem, dentro do login único do COON.

- **Estrutura e decisões:** `docs/ESTRUTURA.md`
- **Como colocar no ar:** `docs/IMPLANTACAO.md`
- **Todo o código num arquivo:** `docs/CODIGO-COMPLETO.md` (regerar com `node scripts/juntar-codigo.mjs`)
- **Teste no PC:** `node --env-file=.env.dev servidor/server.mjs` → http://localhost:8795/inferencia/
- **Mudanças desta versão:** `docs/MUDANCAS.md`
- **Testar todos os botões:** abrir `/inferencia/?teste=botoes`
- **Landing page:** `/inferencia/landing.html`
- **Conferir o motor:** `node testes/teste-motor.cjs && python testes/conferir_statsmodels.py`

Sem dependências: Node 20+ no servidor, JavaScript puro na tela.
