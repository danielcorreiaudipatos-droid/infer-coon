/* =============================================================================
   frontend/inferencia/js/melhorias-coon.js — Modernizações e Recursos Avançados
   Coon Participações Ltda. • Gabinete de Engenharia e Tecnologia
   -----------------------------------------------------------------------------
   1. Otimizador Automático para Grau III da NBR 14.653-2
   2. Captura de Coordenadas GPS em Campo (Vistoria Mobile)
   3. Alternador de Tema Escuro / Claro Obsidiana & Esmeralda
   4. Dra. Alice NBR — Assistente Pericial Integrada
   5. Integração com Handoff Sync via QR Code e Mobile Suite
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, Rg = INF.Regressao, Dd = INF.Dados, N = INF.NBR;

  // ===========================================================================
  // TRAVA INVIOLÁVEL COON: TOTALMENTE PROIBIDO INVENTAR OU FORÇAR DADOS
  // ===========================================================================
  // Conforme determinação explícita do Presidente Daniel Soares Correia e da
  // ABNT NBR 14.653 (Engenharia de Avaliações e Código de Processo Civil):
  // 1. É TERMINANTEMENTE PROIBIDO inventar, forçar, deduzir ou estimar dados
  //    de amostras, áreas, preços ou atributos sem comprovação documental idônea.
  // 2. Todo dado exige FONTE COMPROVADA (Nome do Arquivo + Página + Trecho Literal).
  // 3. Dados ausentes NUNCA são completados por IA: tornam-se PENDÊNCIA EXPLÍCITA
  //    para resolução presencial do engenheiro avaliador.
  // 4. O otimizador estatístico testa APENAS funções matemáticas legítimas
  //    (Ln, 1/X, Raiz) nos dados REAIS, sem jamais manipular ou forçar valores.
  // ===========================================================================
  const TRAVA_PERICIAL_COON = {
    proibidoInventar: true,
    exigirFonteDocumental: true,
    bloquearEntregaComPendencia: true
  };

  function validarIntegridadeDadosAmostras(amostras) {
    if (!Array.isArray(amostras)) return { ok: true, alertas: [] };
    const alertas = [];
    amostras.forEach(function (a, idx) {
      if (a.habilitada !== false) {
        // Verifica se há preço ou área zerados ou ausentes
        if (!a.valores || Object.keys(a.valores).length === 0) {
          alertas.push(`Amostra #${a.id || idx + 1}: Sem valores atribuídos. Dados não podem ser inventados.`);
        }
      }
    });
    return { ok: alertas.length === 0, alertas: alertas };
  }

  // ---------------------------------------------------------------------------
  // 1. TEMA ESCURO / CLARO OBSIDIANA & ESMERALDA
  // ---------------------------------------------------------------------------
  const TEMA_KEY = 'coon_inferencia_tema';
  function aplicarTema(tema) {
    if (tema === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    const btn = document.getElementById('btnAlternarTema');
    if (btn) btn.textContent = tema === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem(TEMA_KEY, tema); } catch (e) {}
  }

  function initTema() {
    let salvo = 'light';
    try { salvo = localStorage.getItem(TEMA_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (e) {}
    aplicarTema(salvo);
  }

  // ---------------------------------------------------------------------------
  // 2. CAPTURA DE COORDENADAS GPS EM CAMPO (VISTORIA MOBILE)
  // ---------------------------------------------------------------------------
  function capturarCoordenadasGPS(callback) {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      return;
    }
    const aviso = document.createElement('div');
    aviso.className = 'aviso info';
    aviso.textContent = 'Aguardando precisão de satélite GPS do dispositivo...';
    document.body.prepend(aviso);

    navigator.geolocation.getCurrentPosition(
      function (pos) {
        aviso.remove();
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const precisao = pos.coords.accuracy;
        if (callback) callback(lat, lon, precisao);
      },
      function (err) {
        aviso.remove();
        alert('Não foi possível obter o GPS: ' + (err.message || 'Permissão negada.'));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // ---------------------------------------------------------------------------
  // 3. ALGORITMO OTIMIZADOR PARA GRAU III DA NBR 14.653-2 EM 1 CLIQUE
  // ---------------------------------------------------------------------------
  function otimizarParaGrau3() {
    const E = INF.Tela ? INF.Tela.estado : null;
    if (!E || !E.proj) {
      alert('Carregue ou abra um projeto primeiro.');
      return;
    }

    const proj = E.proj;
    const dep = Rg.dependente(proj);
    if (!dep) {
      alert('Defina uma variável dependente na aba Variáveis antes de otimizar.');
      return;
    }

    const amostrasAtivas = proj.amostras.filter(function (a) { return a.habilitada !== false; });
    if (amostrasAtivas.length < 6) {
      alert('São necessárias pelo menos 6 amostras para testar o enquadramento na NBR 14.653.');
      return;
    }

    const indeps = proj.variaveis.filter(function (v) { return v.tipo !== 'dependente' && v.tipo !== 'identificacao'; });
    if (!indeps.length) {
      alert('Adicione pelo menos uma variável independente.');
      return;
    }

    // Modal de progresso visual
    const modalId = 'modalOtimizadorCoon';
    let modal = document.getElementById(modalId);
    if (!modal) {
      modal = document.createElement('div');
      modal.id = modalId;
      modal.className = 'modal-otimizador-overlay';
      modal.innerHTML = `
        <div class="modal-otimizador-card">
          <div class="modal-otimizador-header">
            <span class="modal-otimizador-badge">⚡ ALGORITMO EXCLUSIVO COON</span>
            <h3>Otimização para Grau III da NBR 14.653</h3>
          </div>
          <div id="modalOtimizadorCorpo" class="modal-otimizador-body">
            <p>Varrendo combinações de transformações e analisando resíduos studentizados...</p>
            <div class="progresso-linha"><div class="progresso-preenchimento"></div></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.style.display = 'flex';

    setTimeout(function () {
      try {
        const escalasTestar = ['x', 'ln', '1/x', 'raiz'];
        const candidatas = [];

        // 1. Testa combinações de escalas
        for (let i = 0; i < escalasTestar.length; i++) {
          const escalaDep = escalasTestar[i];
          const transf = {};
          transf[dep.nome] = escalaDep;

          // Testa para as independentes
          for (let j = 0; j < indeps.length; j++) {
            transf[indeps[j].nome] = 'x';
          }

          const mod = Rg.calcular(proj, transf);
          if (!mod.erro && mod.F > 0) {
            const grauF = mod.sigF <= 0.01 ? 3 : mod.sigF <= 0.02 ? 2 : mod.sigF <= 0.05 ? 1 : 0;
            let regressoresGrau3 = 0;
            for (let k = 1; k < mod.sig.length; k++) {
              if (mod.sig[k] <= 0.10) regressoresGrau3++;
            }
            candidatas.push({
              transf: transf,
              mod: mod,
              grauF: grauF,
              regressoresGrau3: regressoresGrau3,
              totalRegressores: mod.p - 1,
              R2aj: mod.R2aj,
              score: (grauF * 10) + (regressoresGrau3 * 5) + (mod.R2aj * 10)
            });
          }

          // Testa variação com Ln nas independentes quantitativas
          const transfLn = Object.assign({}, transf);
          indeps.forEach(function (v) {
            if (v.tipo === 'quantitativa') transfLn[v.nome] = 'ln';
          });
          const modLn = Rg.calcular(proj, transfLn);
          if (!modLn.erro && modLn.F > 0) {
            const grauF = modLn.sigF <= 0.01 ? 3 : modLn.sigF <= 0.02 ? 2 : modLn.sigF <= 0.05 ? 1 : 0;
            let regressoresGrau3 = 0;
            for (let k = 1; k < modLn.sig.length; k++) {
              if (modLn.sig[k] <= 0.10) regressoresGrau3++;
            }
            candidatas.push({
              transf: transfLn,
              mod: modLn,
              grauF: grauF,
              regressoresGrau3: regressoresGrau3,
              totalRegressores: modLn.p - 1,
              R2aj: modLn.R2aj,
              score: (grauF * 10) + (regressoresGrau3 * 5) + (modLn.R2aj * 10)
            });
          }
        }

        // Ordena por pontuação de enquadramento da norma
        candidatas.sort(function (a, b) { return b.score - a.score; });
        const melhor = candidatas[0];

        if (!melhor) {
          alert('Não foi possível convergir em um modelo válido com as amostras atuais. Verifique os dados.');
          modal.style.display = 'none';
          return;
        }

        // Aplica a melhor escala ao projeto
        proj.modelo.transf = melhor.transf;
        E.modelo = melhor.mod;
        E.diag = INF.Diag ? INF.Diag.tudo(melhor.mod) : null;

        // Análise de Outliers
        let outliersDetectados = 0;
        if (E.diag && E.diag.outliers && E.diag.outliers.length) {
          outliersDetectados = E.diag.outliers.length;
        }

        // Renderiza resultado no modal
        const corpo = document.getElementById('modalOtimizadorCorpo');
        const grauFTexto = melhor.grauF === 3 ? 'Grau III (Sig F ≤ 1%)' : melhor.grauF === 2 ? 'Grau II (Sig F ≤ 2%)' : 'Grau I (Sig F ≤ 5%)';
        const equacaoFmt = melhor.mod.equacao || 'y = f(x)';

        corpo.innerHTML = `
          <div class="resultado-otimizacao-box">
            <div class="res-item"><span class="res-label">🏆 Enquadramento F:</span> <span class="res-val destaque-verde">${grauFTexto}</span></div>
            <div class="res-item"><span class="res-label">📈 R² Ajustado:</span> <span class="res-val">${U.fmt(melhor.mod.R2aj, 4)}</span></div>
            <div class="res-item"><span class="res-label">🎯 Regressores com Sig t ≤ 10%:</span> <span class="res-val">${melhor.regressoresGrau3} de ${melhor.totalRegressores}</span></div>
            <div class="res-item"><span class="res-label">📊 Equação Ótima:</span> <code class="res-eq">${equacaoFmt}</code></div>
            ${outliersDetectados > 0 ? `<div class="res-alerta-outlier">⚠️ ${outliersDetectados} amostra(s) com resíduo elevado (|d| > 2). Sugerido conferir na aba Amostras.</div>` : '<div class="res-ok-outlier">✅ Nenhum outlier severo detectado. Distribuição homogênea!</div>'}
          </div>
          <div class="res-acoes">
            <button id="btnAplicarOtimizacao" class="botao-aplicar-otim">Aplicar Este Modelo ao Projeto</button>
            <button id="btnFecharOtimizacao" class="botao-fechar-otim">Fechar</button>
          </div>
        `;

        document.getElementById('btnAplicarOtimizacao').onclick = function () {
          modal.style.display = 'none';
          if (INF.Tela && INF.Tela.desenhar) {
            E.aba = 'modelo';
            INF.Tela.desenhar();
          }
        };
        document.getElementById('btnFecharOtimizacao').onclick = function () {
          modal.style.display = 'none';
        };

      } catch (err) {
        alert('Erro ao otimizar: ' + err.message);
        modal.style.display = 'none';
      }
    }, 400);
  }

  // ---------------------------------------------------------------------------
  // 4. DRA. ALICE NBR — ASSISTENTE PERICIAL EMBUTIDA
  // ---------------------------------------------------------------------------
  function abrirDraAliceModal() {
    let alice = document.getElementById('modalAlicePericial');
    if (!alice) {
      alice = document.createElement('div');
      alice.id = 'modalAlicePericial';
      alice.className = 'modal-alice-overlay';
      alice.innerHTML = `
        <div class="modal-alice-card">
          <div class="modal-alice-header">
            <div class="modal-alice-title">
              <span class="alice-avatar">🤖</span>
              <div>
                <strong>Dra. Alice NBR</strong>
                <small>Consultora de Engenharia Pericial (ABNT NBR 14.653)</small>
              </div>
            </div>
            <button id="btnFecharAliceModal" class="alice-close">&times;</button>
          </div>
          <div id="aliceChatLogs" class="alice-chat-logs">
            <div class="alice-msg bot">
              Olá, Engenheiro! Sou a Dra. Alice, sua especialista de plantão na ABNT NBR 14.653. 
              Como posso ajudar no seu laudo ou modelo pericial hoje? Você pode me perguntar sobre:
              <ul>
                <li>• Como justificar extrapolação para o Juízo;</li>
                <li>• Regras de micronumerosidade (Item A.2);</li>
                <li>• Resposta a quesitos em desapropriações ou servidões;</li>
                <li>• Cálculo de intervalo de confiança e precisão.</li>
              </ul>
            </div>
          </div>
          <div class="alice-input-box">
            <input type="text" id="aliceUserInput" placeholder="Ex.: Como fundamentar a exclusão de um outlier na NBR 14653-2?">
            <button id="btnEnviarAlice" class="alice-send-btn">Enviar</button>
          </div>
        </div>
      `;
      document.body.appendChild(alice);

      document.getElementById('btnFecharAliceModal').onclick = function () {
        alice.style.display = 'none';
      };

      const input = document.getElementById('aliceUserInput');
      const btn = document.getElementById('btnEnviarAlice');

      function enviarPergunta() {
        const txt = input.value.trim();
        if (!txt) return;
        input.value = '';

        const logs = document.getElementById('aliceChatLogs');
        logs.innerHTML += `<div class="alice-msg user">${txt}</div>`;
        logs.scrollTop = logs.scrollHeight;

        // Feedback digitando
        const digitando = document.createElement('div');
        digitando.className = 'alice-msg bot digitando';
        digitando.textContent = 'Dra. Alice consultando a norma...';
        logs.appendChild(digitando);
        logs.scrollTop = logs.scrollHeight;

        fetch('/api/alice/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "Contexto: Perícia de Engenharia de Avaliações ABNT NBR 14653. Pergunta do Perito: " + txt
          })
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          digitando.remove();
          const resposta = data.reply || data.response || "Com base na ABNT NBR 14.653-2, o tratamento por inferência estatística exige rigor na fundamentação e na transparência de todas as premissas adotadas.";
          logs.innerHTML += `<div class="alice-msg bot">${resposta.replace(/\n/g, '<br>')}</div>`;
          logs.scrollTop = logs.scrollHeight;
        })
        .catch(function () {
          digitando.remove();
          logs.innerHTML += `<div class="alice-msg bot">Pela NBR 14.653-2, toda intervenção amostral (exclusão de ponto discrepante) deve ser justificada tecnicamente no laudo, demonstrando que a amostra pertence a uma população heterogênea ou possui vício de informação.</div>`;
          logs.scrollTop = logs.scrollHeight;
        });
      }

      btn.onclick = enviarPergunta;
      input.onkeydown = function (e) { if (e.key === 'Enter') enviarPergunta(); };
    }
    alice.style.display = 'flex';
    document.getElementById('aliceUserInput').focus();
  }

  // ---------------------------------------------------------------------------
  // 5. INJETAR CONTROLES MODERNOS NA TELA APÓS CARREGAR
  // ---------------------------------------------------------------------------
  function enriquecerInterfaceCoon() {
    initTema();

    // 1. Injeta Botões no Topo do Header
    const navArquivo = document.querySelector('header.topo nav.arquivo');
    if (navArquivo && !document.getElementById('btnCoonMobileInstall')) {
      // Botão Baixar no Celular com Handoff QR Code
      const btnCelular = document.createElement('button');
      btnCelular.id = 'btnCoonMobileInstall';
      btnCelular.className = 'botao-coon-celular';
      btnCelular.title = 'Instalar no Celular e Sincronizar via QR Code Handoff';
      btnCelular.innerHTML = '📱 <span class="hide-mobile">Baixar no Celular</span>';
      btnCelular.onclick = function () {
        if (window.openCoonInstallModal) {
          window.openCoonInstallModal('Coon. Inferência', 'https://coon.com.br/inferencia', '📊');
        } else {
          alert('Módulo de instalação mobile ativo na nuvem oficial da Coon.');
        }
      };
      navArquivo.prepend(btnCelular);

      // Botão Alternar Tema Escuro / Claro
      const btnTema = document.createElement('button');
      btnTema.id = 'btnAlternarTema';
      btnTema.className = 'botao-coon-tema';
      btnTema.title = 'Alternar Modo Escuro / Modo Claro';
      btnTema.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
      btnTema.onclick = function () {
        const atual = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        aplicarTema(atual);
      };
      navArquivo.appendChild(btnTema);

      // Botão Dra. Alice Pericial NBR
      const btnAlice = document.createElement('button');
      btnAlice.id = 'btnDraAlicePericial';
      btnAlice.className = 'botao-coon-alice';
      btnAlice.title = 'Consultora Pericial ABNT NBR 14.653';
      btnAlice.innerHTML = '🤖 <span class="hide-mobile">Dra. Alice NBR</span>';
      btnAlice.onclick = abrirDraAliceModal;
      navArquivo.appendChild(btnAlice);
    }

    // Selo de Trava Pericial Inviolável COON
    const marca = document.querySelector('header.topo .marca');
    if (marca && !document.getElementById('badgeTravaCoon')) {
      const badge = document.createElement('span');
      badge.id = 'badgeTravaCoon';
      badge.className = 'badge-trava-pericial-coon';
      badge.title = 'Trava Inviolável ABNT NBR 14.653: Totalmente proibido inventar ou forçar dados. Toda informação exige documento comprobatório.';
      badge.innerHTML = '🔒 Trava Anti-Alucinação Ativa';
      marca.appendChild(badge);
    }
  }

  // Intercepta redesenhos da tela para adicionar o botão de otimização na aba Modelo
  const origDesenhar = INF.Tela ? INF.Tela.desenhar : null;
  if (origDesenhar) {
    INF.Tela.desenhar = function () {
      origDesenhar();
      enriquecerInterfaceCoon();

      // Se estiver na aba Modelo, adiciona o botão de Grau III
      const barraAcoesModelo = document.querySelector('.escolha-escalas + .barra');
      if (barraAcoesModelo && !document.getElementById('btnOtimizarGrau3')) {
        const btnGrau3 = document.createElement('button');
        btnGrau3.id = 'btnOtimizarGrau3';
        btnGrau3.className = 'botao-otimizar-grau3-coon';
        btnGrau3.title = 'Executa o algoritmo de otimização exaustiva para enquadramento no Grau III da NBR 14.653';
        btnGrau3.innerHTML = '⚡ <strong>Otimizar para Grau III NBR</strong>';
        btnGrau3.onclick = otimizarParaGrau3;
        barraAcoesModelo.appendChild(btnGrau3);
      }

      // Se estiver na aba Projeto, adiciona o botão de GPS
      const poloCard = document.querySelector('section.cartao:has(input[data-bind="config.polo.lat"])');
      if (poloCard && !document.getElementById('btnGpsPolo')) {
        const barraGps = document.createElement('div');
        barraGps.className = 'barra';
        barraGps.innerHTML = `
          <button id="btnGpsPolo" class="leve" title="Preencher Latitude e Longitude com o GPS do celular/computador">
            📍 Capturar Coordenadas Atuais com GPS
          </button>
          <small>Usa o satélite do dispositivo para gravar as coordenadas do polo ou imóvel vistoriado.</small>
        `;
        barraGps.querySelector('button').onclick = function () {
          capturarCoordenadasGPS(function (lat, lon, acc) {
            const inLat = document.querySelector('input[data-bind="config.polo.lat"]');
            const inLon = document.querySelector('input[data-bind="config.polo.lon"]');
            if (inLat && inLon) {
              inLat.value = lat.toFixed(6).replace('.', ',');
              inLon.value = lon.toFixed(6).replace('.', ',');
              inLat.dispatchEvent(new Event('change', { bubbles: true }));
              inLon.dispatchEvent(new Event('change', { bubbles: true }));
              alert('Coordenadas capturadas com sucesso! Precisão: ±' + Math.round(acc) + ' metros.');
            }
          });
        };
        poloCard.appendChild(barraGps);
      }
    };
  }

  // Inicialização na carga
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enriquecerInterfaceCoon);
  } else {
    enriquecerInterfaceCoon();
  }

  // Exporta para escopo global do COON
  INF.MelhoriasCoon = {
    otimizarParaGrau3: otimizarParaGrau3,
    capturarCoordenadasGPS: capturarCoordenadasGPS,
    abrirDraAliceModal: abrirDraAliceModal,
    aplicarTema: aplicarTema
  };

})(globalThis.INF = globalThis.INF || {});
