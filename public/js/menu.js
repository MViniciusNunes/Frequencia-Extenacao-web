const sessaoUsuario = JSON.parse(sessionStorage.getItem('usuarioLogado') || 'null');

if (!sessaoUsuario) {
    window.location.href = 'login.html';
} 
else if (sessaoUsuario.isAdmin !== true && String(sessaoUsuario.isAdmin).toLowerCase() !== "true") {
    alert("Acesso negado. Esta página é restrita para Coordenadores.");
    window.location.href = 'painel_aluno.html';
}

function abrirUsuarios() {

    window.location.href =
        "frequencia.html";

}

function gerarQR() {

    window.location.href =
        "configurar_frequencia.html";

}


function apagarDados() {

  window.location.href =
        "usuarios.html";

}

function sair() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}