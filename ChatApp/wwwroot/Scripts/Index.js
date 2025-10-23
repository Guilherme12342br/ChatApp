//função que cria conexão e retorna ela para outras funções usarem.
let connection;
function conectarSignalR() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();
    return connection;
}


//função que exibe modal e recolhe o username
function modalShow() {
    let username = "";

    $('#usernameModal').modal('show');

    $('#confirmUsername').click(function () {
        const inputName = $('#modalUsername').val().trim();

        if (inputName) {
            username = inputName;
            $('#usernameModal').modal('hide');
            startChat(username);

            connection.start()
                .then(function () {
                    connection.invoke("RegisterUser", username);
                })
                .catch(function (err) {
                    console.error(err.toString());
                });

        } else {
            alert("Por favor, insira um nome");
        }

    });
}


// função que starta o chat e traz as suas funções
function startChat(username) {

    connection.on("UserJoined", function (username, color) {
        var $li = $("<li>");
        $li.html(`<span style="color:blue">Sistema</span>: ${username}entrou no chat`)
        $("#messagesList").append($li);
    });

    connection.on("UserOut", function (username, color) {
        var $li = $("<li>");
        $li.html(`<span style="color:blue">Sistema</span>: ${username} saiu do chat`)
        $("#messagesList").append($li);
    });

    connection.on("UpdateUserList", function (username) {
        const $list = $("#memberList");
        $list.empty();
        username.forEach(u => {
            $list.append($("<li>").text(u));
        });
    });

    connection.on("ReceiveMessage", function (username, message, color) {
 
        var $li = $("<li>");
        $li.html(`<span style="color:${color}">${username}</span>: ${message}`)
        $("#messagesList").append($li);
    });


    $("#sendButton").click(function () {
        const message = $("#messageInput").val().trim();

        if (username && message) {
            connection.invoke("SendMessage", username, message)
                .catch(function (err) {
                    console.error(err.toString());
                });
            $("#messageInput").val("")
        }
    });
}

//Main function
$(document).ready(function () {
    const connection = conectarSignalR();
    modalShow();
    getUserNameColor();
});