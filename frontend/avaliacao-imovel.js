/**
 * 📊 Avaliação de Imóvel — Integração COON Infer com on.imob
 * Gera avaliação automática quando um imóvel é criado/atualizado
 */

class AvaliacaoImovel {
    constructor() {
        this.avaliacao_atual = null;
    }

    /**
     * Gera avaliação para um imóvel específico
     */
    async gerarAvaliacao(imovel_id, escritorio_id) {
        try {
            const response = await fetch(`/api/onimob/imoveis/${imovel_id}/avaliar?escritorio_id=${escritorio_id}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.sucesso) {
                this.avaliacao_atual = data.avaliacao;
                return data.avaliacao;
            } else {
                throw new Error(data.msg || 'Erro ao gerar avaliação');
            }
        } catch (error) {
            console.error('Erro ao gerar avaliação:', error);
            return null;
        }
    }

    /**
     * Obtém avaliação existente de um imóvel
     */
    async obterAvaliacao(imovel_id) {
        try {
            const response = await fetch(`/api/onimob/imoveis/${imovel_id}/avaliacao`);

            if (!response.ok) {
                return null; // Sem avaliação ainda
            }

            const data = await response.json();
            if (data.sucesso) {
                this.avaliacao_atual = data.avaliacao;
                return data.avaliacao;
            }
        } catch (error) {
            console.error('Erro ao obter avaliação:', error);
            return null;
        }
    }

    /**
     * Exibe card com resumo da avaliação
     */
    mostrarCardAvaliacao(elemento_pai, avaliacao) {
        const card = document.createElement('div');
        card.className = 'card avaliacao-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>📊 Avaliação COON</h3>
                <span class="badge badge-${this.getBadgeGrau(avaliacao.grau_precisao)}">
                    Grau ${avaliacao.grau_precisao}
                </span>
            </div>

            <div class="avaliacao-valor">
                <div class="valor-central">
                    <span class="label">Valor Estimado</span>
                    <span class="valor">R$ ${this.formatarValor(avaliacao.valor_central)}</span>
                </div>
                <div class="valor-intervalo">
                    <span class="label">Intervalo (80%)</span>
                    <span class="intervalo">
                        R$ ${this.formatarValor(avaliacao.valor_minimo)} a
                        R$ ${this.formatarValor(avaliacao.valor_maximo)}
                    </span>
                </div>
            </div>

            <div class="avaliacao-detalhes">
                <div class="detalhe">
                    <span class="label">Valor por m²</span>
                    <span class="valor">R$ ${this.formatarValor(avaliacao.valor_m2)}</span>
                </div>
                <div class="detalhe">
                    <span class="label">Amplitude</span>
                    <span class="valor">±${(avaliacao.intervalo_confianca * 100).toFixed(0)}%</span>
                </div>
            </div>

            <div class="avaliacao-acao">
                <button class="btn btn-sm" onclick="avaliacaoImovel.downloaderPDF()">
                    📥 Baixar PDF
                </button>
                <button class="btn btn-sm" onclick="avaliacaoImovel.mostrarDetalhes()">
                    🔍 Ver Detalhes
                </button>
            </div>
        `;

        elemento_pai.appendChild(card);
        this.adicionarEstilos();
    }

    /**
     * Mostra modal com detalhes completos da avaliação
     */
    mostrarDetalhes() {
        if (!this.avaliacao_atual) {
            alert('Nenhuma avaliação disponível');
            return;
        }

        const avaliacao = this.avaliacao_atual;
        const vars = avaliacao.variáveis_usadas || {};

        const html = `
            <div class="modal-avaliacao">
                <div class="modal-header">
                    <h2>📊 Detalhes da Avaliação</h2>
                    <button class="close" onclick="document.querySelector('.modal-avaliacao').remove()">✕</button>
                </div>

                <div class="modal-body">
                    <div class="section">
                        <h3>💰 Valor Estimado</h3>
                        <div class="valor-display">
                            <div class="valor-grande">R$ ${this.formatarValor(avaliacao.valor_central)}</div>
                            <div class="intervalo-display">
                                Intervalo: R$ ${this.formatarValor(avaliacao.valor_minimo)} a R$ ${this.formatarValor(avaliacao.valor_maximo)}
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>📈 Variáveis Utilizadas</h3>
                        <table class="vars-table">
                            <tr>
                                <td><strong>Localização</strong></td>
                                <td>${vars.bairro || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Área Útil</strong></td>
                                <td>${vars.area_util} m²</td>
                            </tr>
                            <tr>
                                <td><strong>Tipo</strong></td>
                                <td>${vars.tipo || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Quartos</strong></td>
                                <td>${vars.quartos}</td>
                            </tr>
                            <tr>
                                <td><strong>Banheiros</strong></td>
                                <td>${vars.banheiros}</td>
                            </tr>
                            <tr>
                                <td><strong>Garagens</strong></td>
                                <td>${vars.garagens}</td>
                            </tr>
                            <tr>
                                <td><strong>Padrão</strong></td>
                                <td>${vars.padrão} (${vars.ajuste_padrao > 0 ? '+' : ''}${vars.ajuste_padrao}%)</td>
                            </tr>
                            <tr>
                                <td><strong>Idade</strong></td>
                                <td>${vars.idade_anos} anos (${vars.ajuste_idade > 0 ? '+' : ''}${vars.ajuste_idade}%)</td>
                            </tr>
                            <tr>
                                <td><strong>Amenidades</strong></td>
                                <td>${vars.amenidades ? vars.amenidades.join(', ') : 'Nenhuma'} (${vars.ajuste_amenidades > 0 ? '+' : ''}${vars.ajuste_amenidades}%)</td>
                            </tr>
                        </table>
                    </div>

                    <div class="section">
                        <h3>✅ Precisão (NBR 14.653)</h3>
                        <div class="precisao-info">
                            <p><strong>Grau de Precisão:</strong> ${avaliacao.grau_precisao}</p>
                            <p><strong>Amplitude:</strong> ±${(avaliacao.intervalo_confianca * 100).toFixed(0)}%</p>
                            <p><strong>Nível de Confiança:</strong> 80% (conforme NBR 14.653-2)</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.innerHTML = html;
        modal.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        document.body.appendChild(modal);
        this.adicionarEstilos();
    }

    /**
     * Faz download do PDF da avaliação
     */
    async downloaderPDF() {
        alert('🎯 PDF será gerado em breve. Por enquanto, use a função "Exportar PDF" do dashboard.');
    }

    /**
     * Formata valor em moeda brasileira
     */
    formatarValor(valor) {
        if (!valor) return '0,00';
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /**
     * Retorna classe CSS baseado no grau
     */
    getBadgeGrau(grau) {
        if (grau === 'III') return 'success'; // Melhor
        if (grau === 'II') return 'info';
        return 'warning'; // Grau I
    }

    /**
     * Adiciona estilos CSS para a avaliação
     */
    adicionarEstilos() {
        if (document.querySelector('#estilos-avaliacao')) return; // Já adicionado

        const style = document.createElement('style');
        style.id = 'estilos-avaliacao';
        style.textContent = `
            .avaliacao-card {
                border: 2px solid #667eea;
                background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                padding: 1.5rem;
                border-radius: 8px;
                margin: 1rem 0;
            }

            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
            }

            .card-header h3 {
                color: #667eea;
                margin: 0;
            }

            .badge {
                padding: 0.3rem 0.8rem;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: bold;
            }

            .badge-success {
                background: #dcfce7;
                color: #166534;
            }

            .badge-info {
                background: #dbeafe;
                color: #1e40af;
            }

            .badge-warning {
                background: #fef3c7;
                color: #92400e;
            }

            .avaliacao-valor {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .avaliacao-valor > div {
                padding: 1rem;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #667eea;
            }

            .avaliacao-valor .label {
                display: block;
                font-size: 0.85rem;
                color: #666;
                margin-bottom: 0.5rem;
            }

            .avaliacao-valor .valor {
                display: block;
                font-size: 1.4rem;
                font-weight: bold;
                color: #22c55e;
            }

            .avaliacao-detalhes {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .detalhe {
                padding: 0.8rem;
                background: white;
                border-radius: 6px;
                text-align: center;
            }

            .detalhe .label {
                font-size: 0.8rem;
                color: #666;
                display: block;
                margin-bottom: 0.3rem;
            }

            .detalhe .valor {
                font-size: 1.1rem;
                font-weight: bold;
                color: #333;
                display: block;
            }

            .avaliacao-acao {
                display: flex;
                gap: 0.5rem;
            }

            .btn {
                padding: 0.5rem 1rem;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.9rem;
                flex: 1;
                transition: background 0.3s;
            }

            .btn:hover {
                background: #764ba2;
            }

            .btn-sm {
                padding: 0.4rem 0.8rem;
                font-size: 0.85rem;
            }

            /* Modal */
            .modal-avaliacao {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid #eee;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .modal-header h2 {
                margin: 0;
            }

            .modal-header .close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }

            .modal-body {
                padding: 1.5rem;
            }

            .section {
                margin-bottom: 1.5rem;
            }

            .section h3 {
                color: #667eea;
                margin-bottom: 1rem;
            }

            .valor-display {
                background: #f0f9ff;
                padding: 1.5rem;
                border-radius: 8px;
                border-left: 4px solid #0284c7;
                text-align: center;
            }

            .valor-grande {
                font-size: 2rem;
                font-weight: bold;
                color: #22c55e;
                margin-bottom: 0.5rem;
            }

            .intervalo-display {
                font-size: 0.95rem;
                color: #666;
            }

            .vars-table {
                width: 100%;
                border-collapse: collapse;
            }

            .vars-table tr {
                border-bottom: 1px solid #eee;
            }

            .vars-table td {
                padding: 0.8rem;
            }

            .vars-table tr:hover {
                background: #f9f9f9;
            }

            .precisao-info {
                background: #f0fdf4;
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #22c55e;
            }

            .precisao-info p {
                margin: 0.5rem 0;
                color: #166534;
            }
        `;

        document.head.appendChild(style);
    }
}

// Instância global
const avaliacaoImovel = new AvaliacaoImovel();
