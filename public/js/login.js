function entrar() {

    const usuario =
        document
            .querySelector(
                'input[type="text"]'
            )
            .value
            .trim();

    const senha =
        document
            .querySelector(
                'input[type="password"]'
            )
            .value
            .trim();


    console.log(usuario);
    console.log(senha);


    if (
        usuario === "admin" &&
        senha === "123"
    ) {

        window.location.href =
            "menu.html";

    }

    else {

        window.location.href =
            "camera.html";

    }

}