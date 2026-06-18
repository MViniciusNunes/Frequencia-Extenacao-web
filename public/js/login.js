async function entrar() {
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
            
            sessionStorage.setItem('usuarioLogado', JSON.stringify(dadosDoUsuario));

            if (dadosDoUsuario.isAdmin === true || String(dadosDoUsuario.isAdmin).toLowerCase() === "true") {
                window.location.href = 'menu.html';
            } else {
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