// =============================================
// DADOS
// =============================================
let usuarios = []; 
let registros = {}; 

// =============================================
// BUSCA DE DADOS (API)
// =============================================
async function carregarDadosIniciais() {
    try {
        // Busca usuários
        const respUsers = await fetch('/api/users');
        const dadosUsers = await respUsers.json();
        usuarios = dadosUsers; // Espera-se um array de objetos { _id, nome }

        // Busca frequências
        const respFreq = await fetch('/api/frequencias-completas');
        registros = await respFreq.json();
        
        atualizarTabelas();
    } catch (error) {
        console.error("Erro ao carregar dados do banco:", error);
    }
}

<<<<<<< HEAD
carregarDadosIniciais();
=======
// ──────────────────────────────────────
// GERAR — valida, salva no Banco de Dados (MongoDB) e vai para tela 2
// ──────────────────────────────────────
async function irParaQR() {
    const nome  = document.getElementById('input-nome').value.trim();
    const tipo  = document.getElementById('input-tipo').value;
    const data  = document.getElementById('input-data').value;
    const descricao = document.getElementById('input-descricao').value.trim();
>>>>>>> 49e3f97f51a50b4382a00464109a05d2d9842c87

// =============================================
// CONTROLE DAS TABELAS
// =============================================
const selectFiltro = document.getElementById('escolha');
const tabelaUsuarios = document.querySelector('.tabela-usuarios');
const tabelaFaltas   = document.querySelector('.tabela-faltas');

<<<<<<< HEAD
function contarFaltasPorUsuario(nome) {
    return Object.values(registros).filter(dia => dia[nome] === 'F').length;
=======
    const codigo = gerarCodigo();
    const registro = { codigo, nome, tipo, data, descricao };

    try {
        // Dispara os dados para a rota no back-end
        const response = await fetch('/api/encontros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registro)
        });

        if (response.ok) {
            // Guarda o registroAtual na sessão apenas para a próxima tela conseguir ler e exibir o QR Code
            sessionStorage.setItem('registroAtual', JSON.stringify(registro));
            window.location.href = 'frequencia_qrcode.html';
        } else {
            alert('Erro ao salvar o encontro no banco de dados.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão com o servidor.');
    }
>>>>>>> 49e3f97f51a50b4382a00464109a05d2d9842c87
}

function contarFaltasPorData(data) {
    const dia = registros[data] || {};
    return Object.values(dia).filter(s => s === 'F').length;
}

<<<<<<< HEAD
function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    tbody.innerHTML = '';
    usuarios.forEach(user => {
        const faltas = contarFaltasPorUsuario(user.nome);
        tbody.innerHTML += `
            <tr>
                <td>${user.nome}</td>
                <td>${faltas}</td>
                <td>
                    <button class="editar" onclick="abrirModalUsuario('${user.nome}')">Editar</button>
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
async function carregarDadosIniciais() {
    try {
        const respUsers = await fetch('/api/users');
        usuarios = await respUsers.json(); // Ajuste se necessário conforme o formato que o seu banco retorna

        const respFreq = await fetch('/api/frequencias-completas');
        registros = await respFreq.json();       
// Altere para isso no seu frequencia.js
        console.log("Dados recebidos (JSON):", JSON.stringify(registros, null, 2));        
        atualizarTabelas(); // Garante que a tabela seja montada após o recebimento
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

selectFiltro.addEventListener('change', atualizarTabelas);

// =============================================
// MODAIS
// =============================================
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

async function salvarModalData() {
    const selects = document.querySelectorAll('#modal-data-lista select');
    const promessas = Array.from(selects).map(sel => {
        return fetch('/api/atualizar-frequencia', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: sel.dataset.nome,
                data: dataAtiva,
                status: sel.value
            })
        });
    });

    await Promise.all(promessas);
    alert("Dados salvos!");
    fecharModal();
    location.reload(); 
}

function fecharModal() {
    document.getElementById('modalUsuario').style.display = 'none';
    document.getElementById('modalData').style.display    = 'none';
}
=======
// ──────────────────────────────────────
// Se voltou da tela 2 via "Editar",
// restaura os dados que estavam preenchidos
// ──────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    const rascunho = JSON.parse(sessionStorage.getItem('rascunho') || 'null');
    if (rascunho) {
        document.getElementById('input-nome').value    = rascunho.nome  || '';
        document.getElementById('input-tipo').value    = rascunho.tipo  || '';
        document.getElementById('input-data').value    = rascunho.data  || '';
        document.getElementById('input-descricao').value = rascunho.descricao || ''; // Atualizado para 'descricao'
        sessionStorage.removeItem('rascunho');
    }
});
>>>>>>> 49e3f97f51a50b4382a00464109a05d2d9842c87
