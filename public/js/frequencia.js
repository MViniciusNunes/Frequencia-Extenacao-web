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

// ================== CONTAGENS (ATUALIZADAS PARA ID E ESTRUTURA NOVA) ==================
function contarFaltasPorUsuario(nome) {
    return Object.values(registros).filter(enc => enc.alunos && enc.alunos[nome] === 'F').length;
}

function contarFaltasPorEncontro(encId) {
    const enc = registros[encId];
    if (!enc || !enc.alunos) return 0;
    return Object.values(enc.alunos).filter(s => s === 'F').length;
}

// ================== RENDERIZAÇÃO INTELIGENTE ==================
function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if(!tbody) return;
    tbody.innerHTML = '';

    const termoBusca = document.getElementById('nome').value.toLowerCase().trim();
    const regexNumerico = /^(>=|<=|>|<|=)?\s*(\d+)$/;
    const matchNumerico = termoBusca.match(regexNumerico);

    const totalEncontros = Object.keys(registros).length;

    usuarios.forEach(user => {
        const faltas = contarFaltasPorUsuario(user.nome);
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
                mostrar = user.nome.toLowerCase().includes(termoBusca);
            }
        }

        if (!mostrar) return;

        // Calculadora de Elegibilidade para o Retiro
        let statusRetiro = "-";
        let corRetiro = "#888"; 

        if (totalEncontros === 0) {
            statusRetiro = "Sem encontros";
        } else {
            const presencaPorcento = ((totalEncontros - faltas) / totalEncontros) * 100;
            
            if (presencaPorcento >= 80) {
                statusRetiro = "Vai";
                corRetiro = "#1a9e5c"; 
            } else if (presencaPorcento >= 75) {
                statusRetiro = "Quase não vai";
                corRetiro = "#f57f17"; 
            } else {
                statusRetiro = "Não vai";
                corRetiro = "#dc3545"; 
            }
        }

        tbody.innerHTML += `
            <tr>
                <td>${user.nome}</td>
                <td>${faltas}</td>
                <td style="color: ${corRetiro}; font-weight: bold; text-transform: uppercase; font-size: 0.9em;">
                    ${statusRetiro}
                </td>
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

    Object.keys(registros).forEach(encId => {
        const enc = registros[encId];
        
        if (!enc || !enc.info) return;

        const dataExibicao = `${formatarDataExibicao(enc.info.data)} - ${enc.info.nome || 'Encontro'}`;
        const faltas = contarFaltasPorEncontro(encId);

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
                <td><button class="editar" onclick="abrirModalData('${encId}')">Editar</button></td>
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
        registros = await respFreq.json(); // Agora pegamos direto, sem modificar a chave (usa o ID)
        
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
let dataAtivaId = null;

function abrirModalUsuario(nome) {
    usuarioAtivo = nome;
    document.getElementById('modal-usuario-titulo').textContent = nome;
    const lista = document.getElementById('modal-usuario-lista');
    lista.innerHTML = '';

    Object.keys(registros).forEach(encId => {
        const enc = registros[encId];
        if (!enc || !enc.info) return; 
        
        const statusAtual = (enc.alunos && enc.alunos[nome]) ? enc.alunos[nome] : 'P';
        const dataExibicao = `${formatarDataExibicao(enc.info.data)} - ${enc.info.nome || 'Encontro'}`;
        
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${dataExibicao}</p>
                <select data-id="${encId}" data-original="${statusAtual}">
                    <option value="P"  ${statusAtual === 'P'  ? 'selected' : ''}>P</option>
                    <option value="F"  ${statusAtual === 'F'  ? 'selected' : ''}>F</option>
                    <option value="FJ" ${statusAtual === 'FJ' ? 'selected' : ''}>FJ</option>
                </select>
            </div>`;
    });
    document.getElementById('modalUsuario').style.display = 'block';
}

function abrirModalData(encId) {
    dataAtivaId = encId;
    const enc = registros[encId];
    if (!enc || !enc.info) return; 
    
    document.getElementById('modal-data-titulo').textContent = `${formatarDataExibicao(enc.info.data)} - ${enc.info.nome || 'Encontro'}`;
    const lista = document.getElementById('modal-data-lista');
    lista.innerHTML = '';

    usuarios.forEach(user => {
        const statusAtual = (enc.alunos && enc.alunos[user.nome]) ? enc.alunos[user.nome] : 'P';
        
        lista.innerHTML += `
            <div class="usuario-item">
                <p>${user.nome}</p>
                <select data-nome="${user.nome}" data-original="${statusAtual}">
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
    const alterados = Array.from(selects).filter(s => s.value !== s.getAttribute('data-original'));

    if (alterados.length === 0) {
        alert("Nenhuma alteração foi feita.");
        fecharModal();
        return;
    }

    const promessas = alterados.map(select => {
        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: select.getAttribute('data-nome'),
                encontroId: dataAtivaId, 
                status: select.value
            })
        });
    });

    try {
        const respostas = await Promise.all(promessas);
        const comErro = respostas.filter(r => !r.ok);
        
        if (comErro.length > 0) {
            alert("⚠️ Algumas alterações falharam! Verifique a conexão com o banco de dados.");
        } else {
            alert("Frequência da data salva com sucesso!");
        }
        
        fecharModal();
        location.reload();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao conectar com o servidor.");
    }
}

async function salvarModalUsuario() {
    const selects = document.querySelectorAll('#modal-usuario-lista select');
    const alterados = Array.from(selects).filter(s => s.value !== s.getAttribute('data-original'));

    if (alterados.length === 0) {
        alert("Nenhuma alteração foi feita.");
        fecharModal();
        return;
    }

    const promessas = alterados.map(select => {
        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: usuarioAtivo,
                encontroId: select.getAttribute('data-id'), 
                status: select.value
            })
        });
    });

    try {
        const respostas = await Promise.all(promessas);
        const comErro = respostas.filter(r => !r.ok);
        
        if (comErro.length > 0) {
            alert("⚠️ Algumas alterações falharam! Verifique a conexão com o banco de dados.");
        } else {
            alert("Frequência do aluno salva com sucesso!");
        }
        
        fecharModal();
        location.reload(); 
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao conectar com o servidor.");
    }
}