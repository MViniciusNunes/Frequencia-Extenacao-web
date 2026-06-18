// ==========================================
// COMUNICAÇÃO COM O SERVIDOR (FETCH)
// ==========================================
async function carregarDadosIniciais() {
    try {
        const respUsers = await fetch('/api/users-full');
        usuarios = await respUsers.json(); 

        const respFreq = await fetch('/api/frequencias-completas');
        registros = await respFreq.json(); 
        
        atualizarTabelas(); // Chama a UI para desenhar a tela
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
}

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
        
        if (comErro.length > 0) alert("⚠️ Algumas alterações falharam! Verifique a conexão.");
        else alert("Frequência da data salva com sucesso!");
        
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
        
        if (comErro.length > 0) alert("⚠️ Algumas alterações falharam! Verifique a conexão.");
        else alert("Frequência do aluno salva com sucesso!");
        
        fecharModal();
        location.reload(); 
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Ocorreu um erro ao conectar com o servidor.");
    }
}