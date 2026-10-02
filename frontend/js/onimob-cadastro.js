// js/onimob-cadastro.js — Módulo 1 do Onimob (cadastro): liga os formulários às rotas /api/onimob/*
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reais = (v) => v == null ? '—' : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  function tokenAuth() {
    return localStorage.getItem('coon_auth_token') || localStorage.getItem('coon_master_key') || '';
  }

  async function api(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = tokenAuth();
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body) opts.body = JSON.stringify(body);
    const r = await fetch(url, opts);
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(dados.detail || 'Erro ao salvar.');
    return dados;
  }

  // ── Busca automática de CEP e CNPJ (deixa de digitar endereço à mão) ────────
  document.querySelectorAll('.busca-cep').forEach((campo) => {
    campo.addEventListener('blur', async () => {
      const cep = campo.value.replace(/\D/g, '');
      if (cep.length !== 8) return;
      const form = campo.closest('form');
      try {
        const r = await fetch(`/api/integrations/cep/${cep}`);
        const dados = await r.json();
        if (!r.ok || !dados.success) return; // CEP não achado: deixa a pessoa preencher na mão, sem travar
        const mapa = { rua: dados.street, bairro: dados.neighborhood, cidade: dados.city, uf: dados.state };
        form.querySelectorAll('.campo-auto-cep').forEach((c) => {
          const valor = mapa[c.dataset.cepCampo];
          if (valor) c.value = valor;
        });
      } catch { /* sem internet ou API fora: segue a vida, preenchimento manual */ }
    });
  });

  document.querySelectorAll('.busca-cnpj').forEach((campo) => {
    campo.addEventListener('blur', async () => {
      const doc = campo.value.replace(/\D/g, '');
      if (doc.length !== 14) return; // só dispara pra CNPJ (14 dígitos); CPF não tem busca pública
      const form = campo.closest('form');
      try {
        const r = await fetch(`/api/integrations/cnpj/${doc}`);
        const dados = await r.json();
        if (!r.ok || !dados.success) return;
        const campoNome = form.querySelector('[name="nome"]');
        if (campoNome && !campoNome.value) campoNome.value = dados.trade_name || dados.company_name || '';
        const campoCidade = form.querySelector('[name="cidade"]');
        const campoUf = form.querySelector('[name="uf"]');
        if (campoCidade && !campoCidade.value) campoCidade.value = dados.city || '';
        if (campoUf && !campoUf.value) campoUf.value = dados.state || '';
      } catch { /* CNPJ não localizado ou API fora: segue manual */ }
    });
  });

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
    const [prop, cor, inq, fia] = await Promise.all([
      api('GET', '/api/onimob/proprietarios'), api('GET', '/api/onimob/corretores'),
      api('GET', '/api/onimob/inquilinos'), api('GET', '/api/onimob/fiadores'),
    ]);
    const selP = document.getElementById('selProprietario');
    const selC = document.getElementById('selCorretor');
    const selI = document.getElementById('selInquilinoImovel');
    const selF = document.getElementById('selFiadorImovel');
    selP.innerHTML = '<option value="">Proprietário (opcional)</option>' + prop.proprietarios.map((p) => `<option value="${p.id}">${esc(p.nome)}</option>`).join('');
    selC.innerHTML = '<option value="">Corretor (opcional)</option>' + cor.corretores.map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
    selI.innerHTML = '<option value="">Inquilino (opcional)</option>' + inq.inquilinos.map((i) => `<option value="${i.id}">${esc(i.nome)}</option>`).join('');
    selF.innerHTML = '<option value="">Fiador (opcional)</option>' + fia.fiadores.map((fi) => `<option value="${fi.id}">${esc(fi.nome)}</option>`).join('');
  }

  document.getElementById('formImovel').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const corpo = {
      titulo: f.get('titulo'), tipo: f.get('tipo'), finalidade: f.get('finalidade'),
      cep: f.get('cep') || null, rua: f.get('rua') || null, numero: f.get('numero') || null,
      complemento: f.get('complemento') || null, bairro: f.get('bairro') || null,
      cidade: f.get('cidade') || null, uf: f.get('uf') || null,
      area_terreno_m2: f.get('area_terreno_m2') ? Number(f.get('area_terreno_m2')) : null,
      area_construida_m2: f.get('area_construida_m2') ? Number(f.get('area_construida_m2')) : null,
      quartos: f.get('quartos') ? Number(f.get('quartos')) : null,
      valor: f.get('valor') ? Number(f.get('valor')) : null,
      proprietario_id: f.get('proprietario_id') ? Number(f.get('proprietario_id')) : null,
      corretor_id: f.get('corretor_id') ? Number(f.get('corretor_id')) : null,
      inquilino_id: f.get('inquilino_id') ? Number(f.get('inquilino_id')) : null,
      fiador_id: f.get('fiador_id') ? Number(f.get('fiador_id')) : null,
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

  // ── Fiadores ─────────────────────────────────────────────────────────────
  async function carregarFiadores() {
    const r = await api('GET', '/api/onimob/fiadores');
    document.getElementById('corpoFiadores').innerHTML = r.fiadores.map((fi) => `
      <tr class="border-t border-slate-100 dark:border-slate-800">
        <td class="p-3 font-medium">${esc(fi.nome)}</td><td class="p-3">${esc(fi.cpf_cnpj || '—')}</td>
        <td class="p-3">${esc(fi.cidade || '—')}</td><td class="p-3">${esc(fi.telefone || '—')}</td>
      </tr>`).join('') || '<tr><td class="p-3 text-slate-400" colspan="4">Nenhum fiador cadastrado ainda.</td></tr>';
  }

  document.getElementById('formFiador').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const corpo = {
      nome: f.get('nome'), cpf_cnpj: f.get('cpf_cnpj') || null, telefone: f.get('telefone') || null, email: f.get('email') || null,
      cep: f.get('cep') || null, rua: f.get('rua') || null, numero: f.get('numero') || null,
      complemento: f.get('complemento') || null, bairro: f.get('bairro') || null, cidade: f.get('cidade') || null, uf: f.get('uf') || null,
    };
    const erro = document.getElementById('erroFiador');
    try {
      await api('POST', '/api/onimob/fiadores', corpo);
      e.target.reset();
      erro.classList.add('hidden');
      await Promise.all([carregarFiadores(), carregarListasVinculo(), carregarResumo()]);
    } catch (err) { erro.textContent = err.message; erro.classList.remove('hidden'); }
  });

  // ── Documentos (Módulo 2) ────────────────────────────────────────────────
  const ROTULOS_TIPO_DOC = {
    rg_cpf: 'RG / CPF', comprovante_residencia: 'Comprovante de residência', contrato: 'Contrato',
    matricula_imovel: 'Matrícula do imóvel', iptu: 'IPTU', outro: 'Outro',
  };
  const ROTULOS_ENTIDADE = { imovel: 'Imóvel', proprietario: 'Proprietário', inquilino: 'Inquilino', corretor: 'Corretor', fiador: 'Fiador' };
  const BADGE_STATUS = {
    pendente: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    aprovado: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    rejeitado: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  };

  // Rótulo de exibição pra cada entidade (nome do imóvel/pessoa), reaproveitando o que já foi carregado.
  async function nomesEntidade(tipo) {
    const rota = { imovel: '/api/onimob/imoveis', proprietario: '/api/onimob/proprietarios', inquilino: '/api/onimob/inquilinos', corretor: '/api/onimob/corretores', fiador: '/api/onimob/fiadores' }[tipo];
    const chave = { imovel: 'imoveis', proprietario: 'proprietarios', inquilino: 'inquilinos', corretor: 'corretores', fiador: 'fiadores' }[tipo];
    const r = await api('GET', rota);
    return r[chave].map((item) => ({ id: item.id, nome: item.nome || item.titulo }));
  }

  document.getElementById('selTipoEntidade').addEventListener('change', async (e) => {
    const sel = document.getElementById('selEntidadeAlvo');
    const tipo = e.target.value;
    if (!tipo) { sel.innerHTML = '<option value="">Escolha o tipo primeiro</option>'; return; }
    sel.innerHTML = '<option value="">Carregando...</option>';
    try {
      const itens = await nomesEntidade(tipo);
      sel.innerHTML = itens.length
        ? itens.map((i) => `<option value="${i.id}">${esc(i.nome)}</option>`).join('')
        : '<option value="">Nenhum cadastrado ainda</option>';
    } catch { sel.innerHTML = '<option value="">Erro ao carregar</option>'; }
  });

  async function carregarDocumentos() {
    const r = await api('GET', '/api/onimob/documentos');
    const linhas = await Promise.all(r.documentos.map(async (d) => {
      const badge = BADGE_STATUS[d.status] || BADGE_STATUS.pendente;
      const acoes = d.status === 'pendente'
        ? `<button class="text-emerald-600 hover:underline font-semibold mr-2" data-aprovar="${d.id}">Aprovar</button>
           <button class="text-rose-600 hover:underline font-semibold" data-rejeitar="${d.id}">Rejeitar</button>`
        : (d.status === 'rejeitado' && d.motivo_rejeicao ? `<span class="text-slate-400 italic">${esc(d.motivo_rejeicao)}</span>` : '—');
      return `<tr class="border-t border-slate-100 dark:border-slate-800">
        <td class="p-3"><button class="text-blue-600 hover:underline font-medium" data-baixar="${d.id}" data-nome="${esc(d.nome_original)}">${esc(d.nome_original)}</button></td>
        <td class="p-3">${esc(ROTULOS_TIPO_DOC[d.tipo_documento] || d.tipo_documento)}</td>
        <td class="p-3">${esc(ROTULOS_ENTIDADE[d.entidade_tipo])} #${d.entidade_id}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${badge}">${esc(d.status)}</span></td>
        <td class="p-3">${acoes}</td>
      </tr>`;
    }));
    document.getElementById('corpoDocumentos').innerHTML = linhas.join('') || '<tr><td class="p-3 text-slate-400" colspan="5">Nenhum documento enviado ainda.</td></tr>';

    document.querySelectorAll('[data-aprovar]').forEach((b) => b.addEventListener('click', () => revisar(b.dataset.aprovar, 'aprovado')));
    document.querySelectorAll('[data-rejeitar]').forEach((b) => b.addEventListener('click', () => {
      const motivo = prompt('Motivo da rejeição:');
      if (motivo) revisar(b.dataset.rejeitar, 'rejeitado', motivo);
    }));
    document.querySelectorAll('[data-baixar]').forEach((b) => b.addEventListener('click', async () => {
      try {
        const r = await fetch(`/api/onimob/documentos/${b.dataset.baixar}/arquivo`, { headers: { Authorization: 'Bearer ' + tokenAuth() } });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || 'Erro ao baixar.');
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = b.dataset.nome; a.click();
        URL.revokeObjectURL(url);
      } catch (err) { alert(err.message); }
    }));
  }

  async function revisar(id, status, motivo_rejeicao) {
    try {
      await api('PATCH', `/api/onimob/documentos/${id}/revisar`, { status, motivo_rejeicao: motivo_rejeicao || null });
      await carregarDocumentos();
    } catch (err) { alert(err.message); }
  }

  document.getElementById('formDocumento').addEventListener('submit', async (e) => {
    e.preventDefault();
    const erro = document.getElementById('erroDocumento');
    const fd = new FormData(e.target);
    try {
      const r = await fetch('/api/onimob/documentos', { method: 'POST', body: fd });
      const dados = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(dados.detail || 'Erro ao enviar documento.');
      e.target.reset();
      document.getElementById('selEntidadeAlvo').innerHTML = '<option value="">Escolha o tipo primeiro</option>';
      erro.classList.add('hidden');
      await carregarDocumentos();
    } catch (err) { erro.textContent = err.message; erro.classList.remove('hidden'); }
  });

  // ── Inicialização ────────────────────────────────────────────────────────
  Promise.all([carregarResumo(), carregarImoveis(), carregarProprietarios(), carregarInquilinos(), carregarCorretores(), carregarFiadores(), carregarListasVinculo(), carregarDocumentos()])
    .then(() => { if (window.lucide) lucide.createIcons(); })
    .catch((e) => console.error('Onimob cadastro: falha ao carregar dados iniciais', e));
})();
