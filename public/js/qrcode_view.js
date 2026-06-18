
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

    const { codigo, nome, tipo, data, descr } = registro;
    const conteudoQR = `https://www.google.com`;

    new QRCode(document.getElementById('qrcode'), {
        text: conteudoQR,
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById('exibir-code').textContent = codigo;
    document.getElementById('qr-info-texto').textContent =
        `${nome} · ${tipo} · ${formatarData(data)}`;
});

function voltarEditar() {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');

    if (registro) {
        sessionStorage.setItem('rascunho', JSON.stringify(registro));

        const frequencias = JSON.parse(sessionStorage.getItem('frequencias') || '[]');
        frequencias.pop();
        sessionStorage.setItem('frequencias', JSON.stringify(frequencias));
        sessionStorage.removeItem('registroAtual');
    }

    window.location.href = 'configurar_frequencia.html';
}

function concluir() {
    const registro = JSON.parse(sessionStorage.getItem('registroAtual') || 'null');
    const frequencias = JSON.parse(sessionStorage.getItem('frequencias') || '[]');

    console.log('Frequência concluída:', registro);
    console.log('Todas as frequências:', frequencias);

    alert(`Frequência "${registro?.codigo}" salva com sucesso!`);

    sessionStorage.removeItem('registroAtual');
    window.location.href = 'configurar_frequencia.html';
}
