const form =
    document.querySelector(
        "form"
    );


form.addEventListener(
    "submit",

    e => {

        e.preventDefault();

        const campos =
            document
                .querySelectorAll(
                    "input"
                );

        const usuario = {

            nome:
                campos[0].value,

            email:
                campos[1].value,

            usuario:
                campos[2].value,

            senha:
                campos[3].value

        };


        fetch(
            "/api/users",

            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(
                        usuario
                    )

            }

        )

        .then(() => {

            alert(
                "Cadastro realizado"
            );

            form.reset();

        });

    }

);