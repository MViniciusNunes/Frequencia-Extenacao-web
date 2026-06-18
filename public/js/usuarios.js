let listaUsuarios = [];

// ================= BUSCA DE DADOS =================
async function carregarUsuarios() {
    try {
        const response = await fetch('/api/users');
        listaUsuarios = await response.json(); 
        
        // Alerta para a consola para podermos depurar (debug) se for preciso
        console.log("Dados recebidos da base de dados:", listaUsuarios); 
        
        // Proteção: Se a API falhar e não devolver uma lista, paramos aqui
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
    const tabelaInteira = document.querySelector('.tabela-usuarios'); // Busca a tabela no HTML
    
    if(!tbody || !tabelaInteira) return;
    
    // A MÁGICA AQUI: Força o CSS a mostrar a tabela na tela!
    tabelaInteira.style.display = 'table'; 
    
    tbody.innerHTML = '';

    const inputNode = document.getElementById('nome');
    const termoBusca = inputNode ? inputNode.value.toLowerCase() : '';

    listaUsuarios.forEach(user => {
        if (!user || !user.nome) {
            return; 
        }

        if (termoBusca && !user.nome.toLowerCase().includes(termoBusca)) {
            return; 
        }

        tbody.innerHTML += `
            <tr>
                <td>${user.nome}</td>
                <td>
                    <button 
                        onclick="confirmarExclusao('${user._id}', '${user.nome}')" 
                        style="background-color: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        Excluir
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

// ================= LÓGICA DE EXCLUSÃO (POP-UP) =================
async function confirmarExclusao(idUsuario, nomeUsuario) {
    const palavraDigitada = prompt(`⚠ ATENÇÃO!\n\nEstás prestes a excluir permanentemente o utilizador:\n"${nomeUsuario}"\n\nPara confirmar esta ação irreversível, escreve a palavra: apagar`);
    
    if (palavraDigitada === null) {
        return;
    }

    if (palavraDigitada.toLowerCase().trim() === 'apagar') {
        try {
            const response = await fetch(`/api/users/${idUsuario}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Utilizador excluído com sucesso!");
                carregarUsuarios(); 
            } else {
                alert("Erro ao excluir utilizador no servidor.");
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