let listaUsuarios = [];

// ================= BUSCA DE DADOS =================
async function carregarUsuarios() {
    try {
        const response = await fetch('/api/users');
        listaUsuarios = await response.json(); 
        renderTabelaUsuarios();
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
    }
}

// ================= RENDERIZAR TABELA =================
function renderTabelaUsuarios() {
    const tbody = document.getElementById('tbody-usuarios');
    if(!tbody) return;
    tbody.innerHTML = '';

    // Pega o que está digitado na barra de pesquisa (se houver)
    const termoBusca = document.getElementById('nome').value.toLowerCase();

    listaUsuarios.forEach(user => {
        // Filtro em tempo real
        if (termoBusca && !user.nome.toLowerCase().includes(termoBusca)) {
            return; 
        }

        // Desenha a linha com o nome e o botão vermelho
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
    // Atualiza a tabela a cada letra digitada
    inputPesquisa.addEventListener('input', renderTabelaUsuarios);
}

// ================= LÓGICA DE EXCLUSÃO (POP-UP) =================
async function confirmarExclusao(idUsuario, nomeUsuario) {
    // 1. Gera o Pop-up na tela pedindo a palavra de segurança
    const palavraDigitada = prompt(`⚠ ATENÇÃO!\n\nVocê está prestes a excluir permanentemente o usuário:\n"${nomeUsuario}"\n\nPara confirmar essa ação irreversível, digite a palavra: apagar`);
    
    // 2. Se o administrador cancelar o prompt, a variável vem como 'null' e a função para
    if (palavraDigitada === null) {
        return;
    }

    // 3. Valida se a pessoa digitou exatamente "apagar" (ignorando letras maiúsculas ou espaços sobrando)
    if (palavraDigitada.toLowerCase().trim() === 'apagar') {
        try {
            // Dispara a ordem de deleção para o nosso back-end
            const response = await fetch(`/api/users/${idUsuario}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert("Usuário excluído com sucesso!");
                // Recarrega a tabela para o nome sumir da tela instantaneamente
                carregarUsuarios(); 
            } else {
                alert("Erro ao excluir usuário no servidor.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de conexão com o banco de dados.");
        }
    } else {
        // Se a pessoa digitou qualquer outra coisa, bloqueia a ação
        alert("❌ Palavra incorreta. A exclusão foi cancelada por segurança.");
    }
}

// Inicia a tela buscando todo mundo do banco de dados
carregarUsuarios();