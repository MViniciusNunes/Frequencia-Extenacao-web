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

    if (!usuario || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    console.log(usuario);
    console.log(senha);

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, senha })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Usuário ou senha incorretos.");
            }
            return response.json();
        })
        .then(data => {
            if (data.usuario === "admin") {
                window.location.href = "menu.html";
            } else {
                window.location.href = "menu.html";
            }
        })
        .catch(error => {
            alert(error.message);
        });
}