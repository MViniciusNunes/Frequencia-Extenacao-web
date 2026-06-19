async function carregarDadosIniciais() {
    try {
        const respUsers = await fetch('/api/users-full');
        usuarios = await respUsers.json(); 

        const respFreq = await fetch('/api/frequencias-completas');
        registros = await respFreq.json(); 
        
        atualizarTabelas(); 
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

async function confirmarExclusaoEncontro(encId) {
    const enc = registros[encId];
    if (!enc || !enc.info) return;

    const nomeEncontro = enc.info.nome || 'Este encontro';
    const dataExibicao = formatarDataExibicao(enc.info.data);

    const palavraDigitada = prompt(
        `⚠ ATENÇÃO!\n\nVocê está prestes a excluir permanentemente o encontro:\n"${nomeEncontro} (${dataExibicao})"\n\nTodo o histórico de presenças e faltas atrelado a este dia será apagado e não poderá ser desfeito!\n\nPara confirmar, escreve a palavra: apagar`
    );

    if (palavraDigitada === null) return;

    if (palavraDigitada.toLowerCase().trim() === 'apagar') {
        const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));

        try {
            const response = await fetch(`/api/encontros/${encId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${usuarioLogado.token}` 
                }
            });

            if (response.ok) {
                alert("✅ Encontro excluído com sucesso!");
                location.reload(); 
            } else {
                alert("❌ Erro ao excluir encontro no servidor.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de conexão com o banco de dados.");
        }
    } else {
        alert("❌ Palavra incorreta. A exclusão foi cancelada por segurança.");
    }
}