function abrirUsuarios() {

    window.location.href =
        "usuarios.html";

}



function gerarQR() {

    alert(
        "QR Code gerado com sucesso!"
    );

}



function apagarDados() {

    const confirmar =

        confirm(
            "Tem certeza que deseja apagar todos os dados?"
        );


    if (confirmar) {

        alert(
            "Dados removidos."
        );

    }

}