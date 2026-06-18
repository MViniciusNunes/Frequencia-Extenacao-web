const frequencias = JSON.parse(sessionStorage.getItem('frequencias') || '[]');

function gerarCodigo() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

async function irParaQR() {
    const nome  = document.getElementById('input-nome').value.trim();
    const tipo  = document.getElementById('input-tipo').value;
    const data  = document.getElementById('input-data').value;
    const descricao = document.getElementById('input-descricao').value.trim();

    if (!nome || !tipo || !data) {
        alert('Preencha Nome, Tipo de Encontro e Data.');
        return;
    }

    const codigo = gerarCodigo();
    const registro = { codigo, nome, tipo, data, descricao };

    try {
        const response = await fetch('/api/encontros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });

        if (response.ok) {
            sessionStorage.setItem('registroAtual', JSON.stringify(registro));
            window.location.href = 'frequencia_qrcode.html';
        } else {
            alert('Erro ao salvar o encontro no banco de dados.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor.');
    }
}

function cancelar() {
    document.getElementById('input-nome').value    = '';
    document.getElementById('input-tipo').value    = '';
    document.getElementById('input-data').value    = '';
    document.getElementById('input-descricao').value = '';

    window.location.href = 'menu.html';
}

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
