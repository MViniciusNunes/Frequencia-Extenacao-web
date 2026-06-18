let usuarios = []; 
let registros = {}; 

const selectFiltro = document.getElementById('escolha');
const tabelaUsuarios = document.querySelector('.tabela-usuarios');
const tabelaFaltas   = document.querySelector('.tabela-faltas');

// ================== UTILITÁRIO DE DATA ==================
// Normaliza qualquer formato (ISO completo ou só data) para YYYY-MM-DD
function normalizarData(dataStr) {
    if (!dataStr) return dataStr;
    // Se vier no formato ISO (ex: 2026-06-25T19:00:00Z), pega só a parte da data
    return dataStr.toString().substring(0, 10);
}

// Formata YYYY-MM-DD para DD/MM/YYYY (mais legível)
function formatarDataExibicao(dataStr) {
    const d = normalizarData(dataStr);
    if (!d || d.length < 10) return dataStr;
    const [ano, mes, dia] = d.split('-');
    return `${dia}/${mes}/${ano}`;
}

// ================== CONTAGENS ==================
function contarFaltasPorUsuario(nome) {
    return Object.values(registros).filter(dia => dia[nome] === 'F').length;
}

function contarFaltasPorData(data) {
    const dia = registros[data] || {};
    return Object.values(dia).filter(s => s === 'F').length;
}

// ================== RENDERIZAÇÃO ==================
function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if(!tbody) return;
    tbody.innerHTML = '';

    const termoBusca = document.getElementById('nome').value.toLowerCase();

    usuarios.forEach(user => {
        if (termoBusca && !user.nome.toLowerCase().includes(termoBusca)) return; 

        const faltas = contarFaltasPorUsuario(user.nome);
        tbody.innerHTML += `
            <tr>
                <td>${user.nome}</td>
                <td>${faltas}</td>
                <td><button class="editar" onclick="abrirModalUsuario('${user.nome}')">Editar</button></td>
            </tr>`;
    });
}

function renderTabelaFaltas() {
    const tbody = document.getElementById('tbody-faltas');
    if(!tbody) return;
    tbody.innerHTML = '';

    const termoBusca = document.getElementById('nome').value.toLowerCase();

    Object.keys(registros).forEach(dataKey => {
        const dataExibicao = formatarDataExibicao(dataKey);

        if (termoBusca && !dataExibicao.toLowerCase().includes(termoBusca)) return;

        const faltas = contarFaltasPorData(dataKey);
        tbody.innerHTML += `
            <tr>
                <td>${dataExibicao}</td>
                <td>${faltas} falta(s)</td>
                <td><button class="editar" onclick="abrirModalData('${dataKey}')">Editar</button></td>
            </tr>`;
    });
}

function atualizarTabelas() {
    if(!tabelaUsuarios || !tabelaFaltas) return;
    tabelaUsuarios.style.display = 'none';
    tabelaFaltas.style.display   = 'none';

    if (selectFiltro && selectFiltro.value === 'opcao1') {
        renderTabelaUsuarios();
        tabelaUsuarios.style.display = 'table';
    } else {
        renderTabelaFaltas();
        tabelaFaltas.style.display = 'table';
    }
}

// ================== CARGA DE DADOS ==================
async function carregarDadosIniciais() {
    try {
        // CORREÇÃO: Atualizado para a nova rota do backend
        const respUsers = await fetch('/api/users-full');
        usuarios = await respUsers.json(); 

        const respFreq = await fetch('/api/frequencias-completas');
        registros = await respFreq.json();       
        
        atualizarTabelas(); 
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

if (selectFiltro) {
    selectFiltro.addEventListener('change', atualizarTabelas);
}

const inputPesquisa = document.getElementById('nome');
if (inputPesquisa) {
    inputPesquisa.addEventListener('input', atualizarTabelas);
}

carregarDadosIniciais();

// ================== MODAIS ==================
let usuarioAtivo = null;
let dataAtiva = null;

function abrirModalUsuario(nome) {
    usuarioAtivo = nome;
    document.getElementById('modal-usuario-titulo').textContent = nome;
    const lista = document.getElementById('modal-usuario-lista');
    lista.innerHTML = '';

    Object.keys(registros).forEach(dataKey => {
        const statusAtual = registros[dataKey][nome] || 'P';
        const dataExibicao = formatarDataExibicao(dataKey);
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${dataExibicao}</p>
                <select data-data="${dataKey}">
                    <option value="P"  ${statusAtual === 'P'  ? 'selected' : ''}>P</option>
                    <option value="F"  ${statusAtual === 'F'  ? 'selected' : ''}>F</option>
                    <option value="FJ" ${statusAtual === 'FJ' ? 'selected' : ''}>FJ</option>
                </select>
            </div>`;
    });
    document.getElementById('modalUsuario').style.display = 'block';
}

function abrirModalData(dataKey) {
    dataAtiva = dataKey;
    document.getElementById('modal-data-titulo').textContent = formatarDataExibicao(dataKey);
    const lista = document.getElementById('modal-data-lista');
    lista.innerHTML = '';

    usuarios.forEach(user => {
        const statusAtual = (registros[dataKey] && registros[dataKey][user.nome]) || 'P';
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${user.nome}</p>
                <select data-id="${user._id}" data-nome="${user.nome}">
                    <option value="P"  ${statusAtual === 'P'  ? 'selected' : ''}>P</option>
                    <option value="F"  ${statusAtual === 'F'  ? 'selected' : ''}>F</option>
                    <option value="FJ" ${statusAtual === 'FJ' ? 'selected' : ''}>FJ</option>
                </select>
            </div>`;
    });
    document.getElementById('modalData').style.display = 'block';
}

function fecharModal() {
    document.getElementById('modalUsuario').style.display = 'none';
    document.getElementById('modalData').style.display    = 'none';
}

// ================== FUNÇÕES DE SALVAR ==================
async function salvarModalData() {
    const selects = document.querySelectorAll('#modal-data-lista select');
    
    const promessas = Array.from(selects).map(select => {
        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: select.getAttribute('data-nome'),
                data: dataAtiva, // já está normalizado (YYYY-MM-DD)
                status: select.value
            })
        });
    });

    try {
        await Promise.all(promessas);
        alert("Frequência da data salva com sucesso!");
        fecharModal();
        location.reload();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao salvar as alterações.");
    }
}

async function salvarModalUsuario() {
    const selects = document.querySelectorAll('#modal-usuario-lista select');
    
    const promessas = Array.from(selects).map(select => {
        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: usuarioAtivo,
                data: select.getAttribute('data-data'), // já normalizado
                status: select.value
            })
        });
    });

    try {
        await Promise.all(promessas);
        alert("Frequência do aluno salva com sucesso!");
        fecharModal();
        location.reload(); 
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao salvar as alterações.");
    }
}