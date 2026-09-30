// =============================================================================
// scripts/juntar-codigo.mjs — gera docs/CODIGO-COMPLETO.md
// -----------------------------------------------------------------------------
// Junta todo o código do sistema num arquivo só, com índice e o nome de cada
// arquivo, para ler e analisar do começo ao fim. Rodar sempre que o código
// mudar:   node scripts/juntar-codigo.mjs
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Ordem de leitura sugerida: do núcleo matemático até a tela e a nuvem.
const GRUPOS = [
  ['Motor estatístico', 'motor', /\.js$/],
  ['Tela', 'web', /\.(html|css|js)$/],
  ['Servidor (nuvem)', 'servidor', /\.mjs$/],
  ['Banco de dados [SUPABASE]', 'supabase/migrations', /\.sql$/],
  ['Testes', 'testes', /\.(cjs|py)$/],
  ['Configuração', '.', /^(package\.json|railway\.json|\.env\.exemplo)$/],
  ['Scripts', 'scripts', /\.mjs$/]
];
const LINGUAGEM = { '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.html': 'html', '.css': 'css', '.sql': 'sql', '.py': 'python', '.json': 'json', '.exemplo': 'bash' };

async function listar(pasta, filtro) {
  const base = path.join(RAIZ, pasta);
  const saida = [];
  for (const nome of (await fs.readdir(base, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = path.posix.join(pasta === '.' ? '' : pasta, nome.name);
    if (nome.isDirectory()) { if (pasta !== '.') saida.push(...await listar(rel, filtro)); }
    else if (filtro.test(nome.name)) saida.push(rel);
  }
  return saida;
}

let indice = '', corpo = '', totalLinhas = 0, totalArquivos = 0;
for (const [titulo, pasta, filtro] of GRUPOS) {
  const arquivos = await listar(pasta, filtro);
  if (!arquivos.length) continue;
  indice += `\n**${titulo}**\n\n`;
  corpo += `\n\n---\n\n# ${titulo}\n`;
  for (const rel of arquivos) {
    const texto = (await fs.readFile(path.join(RAIZ, rel), 'utf8')).replace(/\r\n/g, '\n');
    const linhas = texto.split('\n').length;
    totalLinhas += linhas; totalArquivos++;
    const ancora = rel.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const marcas = ['SUPABASE', 'SUPADATA', 'CLAUDE', 'GOOGLE MAPS'].filter((m) => texto.includes('[' + m + ']')).map((m) => `[${m}]`).join(' ');
    indice += `- [${rel}](#${ancora}) — ${linhas} linhas ${marcas}\n`;
    const lang = LINGUAGEM[path.extname(rel)] || '';
    corpo += `\n## ${rel}\n<a id="${ancora}"></a>\n\n${marcas ? 'Integrações: ' + marcas + '\n\n' : ''}\`\`\`\`${lang}\n${texto.trimEnd()}\n\`\`\`\`\n`;
  }
}

const cabecalho = `# COON Infer — Código completo

Todo o código-fonte num arquivo só: ${totalArquivos} arquivos e ${totalLinhas.toLocaleString('pt-BR')} linhas.
A estrutura e as decisões estão em ESTRUTURA.md.

Para achar as integrações, busque no texto:
- \`[SUPABASE]\` — banco de dados (projetos, banco de mercado, auditoria)
- \`[SUPADATA]\` — leitura de anúncio pelo link
- \`[CLAUDE]\` — conferência das amostras pela IA
- \`[GOOGLE MAPS]\` — imagens de satélite e mapa de situação no laudo

Gerado em ${new Date().toLocaleString('pt-BR')} por scripts/juntar-codigo.mjs.

## Índice
`;
await fs.writeFile(path.join(RAIZ, 'docs', 'CODIGO-COMPLETO.md'), cabecalho + indice + corpo, 'utf8');
console.log(`docs/CODIGO-COMPLETO.md: ${totalArquivos} arquivos, ${totalLinhas} linhas`);
