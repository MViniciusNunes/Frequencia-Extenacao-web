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