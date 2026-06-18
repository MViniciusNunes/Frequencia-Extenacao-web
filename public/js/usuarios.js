let listaUsuarios = [];
let usuarioEditandoId = null;

// ================= BUSCA DE DADOS =================
async function carregarUsuarios() {
    try {
        const response = await fetch('/api/users-full'); // rota que retorna todos os campos
        listaUsuarios = await response.json();

        console.log("Dados recebidos da base de dados:", listaUsuarios);

        if (!Array.isArray(listaUsuarios)) {
            console.error("Erro crítico: A resposta não é um Array válido.");
            return;
        }

        renderTabelaUsuarios();
    } catch (error) {
        console.error("Erro ao procurar utilizadores:", error);
    }
}

// ================= RENDERIZAR TABELA =================
function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    const tabelaInteira = document.querySelector('.tabela-usuarios');

    if (!tbody || !tabelaInteira) return;

    tabelaInteira.style.display = 'table';
    tbody.innerHTML = '';

    const inputNode = document.getElementById('nome');
    const termoBusca = inputNode ? inputNode.value.toLowerCase() : '';

    listaUsuarios.forEach(user => {
        if (!user || !user.nome) return;
        if (termoBusca && !user.nome.toLowerCase().includes(termoBusca)) return;

        tbody.innerHTML += `
            <tr>
                <td>${user.nome}</td>
                <td>
                    <button class="editar" onclick="abrirModalEdicao('${user._id}')">
                        Editar
                    </button>
                </td>
            </tr>`;
    });
}

// ================= GATILHO DA PESQUISA =================
const inputPesquisa = document.getElementById('nome');
if (inputPesquisa) {
    inputPesquisa.addEventListener('input', renderTabelaUsuarios);
}

// ================= MODAL DE CRIAÇÃO =================
function abrirModalCriacao() {
    document.getElementById('criar-nome').value    = '';
    document.getElementById('criar-email').value   = '';
    document.getElementById('criar-usuario').value = '';
    document.getElementById('criar-senha').value   = '';

    document.getElementById('modalCriar').style.display  = 'block';
    document.getElementById('overlay').style.display     = 'block';
}

async function criarUsuario() {
    const nome    = document.getElementById('criar-nome').value.trim();
    const email   = document.getElementById('criar-email').value.trim();
    const usuario = document.getElementById('criar-usuario').value.trim();
    const senha   = document.getElementById('criar-senha').value.trim();

    if (!nome || !email || !usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, usuario, senha })
        });

        if (response.ok) {
            alert("Usuário criado com sucesso!");
            fecharModal();
            carregarUsuarios();
        } else {
            const data = await response.json();
            alert("Erro ao criar: " + (data.error || data.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de ligação com o servidor.");
    }
}


function abrirModalEdicao(id) {
    const user = listaUsuarios.find(u => u._id === id);
    if (!user) return;

    usuarioEditandoId = id;

    document.getElementById('edit-nome').value    = user.nome    || '';
    document.getElementById('edit-email').value   = user.email   || '';
    document.getElementById('edit-usuario').value = user.usuario || '';
    document.getElementById('edit-senha').value   = '';

    document.getElementById('modalUsuario').style.display = 'block';
    document.getElementById('overlay').style.display      = 'block';
}

function fecharModal() {
    document.getElementById('modalUsuario').style.display = 'none';
    document.getElementById('modalCriar').style.display   = 'none';
    document.getElementById('overlay').style.display      = 'none';
    usuarioEditandoId = null;
}

// ================= SALVAR EDIÇÃO =================
async function salvarEdicao() {
    if (!usuarioEditandoId) return;

    const nome    = document.getElementById('edit-nome').value.trim();
    const email   = document.getElementById('edit-email').value.trim();
    const usuario = document.getElementById('edit-usuario').value.trim();
    const senha   = document.getElementById('edit-senha').value.trim();

    if (!nome || !email || !usuario) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    const payload = { nome, email, usuario };
    if (senha) payload.senha = senha; // só envia senha se foi preenchida

    try {
        const response = await fetch(`/api/users/${usuarioEditandoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Usuário atualizado com sucesso!");
            fecharModal();
            carregarUsuarios();
        } else {
            const data = await response.json();
            alert("Erro ao atualizar: " + (data.error || data.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de ligação com o servidor.");
    }
}

// ================= EXCLUIR (VIA MODAL) =================
async function confirmarExclusaoModal() {
    if (!usuarioEditandoId) return;

    const user = listaUsuarios.find(u => u._id === usuarioEditandoId);
    const nomeUsuario = user ? user.nome : 'este usuário';

    const palavraDigitada = prompt(
        `⚠ ATENÇÃO!\n\nEstás prestes a excluir permanentemente:\n"${nomeUsuario}"\n\nPara confirmar, escreve a palavra: apagar`
    );

    if (palavraDigitada === null) return;

    if (palavraDigitada.toLowerCase().trim() === 'apagar') {
        try {
            const response = await fetch(`/api/users/${usuarioEditandoId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Usuário excluído com sucesso!");
                fecharModal();
                carregarUsuarios();
            } else {
                alert("Erro ao excluir usuário no servidor.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de ligação com a base de dados.");
        }
    } else {
        alert("❌ Palavra incorreta. A exclusão foi cancelada por segurança.");
    }
}

carregarUsuarios();