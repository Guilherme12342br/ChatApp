$(document).ready(function () {
    // Criar conexão com o Hub SiganlR

    let username = "";

    $('#usernameModal').modal('show');

    $('#confirmUsername').click(function () {
        const inputName = $('#modalUsername').val().trim();

        if (inputName) {
            username = inputName;
            $('#usernameModal').modal('hide');
            startChar(username);
        } else {
            alert("Por favor, insira um nome");
        }

    });


    function startChar(user) {

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/chatHub")
            .build();

        //Quando servidor enviar mensagem
        connection.on("ReceiveMessage", function (user, message) {
            const $li = $("<li>").text(`${user}: ${message}`);
            $("#messagesList").append($li);
        });

        //Inicio conexão
        connection.start().catch(function (err) {
            console.error(err.toString());
        });

        $("#sendButton").click(function () {
            const message = $("#messageInput").val().trim();

            if (user && message) {
                connection.invoke("SendMessage", user, message)
                    .catch(function (err) {
                        console.error(err.toString());
                    });
                $("#messageInput").val("")
            }
        });
    }
});