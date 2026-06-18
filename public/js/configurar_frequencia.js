const sessaoUsuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');

if (!sessaoUsuario) {
    window.location.href = 'login.html';
} else if (sessaoUsuario.isAdmin !== true && String(sessaoUsuario.isAdmin).toLowerCase() !== "true") {
    alert("Acesso negado. Esta página é restrita para Coordenadores.");
    window.location.href = 'painel_aluno.html';
}

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

    const dataHoje = new Date().toISOString().split('T')[0];
    if (data > dataHoje) {
        alert('❌ Não é permitido criar um encontro com uma data no futuro. Por favor, escolha a data de hoje ou uma data anterior.');
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
    const inputData = document.getElementById('input-data');
    if (inputData) {
        const dataHoje = new Date().toISOString().split('T')[0];
        inputData.setAttribute('max', dataHoje);
    }

    const rascunho = JSON.parse(sessionStorage.getItem('rascunho') || 'null');
    if (rascunho) {
        document.getElementById('input-nome').value    = rascunho.nome  || '';
        document.getElementById('input-tipo').value    = rascunho.tipo  || '';
        document.getElementById('input-data').value    = rascunho.data  || '';
        document.getElementById('input-descricao').value = rascunho.descricao || ''; 
        sessionStorage.removeItem('rascunho');
    }
});