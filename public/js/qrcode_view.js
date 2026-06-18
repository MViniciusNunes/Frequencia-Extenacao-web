function formatarData(valor) {
    if (!valor) return '';
    const [ano, mes, dia] = valor.split('-');
    return `${dia}/${mes}/${ano}`;
}

window.addEventListener('DOMContentLoaded', () => {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');

    if (!registro) {
        window.location.href = 'configurar_frequencia.html';
        return;
    }

    // CORREÇÃO: O QR Code agora tem APENAS o código puro para a câmera do aluno conseguir ler!
    const conteudoQR = registro.codigo;

    new QRCode(document.getElementById('qrcode'), {
        text: conteudoQR,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('exibir-code').textContent = registro.codigo;
    document.getElementById('qr-info-texto').textContent =
        `${registro.nome} · ${registro.tipo} · ${formatarData(registro.data)}`;
});

function voltarEditar() {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');
    if (registro) {
        sessionStorage.setItem('rascunho', JSON.stringify(registro));
        sessionStorage.removeItem('registroAtual');
    }
    // Volta sem salvar nada no banco! 
    window.location.href = 'configurar_frequencia.html';
}

// O "Concluir" é que finalmente salva no Banco de Dados!
async function concluir() {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');
    
    if (!registro) return;

    try {
        const response = await fetch('/api/encontros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });

        if (response.ok) {
            alert(`Frequência "${registro.codigo}" criada com sucesso no sistema!`);
            sessionStorage.removeItem('registroAtual');
            window.location.href = 'menu.html';
        } else {
            alert('Erro ao salvar o encontro no banco de dados.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor.');
    }
}