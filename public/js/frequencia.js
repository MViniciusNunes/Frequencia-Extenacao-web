let usuarios = []; 
let registros = {}; 

const selectFiltro = document.getElementById('escolha');
const tabelaUsuarios = document.querySelector('.tabela-usuarios');
const tabelaFaltas   = document.querySelector('.tabela-faltas');

// ================== UTILITÁRIO DE DATA ==================
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

// ================== CONTAGENS ==================
function contarFaltasPorUsuario(nome) {
    return Object.values(registros).filter(dia => dia[nome] === 'F').length;
}

function contarFaltasPorData(data) {
    const dia = registros[data] || {};
    return Object.values(dia).filter(s => s === 'F').length;
}

// ================== RENDERIZAÇÃO INTELIGENTE ==================
function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if(!tbody) return;
    tbody.innerHTML = '';

    const termoBusca = document.getElementById('nome').value.toLowerCase().trim();
    
    // REGEX: Verifica se a pessoa digitou algo como ">5", "<=3" ou apenas "5"
    const regexNumerico = /^(>=|<=|>|<|=)?\s*(\d+)$/;
    const matchNumerico = termoBusca.match(regexNumerico);

    usuarios.forEach(user => {
        const faltas = contarFaltasPorUsuario(user.nome);
        let mostrar = true;

        if (termoBusca) {
            if (matchNumerico) {
                // Lógica de filtro matemático (por quantidade de faltas)
                const operador = matchNumerico[1] || '='; // Se digitar só "5", assume que é "=5"
                const valorFiltro = parseInt(matchNumerico[2], 10);
                
                if (operador === '>') mostrar = faltas > valorFiltro;
                else if (operador === '<') mostrar = faltas < valorFiltro;
                else if (operador === '>=') mostrar = faltas >= valorFiltro;
                else if (operador === '<=') mostrar = faltas <= valorFiltro;
                else if (operador === '=') mostrar = faltas === valorFiltro;
            } else {
                // Lógica de filtro normal por texto
                mostrar = user.nome.toLowerCase().includes(termoBusca);
            }
        }

        if (!mostrar) return;

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

    const termoBusca = document.getElementById('nome').value.toLowerCase().trim();
    const regexNumerico = /^(>=|<=|>|<|=)?\s*(\d+)$/;
    const matchNumerico = termoBusca.match(regexNumerico);

    Object.keys(registros).forEach(dataKey => {
        const dataExibicao = formatarDataExibicao(dataKey);
        const faltas = contarFaltasPorData(dataKey);
        let mostrar = true;

        if (termoBusca) {
            if (matchNumerico) {
                const operador = matchNumerico[1] || '=';
                const valorFiltro = parseInt(matchNumerico[2], 10);
                
                if (operador === '>') mostrar = faltas > valorFiltro;
                else if (operador === '<') mostrar = faltas < valorFiltro;
                else if (operador === '>=') mostrar = faltas >= valorFiltro;
                else if (operador === '<=') mostrar = faltas <= valorFiltro;
                else if (operador === '=') mostrar = faltas === valorFiltro;
            } else {
                mostrar = dataExibicao.toLowerCase().includes(termoBusca);
            }
        }

        if (!mostrar) return;

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
        const respUsers = await fetch('/api/users-full');
        usuarios = await respUsers.json(); 

        const respFreq = await fetch('/api/frequencias-completas');
        const rawRegistros = await respFreq.json();

        registros = {};
        Object.keys(rawRegistros).forEach(dataKey => {
            const dataNormalizada = normalizarData(dataKey);
            registros[dataNormalizada] = rawRegistros[dataKey];
        });
        
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
                data: dataAtiva, 
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
                data: select.getAttribute('data-data'), 
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