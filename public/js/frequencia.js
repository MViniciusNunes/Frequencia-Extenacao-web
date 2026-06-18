let usuarios = []; 
let registros = {}; 

const selectFiltro = document.getElementById('escolha');
const tabelaUsuarios = document.querySelector('.tabela-usuarios');
const tabelaFaltas   = document.querySelector('.tabela-faltas');

function contarFaltasPorUsuario(nome) {
    return Object.values(registros).filter(dia => dia[nome] === 'F').length;
}

function contarFaltasPorData(data) {
    const dia = registros[data] || {};
    return Object.values(dia).filter(s => s === 'F').length;
}

function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if(!tbody) return;
    tbody.innerHTML = '';

    // Pega o que está digitado no campo de pesquisa em tempo real
    const termoBusca = document.getElementById('nome').value.toLowerCase();

    usuarios.forEach(user => {
        // Se a busca não for vazia e o nome não contiver a letra digitada, pula a criação da linha
        if (termoBusca && !user.nome.toLowerCase().includes(termoBusca)) {
            return; 
        }

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

    Object.keys(registros).forEach(data => {
        // Na visão por data, a pesquisa filtra pela data do encontro
        if (termoBusca && !data.toLowerCase().includes(termoBusca)) {
            return;
        }

        const faltas = contarFaltasPorData(data);
        tbody.innerHTML += `
            <tr>
                <td>${data}</td>
                <td>${faltas} falta(s)</td>
                <td><button class="editar" onclick="abrirModalData('${data}')">Editar</button></td>
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

async function carregarDadosIniciais() {
    try {
        const respUsers = await fetch('/api/users');
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

// Gatilho da barra de pesquisa: atualiza a tabela a cada letra digitada
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

    Object.keys(registros).forEach(data => {
        const statusAtual = registros[data][nome] || 'P';
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${data}</p>
                <select data-data="${data}">
                    <option ${statusAtual === 'P'  ? 'selected' : ''}>P</option>
                    <option ${statusAtual === 'F'  ? 'selected' : ''}>F</option>
                    <option ${statusAtual === 'FJ' ? 'selected' : ''}>FJ</option>
                </select>
            </div>`;
    });
    document.getElementById('modalUsuario').style.display = 'block';
}

function abrirModalData(data) {
    dataAtiva = data;
    document.getElementById('modal-data-titulo').textContent = data;
    const lista = document.getElementById('modal-data-lista');
    lista.innerHTML = '';

    usuarios.forEach(user => {
        const statusAtual = (registros[data] && registros[data][user.nome]) || 'P';
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${user.nome}</p>
                <select data-id="${user._id}" data-nome="${user.nome}">
                    <option value="P" ${statusAtual === 'P' ? 'selected' : ''}>P</option>
                    <option value="F" ${statusAtual === 'F' ? 'selected' : ''}>F</option>
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

// 1. Salva quando você edita a partir da visão "Por Data"
async function salvarModalData() {
    // Captura todos os <select> (caixinhas de P/F/FJ) de dentro do modal
    const selects = document.querySelectorAll('#modal-data-lista select');
    
    // Dispara a atualização no banco para cada aluno listado
    const promessas = Array.from(selects).map(select => {
        const nomeDoAluno = select.getAttribute('data-nome');
        const statusSelecionado = select.value;

        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nomeDoAluno,
                data: dataAtiva, // Usa a variável global que diz qual data estamos editando
                status: statusSelecionado
            })
        });
    });

    try {
        await Promise.all(promessas); // Espera o banco processar tudo
        alert("Frequência da data salva com sucesso!");
        fecharModal();
        location.reload(); // Recarrega a página para você ver a tabela atualizada
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao salvar as alterações.");
    }
}

// 2. Salva quando você edita a partir da visão "Por Usuário"
async function salvarModalUsuario() {
    // Captura todos os <select> de dentro do modal
    const selects = document.querySelectorAll('#modal-usuario-lista select');
    
    // Dispara a atualização no banco para cada data listada
    const promessas = Array.from(selects).map(select => {
        const dataDoEncontro = select.getAttribute('data-data');
        const statusSelecionado = select.value;

        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: usuarioAtivo, // Usa a variável global que diz qual aluno estamos editando
                data: dataDoEncontro,
                status: statusSelecionado
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