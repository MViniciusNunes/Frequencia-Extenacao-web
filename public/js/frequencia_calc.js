let usuarios = []; 
let registros = {}; 
let usuarioAtivo = null;
let dataAtivaId = null;

function normalizarData(dataStr) {
    if (!dataStr) return dataStr;
    return dataStr.toString().substring(0, 10);
}

function formatarDataExibicao(dataStr) {
    const d = normalizarData(dataStr);
    if (!d || d.length < 10) return dataStr;
    const [ano, mes, dia] = d.split('-');
    return `${dia}/${mes}/${ano}`;
}

function contarFaltasPorUsuario(nome) {
    let faltas = 0;
    Object.keys(registros).forEach(encId => {
        const enc = registros[encId];
        if (enc && enc.info) {
            const status = (enc.alunos && enc.alunos[nome]) ? enc.alunos[nome] : 'F';
            if (status === 'F') faltas++;
        }
    });
    return faltas;
}

function contarFaltasPorEncontro(encId) {
    const enc = registros[encId];
    if (!enc || !enc.info) return 0;
    
    let faltas = 0;
    usuarios.forEach(user => {
        const status = (enc.alunos && enc.alunos[user.nome]) ? enc.alunos[user.nome] : 'F';
        if (status === 'F') faltas++;
    });
    return faltas;
}