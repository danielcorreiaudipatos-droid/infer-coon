/**
 * 🤖 IA Enhanced Features
 * Voz, Multi-idioma, Export Chat, Analytics
 */

class IAEnhancedFeatures {
    constructor() {
        this.idioma = 'pt-BR'; // português
        this.reconhecimentoVoz = null;
        this.historico = [];

        // Verificar suporte a voz
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.reconhecimentoVoz = new SpeechRecognition();
            this.reconhecimentoVoz.lang = 'pt-BR';
        }

        // Carregar histórico
        this.carregarHistorico();
    }

    // ====== VOZ ======

    iniciarReconhecimentoVoz() {
        if (!this.reconhecimentoVoz) {
            alert('❌ Reconhecimento de voz não suportado neste navegador');
            return;
        }

        const iconVoz = document.querySelector('.ia-voice-btn');
        if (iconVoz) iconVoz.textContent = '⏹️';

        this.reconhecimentoVoz.start();
        this.reconhecimentoVoz.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('iaInput').value = transcript;
        };

        this.reconhecimentoVoz.onend = () => {
            const iconVoz = document.querySelector('.ia-voice-btn');
            if (iconVoz) iconVoz.textContent = '🎤';
        };
    }

    // ====== MULTI-IDIOMA ======

    mudarIdioma(novoIdioma) {
        this.idioma = novoIdioma;
        const traducoes = {
            'pt-BR': {
                titulo: '🤖 Assistente on.imob',
                placeholder: 'Sua dúvida aqui...',
                contexto: '📍 Contexto',
                sugestoes: '💡 Sugestões',
                historico: '📜 Histórico',
                voz: '🎤 Voz',
                exportar: '📥 Exportar'
            },
            'en': {
                titulo: '🤖 on.imob Assistant',
                placeholder: 'Your question here...',
                contexto: '📍 Context',
                sugestoes: '💡 Suggestions',
                historico: '📜 History',
                voz: '🎤 Voice',
                exportar: '📥 Export'
            },
            'es': {
                titulo: '🤖 Asistente on.imob',
                placeholder: 'Tu pregunta aquí...',
                contexto: '📍 Contexto',
                sugestoes: '💡 Sugerencias',
                historico: '📜 Historial',
                voz: '🎤 Voz',
                exportar: '📥 Exportar'
            }
        };

        const t = traducoes[novoIdioma];
        if (t) {
            document.querySelector('.ia-header span').textContent = t.titulo;
            document.getElementById('iaInput').placeholder = t.placeholder;
        }
    }

    // ====== EXPORTAR CHAT ======

    exportarChatPDF() {
        const chatArea = document.getElementById('iaChatArea');
        const messages = chatArea.querySelectorAll('.ia-message');

        let conteudo = 'HISTÓRICO DE CHAT - on.imob\n';
        conteudo += `Data: ${new Date().toLocaleString('pt-BR')}\n`;
        conteudo += '===============================\n\n';

        messages.forEach(msg => {
            const tipo = msg.classList.contains('user') ? 'Você' : 'Assistente';
            conteudo += `${tipo}: ${msg.textContent}\n\n`;
        });

        // Criar blob e download
        const blob = new Blob([conteudo], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-onimob-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ Chat exportado como TXT!');
    }

    exportarChatEmail() {
        const chatArea = document.getElementById('iaChatArea');
        const messages = chatArea.querySelectorAll('.ia-message');

        let html = '<h2>Histórico de Chat - on.imob</h2>';
        html += `<p><small>Data: ${new Date().toLocaleString('pt-BR')}</small></p>`;
        html += '<hr>';

        messages.forEach(msg => {
            const tipo = msg.classList.contains('user') ? 'Você' : 'Assistente';
            const cor = msg.classList.contains('user') ? '#0066cc' : '#f0f0f0';
            html += `<p style="background: ${cor}; padding: 10px; border-radius: 5px;">
                        <strong>${tipo}:</strong> ${msg.textContent}
                    </p>`;
        });

        // Preparar email
        const assunto = 'Histórico de Chat - on.imob';
        const corpo = html;

        alert(`📧 Prepare para enviar por email!\n\nAssunto: ${assunto}\n\nCorpo:\n${corpo.replace(/<[^>]*>/g, '')}`);
    }

    // ====== ANALYTICS ======

    async registrarPergunta(pergunta, resposta, pagina, fonte) {
        try {
            await fetch('/api/onimob/ia/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_email: 'usuario@onimob.com', // TODO: pegar email real
                    pergunta,
                    resposta,
                    pagina,
                    fonte
                })
            });

            this.historico.push({ pergunta, resposta, timestamp: new Date() });
            this.salvarHistorico();
        } catch (e) {
            console.error('Erro ao registrar pergunta:', e);
        }
    }

    async carregarHistorico() {
        try {
            const res = await fetch('/api/onimob/ia/historico?usuario_email=usuario@onimob.com');
            const data = await res.json();
            this.historico = data.historico || [];
        } catch (e) {
            this.historico = [];
        }
    }

    async obterPerguntasFrequentes() {
        try {
            const res = await fetch('/api/onimob/ia/frequentes');
            const data = await res.json();
            return data.frequentes;
        } catch (e) {
            return [];
        }
    }

    salvarHistorico() {
        localStorage.setItem('iaHistorico', JSON.stringify(this.historico));
    }

    mostrarHistorico() {
        let html = '<h3>📜 Histórico de Perguntas</h3>';
        if (this.historico.length === 0) {
            html += '<p>Nenhuma pergunta no histórico</p>';
        } else {
            html += '<ul style="max-height: 300px; overflow-y: auto;">';
            this.historico.slice(-10).forEach(item => {
                html += `<li><strong>${item.pergunta}</strong></li>`;
            });
            html += '</ul>';
        }

        const modal = document.getElementById('iaPanel');
        alert(html); // TODO: substituir por modal real
    }

    // ====== ATALHOS DE TECLADO ======

    inicializarAtalhos() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + ? abre assistente
            if (e.ctrlKey && e.key === '?') {
                e.preventDefault();
                abrirAssistente();
            }

            // Alt + V para voz
            if (e.altKey && e.key === 'v') {
                e.preventDefault();
                this.iniciarReconhecimentoVoz();
            }
        });
    }
}

// Instância global
const iaEnhanced = new IAEnhancedFeatures();

// Funções globais
function iniciarVoz() {
    iaEnhanced.iniciarReconhecimentoVoz();
}

function mudarIdioma(idioma) {
    iaEnhanced.mudarIdioma(idioma);
}

function exportarChat(tipo) {
    if (tipo === 'pdf') {
        iaEnhanced.exportarChatPDF();
    } else if (tipo === 'email') {
        iaEnhanced.exportarChatEmail();
    }
}

function mostrarHistoricoPerguntas() {
    iaEnhanced.mostrarHistorico();
}

// Inicializar atalhos
iaEnhanced.inicializarAtalhos();
