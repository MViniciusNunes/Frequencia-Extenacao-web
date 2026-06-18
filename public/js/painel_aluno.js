// 1. Verifica quem está logado ao abrir a página
const usuarioString = sessionStorage.getItem('usuarioLogado');
if (!usuarioString) {
    window.location.href = 'login.html'; 
}

const usuarioAtivo = JSON.parse(usuarioString);
document.getElementById('boas-vindas').textContent = `Olá, ${usuarioAtivo.nome}!`;

// ==========================================
// MÁGICA DE UX: ADAPTA O BOTÃO SE FOR ADMIN
// ==========================================
const btnAcao = document.getElementById('btn-acao-topo');
if (usuarioAtivo.isAdmin === true || String(usuarioAtivo.isAdmin).toLowerCase() === "true") {
    btnAcao.textContent = 'Voltar ao Menu';
    btnAcao.className = 'editar'; 
    btnAcao.onclick = () => { window.location.href = 'menu.html'; }; 
}

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
                usuarioId: usuarioAtivo.id, 
                codigo: codigo
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("✅ " + data.mensagem);
            input.value = ''; 
            carregarMeuHistorico(); 
        } else {
            alert("❌ " + (data.erro || "Erro ao registrar presença."));
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão com o servidor.");
    }
}

// ==========================================
// FUNÇÃO 2: CARREGAR HISTÓRICO, PLACAR E MENSAGEM
// ==========================================

// Função auxiliar para formatar a data
function formatarDataExibicao(dataStr) {
    if (!dataStr) return dataStr;
    const d = dataStr.toString().substring(0, 10);
    if (d.length < 10) return dataStr;
    const [ano, mes, dia] = d.split('-');
    return `${dia}/${mes}/${ano}`;
}

async function carregarMeuHistorico() {
    try {
        const response = await fetch('/api/frequencias-completas');
        if (!response.ok) throw new Error("Falha na comunicação com o servidor.");
        
        const registros = await response.json();

        const tbody = document.getElementById('tbody-historico');
        if (!tbody) return; // Trava de segurança
        tbody.innerHTML = '';

        let totalP = 0;
        let totalF = 0;
        let totalFJ = 0;
        let totalEncontros = Object.keys(registros).length;

        Object.keys(registros).forEach(encId => {
            const enc = registros[encId];
            if (!enc || !enc.info) return;

            // Lógica Pessimista: Se o aluno não tem registro, ele ganha falta (F)
            const status = (enc.alunos && enc.alunos[usuarioAtivo.nome]) ? enc.alunos[usuarioAtivo.nome] : 'F';

            // Conta os totais para o placar superior
            if (status === 'P') totalP++;
            if (status === 'F') totalF++;
            if (status === 'FJ') totalFJ++;

            // Define a classe do CSS dependendo do status
            let classeStatus = 'status-falta'; 
            if (status === 'P') classeStatus = 'status-presenca'; 
            if (status === 'FJ') classeStatus = 'status-justificada'; 

            const dataFormatada = formatarDataExibicao(enc.info.data);
            const nomeEncontro = enc.info.nome || 'Encontro sem nome';

            tbody.innerHTML += `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${nomeEncontro}</td>
                    <td class="status-historico ${classeStatus}">${status}</td>
                </tr>
            `;
        });

        // Atualiza os números nos quadros superiores
        const elP = document.getElementById('qtd-p');
        const elF = document.getElementById('qtd-f');
        const elFJ = document.getElementById('qtd-fj');
        
        if (elP) elP.textContent = totalP;
        if (elF) elF.textContent = totalF;
        if (elFJ) elFJ.textContent = totalFJ;

        // =======================================================
        // MÁGICA DE ENGAJAMENTO: BANNER DO RETIRO
        // =======================================================
        const banner = document.getElementById('banner-retiro');
        const titulo = document.getElementById('titulo-retiro');
        const mensagem = document.getElementById('mensagem-retiro');

        if (banner && titulo && mensagem) {
            if (totalEncontros === 0) {
                banner.className = 'banner-retiro banner-vazio';
                titulo.textContent = 'Aguardando Encontros';
                mensagem.textContent = 'Ainda não tivemos nenhum encontro registrado.';
            } else {
                const presencaPorcento = ((totalEncontros - totalF) / totalEncontros) * 100;

                if (presencaPorcento >= 80) {
                    banner.className = 'banner-retiro banner-vai';
                    titulo.textContent = '🟢 Status: Vai ao Retiro';
                    mensagem.textContent = 'Parabéns, você está indo bem! Nos vemos no retiro! 🎉';
                } else if (presencaPorcento >= 75) {
                    banner.className = 'banner-retiro banner-quase';
                    titulo.textContent = '🟠 Status: Quase não vai';
                    mensagem.textContent = 'Cuidado com as faltas! Você está no limite da presença. ⚠️';
                } else {
                    banner.className = 'banner-retiro banner-nao';
                    titulo.textContent = '🔴 Status: Não vai';
                    mensagem.textContent = 'Vamos ver essas faltas e tomar cuidado. Você não quer perder o retiro, melhore sua presença! 🚨';
                }
            }
        }

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
        const banner = document.getElementById('banner-retiro');
        if (banner) {
            document.getElementById('titulo-retiro').textContent = 'Erro ao Carregar';
            document.getElementById('mensagem-retiro').textContent = 'Ocorreu um erro ao buscar os dados. Verifique a conexão.';
        }
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