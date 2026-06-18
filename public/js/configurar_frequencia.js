// ══════════════════════════════════════
// DADOS (array — substituir por DB futuramente)
// ══════════════════════════════════════
const frequencias = JSON.parse(sessionStorage.getItem('frequencias') || '[]');

// ──────────────────────────────────────
// Gera código único estilo "KS8596L"
// ──────────────────────────────────────
function gerarCodigo() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// ──────────────────────────────────────
// GERAR — valida, salva e vai para tela 2
// ──────────────────────────────────────
function irParaQR() {
    const nome  = document.getElementById('input-nome').value.trim();
    const tipo  = document.getElementById('input-tipo').value;
    const data  = document.getElementById('input-data').value;
    const descr = document.getElementById('input-descricao').value.trim();

    if (!nome || !tipo || !data) {
        alert('Preencha Nome, Tipo de Encontro e Data.');
        return;
    }

    const codigo = gerarCodigo();

    const registro = { codigo, nome, tipo, data, descr };
    frequencias.push(registro);

    // Persiste o array e o registro atual para a tela 2 usar
    sessionStorage.setItem('frequencias', JSON.stringify(frequencias));
    sessionStorage.setItem('registroAtual', JSON.stringify(registro));

    window.location.href = 'frequencia_qrcode.html';
}

// ──────────────────────────────────────
// CANCELAR — limpa os campos
// ──────────────────────────────────────
function cancelar() {
    document.getElementById('input-nome').value    = '';
    document.getElementById('input-tipo').value    = '';
    document.getElementById('input-data').value    = '';
    document.getElementById('input-descricao').value = '';

    window.location.href = 'menu.html';
}

// ──────────────────────────────────────
// Se voltou da tela 2 via "Editar",
// restaura os dados que estavam preenchidos
// ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    const rascunho = JSON.parse(sessionStorage.getItem('rascunho') || 'null');
    if (rascunho) {
        document.getElementById('input-nome').value    = rascunho.nome  || '';
        document.getElementById('input-tipo').value    = rascunho.tipo  || '';
        document.getElementById('input-data').value    = rascunho.data  || '';
        document.getElementById('input-descricao').value = rascunho.descr || '';
        sessionStorage.removeItem('rascunho');
    }
});
