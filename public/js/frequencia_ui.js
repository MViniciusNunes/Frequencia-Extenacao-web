const selectFiltro = document.getElementById('escolha');
const tabelaUsuarios = document.querySelector('.tabela-usuarios');
const tabelaFaltas   = document.querySelector('.tabela-faltas');

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

        let statusRetiro = "-";
        let classeRetiro = "retiro-vazio"; 

        if (totalEncontros === 0) {
            statusRetiro = "Sem encontros";
        } else {
            const presencaPorcento = ((totalEncontros - faltas) / totalEncontros) * 100;
            if (presencaPorcento >= 80) {
                statusRetiro = "Vai";
                classeRetiro = "retiro-vai"; 
            } else if (presencaPorcento >= 75) {
                statusRetiro = "Quase não vai";
                classeRetiro = "retiro-quase"; 
            } else {
                statusRetiro = "Não vai";
                classeRetiro = "retiro-nao"; 
            }
        }

        tbody.innerHTML += `
            <tr>
                <td>${user.nome}</td>
                <td>${faltas}</td>
                <td class="status-retiro ${classeRetiro}">
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

function abrirModalUsuario(nome) {
    usuarioAtivo = nome;
    document.getElementById('modal-usuario-titulo').textContent = nome;
    const lista = document.getElementById('modal-usuario-lista');
    lista.innerHTML = '';

    Object.keys(registros).forEach(encId => {
        const enc = registros[encId];
        if (!enc || !enc.info) return; 
        
        const statusAtual = (enc.alunos && enc.alunos[nome]) ? enc.alunos[nome] : 'F';
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
        const statusAtual = (enc.alunos && enc.alunos[user.nome]) ? enc.alunos[user.nome] : 'F';
        
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

if (selectFiltro) selectFiltro.addEventListener('change', atualizarTabelas);
const inputPesquisa = document.getElementById('nome');
if (inputPesquisa) inputPesquisa.addEventListener('input', atualizarTabelas);

// Dá a partida no motor!
carregarDadosIniciais();