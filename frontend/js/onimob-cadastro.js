// js/onimob-cadastro.js — Módulo 1 do Onimob (cadastro): liga os formulários às rotas /api/onimob/*
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reais = (v) => v == null ? '—' : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  async function api(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(dados.detail || 'Erro ao salvar.');
    return dados;
  }

  // ── Abas ─────────────────────────────────────────────────────────────────
  const ATIVA = 'aba-cadastro px-4 py-2.5 text-sm font-semibold border-b-2 border-blue-600 text-slate-900 dark:text-white';
  const INATIVA = 'aba-cadastro px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200';

  document.querySelectorAll('.aba-cadastro').forEach((btn) => {
    btn.addEventListener('click', () => {
      const alvo = btn.dataset.aba;
      document.querySelectorAll('.aba-cadastro').forEach((b) => { b.className = b.dataset.aba === alvo ? ATIVA : INATIVA; });
      document.querySelectorAll('[data-painel]').forEach((p) => { p.classList.toggle('hidden', p.dataset.painel !== alvo); });
    });
  });

  // ── Resumo ───────────────────────────────────────────────────────────────
  async function carregarResumo() {
    try {
      const r = await api('GET', '/api/onimob/resumo');
      document.getElementById('resumoGrade').innerHTML = [
        ['Imóveis cadastrados', r.total_imoveis],
        ['Disponíveis', r.disponiveis],
        ['Alugados', r.alugados],
        ['Vendidos', r.vendidos],
      ].map(([rotulo, valor]) => `
        <div class="resumo-card">
          <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">${esc(rotulo)}</span>
          <div class="text-2xl font-black mt-1">${esc(valor)}</div>
        </div>`).join('');
    } catch (e) { /* silencioso: resumo não é crítico */ }
  }

  // ── Imóveis ──────────────────────────────────────────────────────────────
  async function carregarImoveis() {
    const r = await api('GET', '/api/onimob/imoveis');
    document.getElementById('corpoImoveis').innerHTML = r.imoveis.map((i) => `
      <tr class="border-t border-slate-100 dark:border-slate-800">
        <td class="p-3 font-medium">${esc(i.titulo)}</td>
        <td class="p-3 capitalize">${esc(i.tipo)}</td>
        <td class="p-3 capitalize">${esc(i.finalidade)}</td>
        <td class="p-3">${esc(i.cidade || '—')}</td>
        <td class="p-3">${reais(i.valor)}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold capitalize">${esc(i.status)}</span></td>
      </tr>`).join('') || '<tr><td class="p-3 text-slate-400" colspan="6">Nenhum imóvel cadastrado ainda.</td></tr>';
  }

  async function carregarListasVinculo() {
    const [prop, cor] = await Promise.all([api('GET', '/api/onimob/proprietarios'), api('GET', '/api/onimob/corretores')]);
    const selP = document.getElementById('selProprietario');
    const selC = document.getElementById('selCorretor');
    selP.innerHTML = '<option value="">Proprietário (opcional)</option>' + prop.proprietarios.map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
    selC.innerHTML = '<option value="">Corretor (opcional)</option>' + cor.corretores.map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
  }

  document.getElementById('formImovel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const corpo = {
      titulo: f.get('titulo'), tipo: f.get('tipo'), finalidade: f.get('finalidade'),
      endereco: f.get('endereco') || null, cidade: f.get('cidade') || null, uf: f.get('uf') || null, cep: f.get('cep') || null,
      area_m2: f.get('area_m2') ? Number(f.get('area_m2')) : null,
      quartos: f.get('quartos') ? Number(f.get('quartos')) : null,
      valor: f.get('valor') ? Number(f.get('valor')) : null,
      proprietario_id: f.get('proprietario_id') ? Number(f.get('proprietario_id')) : null,
      corretor_id: f.get('corretor_id') ? Number(f.get('corretor_id')) : null,
    };
    const erro = document.getElementById('erroImovel');
    try {
      await api('POST', '/api/onimob/imoveis', corpo);
      e.target.reset();
      erro.classList.add('hidden');
      await Promise.all([carregarImoveis(), carregarResumo()]);
    } catch (err) { erro.textContent = err.message; erro.classList.remove('hidden'); }
  });

  // ── Proprietários ────────────────────────────────────────────────────────
  async function carregarProprietarios() {
    const r = await api('GET', '/api/onimob/proprietarios');
    document.getElementById('corpoProprietarios').innerHTML = r.proprietarios.map((p) => `
      <tr class="border-t border-slate-100 dark:border-slate-800">
        <td class="p-3 font-medium">${esc(p.nome)}</td><td class="p-3">${esc(p.cpf_cnpj || '—')}</td>
        <td class="p-3">${esc(p.telefone || '—')}</td><td class="p-3">${esc(p.email || '—')}</td>
      </tr>`).join('') || '<tr><td class="p-3 text-slate-400" colspan="4">Nenhum proprietário cadastrado ainda.</td></tr>';
  }

  document.getElementById('formProprietario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const corpo = { nome: f.get('nome'), cpf_cnpj: f.get('cpf_cnpj') || null, telefone: f.get('telefone') || null, email: f.get('email') || null, chave_pix: f.get('chave_pix') || null };
    const erro = document.getElementById('erroProprietario');
    try {
      await api('POST', '/api/onimob/proprietarios', corpo);
      e.target.reset();
      erro.classList.add('hidden');
      await Promise.all([carregarProprietarios(), carregarListasVinculo(), carregarResumo()]);
    } catch (err) { erro.textContent = err.message; erro.classList.remove('hidden'); }
  });

  // ── Inquilinos ───────────────────────────────────────────────────────────
  async function carregarInquilinos() {
    const r = await api('GET', '/api/onimob/inquilinos');
    document.getElementById('corpoInquilinos').innerHTML = r.inquilinos.map((t) => `
      <tr class="border-t border-slate-100 dark:border-slate-800">
        <td class="p-3 font-medium">${esc(t.nome)}</td><td class="p-3">${esc(t.cpf_cnpj || '—')}</td>
        <td class="p-3">${esc(t.telefone || '—')}</td><td class="p-3">${esc(t.email || '—')}</td>
      </tr>`).join('') || '<tr><td class="p-3 text-slate-400" colspan="4">Nenhum inquilino cadastrado ainda.</td></tr>';
  }

  document.getElementById('formInquilino').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const corpo = { nome: f.get('nome'), cpf_cnpj: f.get('cpf_cnpj') || null, telefone: f.get('telefone') || null, email: f.get('email') || null };
    const erro = document.getElementById('erroInquilino');
    try {
      await api('POST', '/api/onimob/inquilinos', corpo);
      e.target.reset();
      erro.classList.add('hidden');
      await Promise.all([carregarInquilinos(), carregarResumo()]);
    } catch (err) { erro.textContent = err.message; erro.classList.remove('hidden'); }
  });

  // ── Corretores ───────────────────────────────────────────────────────────
  async function carregarCorretores() {
    const r = await api('GET', '/api/onimob/corretores');
    document.getElementById('corpoCorretores').innerHTML = r.corretores.map((c) => `
      <tr class="border-t border-slate-100 dark:border-slate-800">
        <td class="p-3 font-medium">${esc(c.nome)}</td><td class="p-3">${esc(c.creci || '—')}</td>
        <td class="p-3">${esc(c.imobiliaria || '—')}</td><td class="p-3">${esc(c.telefone || '—')}</td>
      </tr>`).join('') || '<tr><td class="p-3 text-slate-400" colspan="4">Nenhum corretor cadastrado ainda.</td></tr>';
  }

  document.getElementById('formCorretor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const corpo = { nome: f.get('nome'), creci: f.get('creci') || null, telefone: f.get('telefone') || null, email: f.get('email') || null, imobiliaria: f.get('imobiliaria') || null };
    const erro = document.getElementById('erroCorretor');
    try {
      await api('POST', '/api/onimob/corretores', corpo);
      e.target.reset();
      erro.classList.add('hidden');
      await Promise.all([carregarCorretores(), carregarListasVinculo(), carregarResumo()]);
    } catch (err) { erro.textContent = err.message; erro.classList.remove('hidden'); }
  });

  // ── Inicialização ────────────────────────────────────────────────────────
  Promise.all([carregarResumo(), carregarImoveis(), carregarProprietarios(), carregarInquilinos(), carregarCorretores(), carregarListasVinculo()])
    .then(() => { if (window.lucide) lucide.createIcons(); })
    .catch((e) => console.error('Onimob cadastro: falha ao carregar dados iniciais', e));
})();
