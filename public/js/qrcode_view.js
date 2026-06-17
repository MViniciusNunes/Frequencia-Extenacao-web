// ══════════════════════════════════════
// Lê o registro gerado na tela 1
// ══════════════════════════════════════

function formatarData(valor) {
    if (!valor) return '';
    const [ano, mes, dia] = valor.split('-');
    return `${dia}/${mes}/${ano}`;
}

window.addEventListener('DOMContentLoaded', () => {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');

    if (!registro) {
        // Se acessar direto sem passar pela tela 1, redireciona
        window.location.href = 'configurar_frequencia.html';
        return;
    }

    const { codigo, nome, tipo, data, descr } = registro;
    const conteudoQR = `https://www.google.com`;

    // Gera QR Code
    new QRCode(document.getElementById('qrcode'), {
        text: conteudoQR,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Exibe código e informações
    document.getElementById('exibir-code').textContent = codigo;
    document.getElementById('qr-info-texto').textContent =
        `${nome} · ${tipo} · ${formatarData(data)}`;
});

// ──────────────────────────────────────
// EDITAR — volta para tela 1 com os dados
// ──────────────────────────────────────
function voltarEditar() {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');

    if (registro) {
        // Guarda como rascunho para a tela 1 restaurar
        sessionStorage.setItem('rascunho', JSON.stringify(registro));

        // Remove o registro do array (será regerado ao clicar em Gerar)
        const frequencias = JSON.parse(sessionStorage.getItem('frequencias') || '[]');
        frequencias.pop();
        sessionStorage.setItem('frequencias', JSON.stringify(frequencias));
        sessionStorage.removeItem('registroAtual');
    }

    window.location.href = 'configurar_frequencia.html';
}

// ──────────────────────────────────────
// CONCLUIR
// ──────────────────────────────────────
function concluir() {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');
    const frequencias = JSON.parse(sessionStorage.getItem('frequencias') || '[]');

    console.log('Frequência concluída:', registro);
    console.log('Todas as frequências:', frequencias);

    alert(`Frequência "${registro?.codigo}" salva com sucesso!`);

    sessionStorage.removeItem('registroAtual');
    window.location.href = 'configurar_frequencia.html';
}
