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

// O encontro já está salvo! Os botões apenas limpam a memória e voltam pro menu.
function voltarEditar() {
    sessionStorage.removeItem('registroAtual');
    window.location.href = 'menu.html';
}

function concluir() {
    sessionStorage.removeItem('registroAtual');
    window.location.href = 'menu.html';
}