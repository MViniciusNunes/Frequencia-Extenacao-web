async function entrar() {
    // Busca os campos de texto do seu HTML do jeito que eles estão configurados
    const inputUsuario = document.querySelector('input[type="text"]');
    const inputSenha = document.querySelector('input[type="password"]');

    const usuario = inputUsuario ? inputUsuario.value.trim() : '';
    const senha = inputSenha ? inputSenha.value.trim() : '';

    if (!usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        if (response.ok) {
            const dadosDoUsuario = await response.json();
            
            // Salva as informações de quem logou (nome, id e se é admin) na memória do navegador
            sessionStorage.setItem('usuarioLogado', JSON.stringify(dadosDoUsuario));

            // ==========================================
            // A BIFURCAÇÃO DE ACESSO (ADMIN vs ALUNO)
            // ==========================================
            if (dadosDoUsuario.isAdmin === true) {
                // Se tiver o "crachá" de administrador, vai para o Menu
                window.location.href = 'menu.html';
            } else {
                // Se for um aluno comum, vai para o Painel do Aluno
                window.location.href = 'painel_aluno.html';
            }
            
        } else {
            const erro = await response.json();
            alert(erro.error || "Usuário ou senha incorretos.");
        }
    } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro de conexão com o servidor.");
    }
}