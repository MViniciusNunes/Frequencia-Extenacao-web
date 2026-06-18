// 1. Verifica quem está logado ao abrir a página
const usuarioString = sessionStorage.getItem('usuarioLogado');
if (!usuarioString) {
    // Se tentar acessar direto sem fazer login, é expulso
    window.location.href = 'login.html'; 
}

const usuarioAtivo = JSON.parse(usuarioString);
document.getElementById('boas-vindas').textContent = `Olá, ${usuarioAtivo.nome}!`;

// ==========================================
// FUNÇÃO 1: REGISTRAR PRESENÇA PELO CÓDIGO
// ==========================================
async function registrarPorCodigo() {
    const input = document.getElementById('codigo-encontro');
    const codigo = input.value.trim().toUpperCase();

    if (!codigo) {
        alert("Por favor, digite o código do encontro.");
        return;
    }

    try {
        const response = await fetch('/api/marcar-presenca', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: usuarioAtivo.id, // Envia o ID cravado do aluno logado
                codigo: codigo
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ " + data.mensagem);
            input.value = ''; // Limpa o campo
            carregarMeuHistorico(); // Atualiza a tabela imediatamente
        } else {
            alert("❌ " + (data.erro || "Erro ao registrar presença."));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão com o servidor.");
    }
}

// ==========================================
// FUNÇÃO 2: CARREGAR HISTÓRICO E PLACAR
// ==========================================
async function carregarMeuHistorico() {
    try {
        const response = await fetch(`/api/minha-frequencia/${usuarioAtivo.id}`);
        const historico = await response.json();

        const tbody = document.getElementById('tbody-historico');
        tbody.innerHTML = '';

        let totalP = 0;
        let totalF = 0;
        let totalFJ = 0;

        historico.forEach(registro => {
            // Conta os totais para o placar superior
            if (registro.status === 'P') totalP++;
            if (registro.status === 'F') totalF++;
            if (registro.status === 'FJ') totalFJ++;

            // Proteção caso o encontro original tenha sido apagado
            if (!registro.encontroId) return; 

            // Define a cor da linha dependendo do status
            let corStatus = '#224bb8';
            if (registro.status === 'P') corStatus = '#2e7d32'; // Verde
            if (registro.status === 'F') corStatus = '#c62828'; // Vermelho
            if (registro.status === 'FJ') corStatus = '#f57f17'; // Laranja

            tbody.innerHTML += `
                <tr>
                    <td>${registro.encontroId.data}</td>
                    <td>${registro.encontroId.nome}</td>
                    <td style="color: ${corStatus}; font-weight: bold; font-size: 18px;">${registro.status}</td>
                </tr>
            `;
        });

        // Atualiza os números nos quadros superiores
        document.getElementById('qtd-p').textContent = totalP;
        document.getElementById('qtd-f').textContent = totalF;
        document.getElementById('qtd-fj').textContent = totalFJ;

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

// ==========================================
// FUNÇÃO 3: SAIR (LOGOUT)
// ==========================================
function sair() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

// Inicia buscando as faltas/presenças assim que a tela abre
carregarMeuHistorico();