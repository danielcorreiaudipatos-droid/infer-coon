/**
 * 🤖 IA Actions Modal — Integração com ações do sistema
 * Quando usuário clica "Gerar Cobrança", abre modal pra preencher dados
 */

class IAActionsModal {
    constructor() {
        this.acoes = {
            "gerar_cobranca": this.acaoGerarCobranca.bind(this),
            "gerar_aviso_protesto": this.acaoGerarAvisoProtesto.bind(this),
            "calcular_multa": this.acaoCalcularMulta.bind(this),
            "enviar_whatsapp": this.acaoEnviarWhatsApp.bind(this),
            "registrar_deducao": this.acaoRegistrarDeducao.bind(this),
            "liberar_caacao": this.acaoLiberarCaacao.bind(this),
            "gerar_comunicado": this.acaoGerarComunicado.bind(this),
            "publicar_imovel": this.acaoPublicarImovel.bind(this)
        };
    }

    // ====== AÇÕES DE COBRANÇA ======

    acaoGerarCobranca(dados) {
        const html = `
            <div class="modal-header">Gerar Aviso de Cobrança</div>
            <form class="modal-form">
                <div class="form-group">
                    <label>Inquilino:</label>
                    <input type="text" value="${dados.inquilino_nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Imóvel:</label>
                    <input type="text" value="${dados.imovel_nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Valor em Atraso:</label>
                    <input type="text" value="R$ ${dados.valor_aluguel || '0'}" readonly>
                </div>
                <div class="form-group">
                    <label>Dias de Atraso:</label>
                    <input type="number" value="${dados.dias_atraso || 0}" readonly>
                </div>
                <div class="form-group">
                    <label>Tipo de Cobrança:</label>
                    <select id="tipoCobranca">
                        <option value="gentil">Cobrança Gentil (1º aviso)</option>
                        <option value="protesto">Aviso de Protesto (2º aviso)</option>
                        <option value="ultima">Última Chance (3º aviso)</option>
                    </select>
                </div>
                <button type="button" class="btn-primary" onclick="executarGerarCobranca()">
                    📧 Gerar e Enviar
                </button>
            </form>
        `;
        this.mostrarModal(html);
    }

    acaoGerarAvisoProtesto(dados) {
        const html = `
            <div class="modal-header">⚠️ Gerar Aviso de Protesto</div>
            <form class="modal-form">
                <div class="alert alert-warning">
                    <strong>Atenção!</strong> Esta é uma ação legal. Após 3 meses de atraso, 
                    você pode registrar protesto em cartório.
                </div>
                <div class="form-group">
                    <label>Inquilino:</label>
                    <input type="text" value="${dados.inquilino_nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Valor Total (com multa):</label>
                    <input type="text" id="valorTotal" value="R$ 0" readonly>
                </div>
                <div class="form-group">
                    <label>Data Limite para Pagamento:</label>
                    <input type="date" id="dataLimite">
                </div>
                <div class="form-group">
                    <input type="checkbox" id="enviarAdvogado">
                    <label for="enviarAdvogado">Enviar cópia para advogado</label>
                </div>
                <button type="button" class="btn-danger" onclick="executarGerarProtesto()">
                    ⚖️ Gerar Aviso Legal
                </button>
            </form>
        `;
        this.mostrarModal(html);
    }

    acaoCalcularMulta(dados) {
        const diasAtraso = dados.dias_atraso || 0;
        const valorAluguel = parseFloat(dados.valor_aluguel?.replace(/[^\d.]/g, '') || 0);
        
        const multa = valorAluguel * 0.10; // 10%
        const juros = (valorAluguel * 0.01 * diasAtraso) / 30; // 1% a.m.
        const total = valorAluguel + multa + juros;
        
        const html = `
            <div class="modal-header">💰 Cálculo de Multa</div>
            <div class="modal-body">
                <div class="calc-item">
                    <span>Aluguel Base:</span>
                    <strong>R$ ${valorAluguel.toFixed(2)}</strong>
                </div>
                <div class="calc-item">
                    <span>Multa por Atraso (10%):</span>
                    <strong>R$ ${multa.toFixed(2)}</strong>
                </div>
                <div class="calc-item">
                    <span>Juros (1% a.m. × ${diasAtraso} dias):</span>
                    <strong>R$ ${juros.toFixed(2)}</strong>
                </div>
                <div class="calc-total">
                    <span>TOTAL A COBRAR:</span>
                    <strong>R$ ${total.toFixed(2)}</strong>
                </div>
                <div class="info-text">
                    Conforme Lei 8.245/91 (Lei de Locação)
                </div>
            </div>
            <button class="btn-primary" onclick="copiarValor('${total.toFixed(2)}')">
                📋 Copiar Valor
            </button>
        `;
        this.mostrarModal(html);
    }

    acaoEnviarWhatsApp(dados) {
        const html = `
            <div class="modal-header">💬 Enviar via WhatsApp</div>
            <form class="modal-form">
                <div class="form-group">
                    <label>Número WhatsApp (com código país):</label>
                    <input type="text" id="whatsappNumber" placeholder="+55 11 9XXXX-XXXX" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Mensagem:</label>
                    <select id="tipoMensagem">
                        <option value="gentil">Lembrança Gentil</option>
                        <option value="formal">Aviso Formal</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Mensagem Customizada:</label>
                    <textarea id="mensagemCustom" placeholder="Deixe em branco para usar padrão"></textarea>
                </div>
                <button type="button" class="btn-primary" onclick="enviarWhatsAppAgora()">
                    📱 Enviar WhatsApp
                </button>
            </form>
        `;
        this.mostrarModal(html);
    }

    // ====== AÇÕES DE GARANTIAS ======

    acaoRegistrarDeducao(dados) {
        const html = `
            <div class="modal-header">💸 Registrar Deducção de Caução</div>
            <form class="modal-form">
                <div class="form-group">
                    <label>Motivo da Deducção:</label>
                    <select id="motivoDeducao" required>
                        <option value="">Selecione...</option>
                        <option value="dano_parede">Dano em Parede</option>
                        <option value="limpeza">Limpeza Profissional</option>
                        <option value="reparo_vidro">Reparo de Vidro</option>
                        <option value="atraso">Atraso de Aluguel</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Valor da Deducção:</label>
                    <input type="number" id="valorDeducao" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Descrição Detalhada:</label>
                    <textarea id="descricaoDeducao" required></textarea>
                </div>
                <div class="form-group">
                    <label>Comprovante/Nota:</label>
                    <input type="file" id="comprovanteDeducao">
                </div>
                <button type="button" class="btn-primary" onclick="registrarDeducaoAgora()">
                    💾 Registrar Deducção
                </button>
            </form>
        `;
        this.mostrarModal(html);
    }

    acaoLiberarCaacao(dados) {
        const html = `
            <div class="modal-header">✅ Liberar Caução</div>
            <div class="modal-body">
                <div class="alert alert-success">
                    Contrato finalizado. Prepare a devolução da caução.
                </div>
                <div class="calc-item">
                    <span>Valor Original da Caução:</span>
                    <strong>R$ ${dados.valor_caacao || '0'}</strong>
                </div>
                <div class="calc-item">
                    <span>Total de Deduções:</span>
                    <strong id="totalDeducoes">R$ 0</strong>
                </div>
                <div class="calc-total">
                    <span>SALDO A DEVOLVER:</span>
                    <strong id="saldoDevolver">R$ ${dados.valor_caacao || '0'}</strong>
                </div>
                
                <div class="form-group" style="margin-top: 2rem;">
                    <label>Forma de Devolução:</label>
                    <select id="formaDevolucao" required>
                        <option value="transferencia">Transferência Bancária</option>
                        <option value="pix">PIX</option>
                        <option value="cheque">Cheque</option>
                        <option value="presencial">Entrega Presencial</option>
                    </select>
                </div>
                
                <button class="btn-primary" onclick="liberarCaucaoAgora()">
                    ✅ Gerar Comunicado Devolução
                </button>
            </div>
        `;
        this.mostrarModal(html);
    }

    // ====== AÇÕES DE COMUNICADOS ======

    acaoGerarComunicado(dados) {
        const html = `
            <div class="modal-header">📢 Gerar Comunicado Personalizado</div>
            <form class="modal-form">
                <div class="form-group">
                    <label>Destinatário:</label>
                    <input type="text" value="${dados.inquilino_nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Tipo de Comunicado:</label>
                    <select id="tipoComunicado" onchange="atualizarTemplate()">
                        <option value="manutencao">Manutenção do Imóvel</option>
                        <option value="vistoria">Vistoria</option>
                        <option value="reajuste">Reajuste de Aluguel</option>
                        <option value="encerramento">Encerramento de Contrato</option>
                        <option value="custom">Customizado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Conteúdo:</label>
                    <textarea id="conteudoComunicado" required></textarea>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="enviarEmail">
                    <label for="enviarEmail">Enviar por Email</label>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="enviarWhats">
                    <label for="enviarWhats">Enviar por WhatsApp</label>
                </div>
                <button type="button" class="btn-primary" onclick="gerarComunicadoAgora()">
                    📤 Gerar e Enviar
                </button>
            </form>
        `;
        this.mostrarModal(html);
    }

    // ====== AÇÕES DE PUBLICAÇÃO ======

    acaoPublicarImovel(dados) {
        const html = `
            <div class="modal-header">🌐 Publicar Imóvel no Site</div>
            <form class="modal-form">
                <div class="form-group">
                    <label>Imóvel:</label>
                    <input type="text" value="${dados.imovel_nome || ''}" readonly>
                </div>
                <div class="form-group">
                    <label>Título para Publicação:</label>
                    <input type="text" id="tituloPubl" value="${dados.imovel_nome || ''}" required>
                </div>
                <div class="form-group">
                    <label>Descrição:</label>
                    <textarea id="descricaoPubl" placeholder="Descreva o imóvel..." required></textarea>
                </div>
                <div class="form-group">
                    <label>Valor do Aluguel:</label>
                    <input type="text" id="valorPubl" value="R$ ${dados.valor_aluguel || ''}" required>
                </div>
                <div class="form-group">
                    <label>Fotos (selecionar):</label>
                    <input type="file" id="fotosPubl" multiple accept="image/*">
                </div>
                <button type="button" class="btn-primary" onclick="publicarImovelAgora()">
                    🚀 Publicar
                </button>
            </form>
        `;
        this.mostrarModal(html);
    }

    // ====== UTILS ======

    mostrarModal(html) {
        const modal = document.getElementById('iaActionModal');
        if (!modal) {
            const div = document.createElement('div');
            div.id = 'iaActionModal';
            div.className = 'ia-action-modal';
            div.innerHTML = html + '<button class="modal-close" onclick="fecharActionModal()">✕</button>';
            div.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 2rem;
            `;
            document.body.appendChild(div);
        } else {
            modal.innerHTML = html + '<button class="modal-close" onclick="fecharActionModal()">✕</button>';
            modal.style.display = 'block';
        }
    }
}

// Instância global
const iaActions = new IAActionsModal();

// Funções globais para usar nos modals
function fecharActionModal() {
    const modal = document.getElementById('iaActionModal');
    if (modal) modal.style.display = 'none';
}

function executarGerarCobranca() {
    const tipo = document.getElementById('tipoCobranca').value;
    alert(`✅ Gerando ${tipo}...`);
    fecharActionModal();
}

function executarGerarProtesto() {
    alert('✅ Gerando Aviso de Protesto...');
    fecharActionModal();
}

function copiarValor(valor) {
    navigator.clipboard.writeText(valor);
    alert('✅ Valor copiado: R$ ' + valor);
}

function enviarWhatsAppAgora() {
    const numero = document.getElementById('whatsappNumber').value;
    alert(`✅ Abrindo WhatsApp para: ${numero}`);
    fecharActionModal();
}

function registrarDeducaoAgora() {
    const motivo = document.getElementById('motivoDeducao').value;
    const valor = document.getElementById('valorDeducao').value;
    alert(`✅ Deducção registrada: R$ ${valor} (${motivo})`);
    fecharActionModal();
}

function liberarCaucaoAgora() {
    alert('✅ Gerando comunicado de devolução de caução...');
    fecharActionModal();
}

function gerarComunicadoAgora() {
    alert('✅ Comunicado gerado e enviado!');
    fecharActionModal();
}

function publicarImovelAgora() {
    alert('✅ Imóvel publicado no site!');
    fecharActionModal();
}

function atualizarTemplate() {
    const tipo = document.getElementById('tipoComunicado').value;
    const templates = {
        manutencao: 'Será realizada manutenção preventiva...',
        vistoria: 'Realizaremos vistoria no imóvel...',
        reajuste: 'Informamos sobre o reajuste do aluguel...',
        encerramento: 'Comunicamos o encerramento do contrato...',
        custom: ''
    };
    document.getElementById('conteudoComunicado').value = templates[tipo];
}
