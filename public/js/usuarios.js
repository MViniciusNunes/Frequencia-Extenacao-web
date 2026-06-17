// =============================================
// DADOS CENTRAIS
// Adicione usuários e datas aqui conforme necessário
// =============================================

const usuarios = ['Maria', 'João', 'Vinicius'];

// Para cada data, o status de cada usuário: 'P' = Presente, 'F' = Falta, 'FJ' = Falta Justificada
const registros = {
    '15/05': { 'Maria': 'F',  'João': 'P',  'Vinicius': 'P'  },
    '18/06': { 'Maria': 'F',  'João': 'FJ', 'Vinicius': 'P'  },
    '20/06': { 'Maria': 'P',  'João': 'P',  'Vinicius': 'F'  },
};

// =============================================
// CONTROLE DAS TABELAS
// =============================================

const selectFiltro = document.getElementById('escolha');
const tabelaUsuarios = document.querySelector('.tabela-usuarios');
const tabelaFaltas   = document.querySelector('.tabela-faltas');

function contarFaltasPorUsuario(usuario) {
    return Object.values(registros).filter(dia => dia[usuario] === 'F' || dia[usuario] === 'FJ').length;
}

function contarFaltasPorData(data) {
    const dia = registros[data];
    return Object.values(dia).filter(s => s === 'F' || s === 'FJ').length;
}

function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    tbody.innerHTML = '';
    usuarios.forEach(nome => {
        const faltas = contarFaltasPorUsuario(nome);
        tbody.innerHTML += `
            <tr>
                <td>${nome}</td>
                <td>${faltas}</td>
                <td>
                    <button class="editar" onclick="abrirModalUsuario('${nome}')">Editar</button>
                </td>
            </tr>`;
    });
}

function renderTabelaFaltas() {
    const tbody = document.getElementById('tbody-faltas');
    tbody.innerHTML = '';
    Object.keys(registros).forEach(data => {
        const faltas = contarFaltasPorData(data);
        tbody.innerHTML += `
            <tr>
                <td>${data}</td>
                <td>${faltas} falta(s)</td>
                <td>
                    <button class="editar" onclick="abrirModalData('${data}')">Editar</button>
                </td>
            </tr>`;
    });
}

function atualizarTabelas() {
    tabelaUsuarios.style.display = 'none';
    tabelaFaltas.style.display   = 'none';

    if (selectFiltro.value === 'opcao1') {
        renderTabelaUsuarios();
        tabelaUsuarios.style.display = 'table';
    } else {
        renderTabelaFaltas();
        tabelaFaltas.style.display = 'table';
    }
}

selectFiltro.addEventListener('change', atualizarTabelas);
atualizarTabelas();

// =============================================
// MODAL: EDITAR FALTAS DE UM USUÁRIO
// Mostra o nome do usuário no topo e lista cada data com seu status
// =============================================

let usuarioAtivo = null;

function abrirModalUsuario(nome) {
    usuarioAtivo = nome;
    document.getElementById('modal-usuario-titulo').textContent = nome;

    const lista = document.getElementById('modal-usuario-lista');
    lista.innerHTML = '';

    Object.keys(registros).forEach(data => {
        const statusAtual = registros[data][nome];
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${data}</p>
                <select data-data="${data}" title="Status de ${data}">
                    <option ${statusAtual === 'P'  ? 'selected' : ''}>P</option>
                    <option ${statusAtual === 'F'  ? 'selected' : ''}>F</option>
                    <option ${statusAtual === 'FJ' ? 'selected' : ''}>FJ</option>
                </select>
            </div>`;
    });

    document.getElementById('modalUsuario').style.display = 'block';
}

function salvarModalUsuario() {
    const selects = document.querySelectorAll('#modal-usuario-lista select');
    selects.forEach(sel => {
        const data = sel.dataset.data;
        registros[data][usuarioAtivo] = sel.value;
    });
    fecharModal();
    atualizarTabelas();
}

// =============================================
// MODAL: EDITAR PRESENÇAS DE UMA DATA
// Mostra a data no topo e lista cada usuário com seu status naquele dia
// =============================================

let dataAtiva = null;

function abrirModalData(data) {
    dataAtiva = data;
    document.getElementById('modal-data-titulo').textContent = data;

    const lista = document.getElementById('modal-data-lista');
    lista.innerHTML = '';

    usuarios.forEach(nome => {
        const statusAtual = registros[data][nome];
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${nome}</p>
                <select data-usuario="${nome}" title="Status de ${nome}">
                    <option ${statusAtual === 'P'  ? 'selected' : ''}>P</option>
                    <option ${statusAtual === 'F'  ? 'selected' : ''}>F</option>
                    <option ${statusAtual === 'FJ' ? 'selected' : ''}>FJ</option>
                </select>
            </div>`;
    });

    document.getElementById('modalData').style.display = 'block';
}

function salvarModalData() {
    const selects = document.querySelectorAll('#modal-data-lista select');
    selects.forEach(sel => {
        const nome = sel.dataset.usuario;
        registros[dataAtiva][nome] = sel.value;
    });
    fecharModal();
    atualizarTabelas();
}

// =============================================
// FECHAR MODAIS
// =============================================

function fecharModal() {
    document.getElementById('modalUsuario').style.display = 'none';
    document.getElementById('modalData').style.display    = 'none';
    usuarioAtivo = null;
    dataAtiva    = null;
}