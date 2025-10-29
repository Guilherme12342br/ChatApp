//função que cria conexão e retorna ela para outras funções usarem.
let connection;
function conectarSignalR() {
    connection = new signalR.HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();
}


const receivedSound = document.getElementById("receivedSound");
receivedSound.volume = 0.4;

var soundOn = true; 


//função que exibe modal e recolhe o username
function modalShow() {
    let username = "";
    $("#soundInput").html('<i class="fa fa-volume-up"></i>');

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

    anexarImg(username);
    connection.on("UserJoined", function (username, color) {
        var $li = $("<li>");
        $li.html(`<span style="color:blue">Sistema</span>: ${username} entrou no chat`)
        $("#messagesList").append($li);
        scrollToBottom();
    });

    connection.on("UserOut", function (username, color) {
        var $li = $("<li>");
        $li.html(`<span style="color:blue">Sistema</span>: ${username} saiu do chat`)
        $("#messagesList").append($li);
        scrollToBottom();
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
        receivedSound.currentTime = 0;
        receivedSound.play().catch(err => console.log("Erro ao tocar som:", err));

        scrollToBottom();

    });

    connection.on("ReceiveImage", function (username, base64Image, color) {
        var $li = $("<li>");

        $li.html(`<span style="color:blue">${username}</span>:<br>
        <img src="${base64Image}" style="max-width: 200px; border-radius: 8px; margin-top: 5px;">`);

        $("#messagesList").append($li);
        receivedSound.currentTime = 0;
        receivedSound.play().catch(err => console.log("Erro ao tocar som:", err));

        scrollToBottom();
    });


    $("#sendButton").click(function () {
        sendMessage();
    });

    $("#soundInput").click(function () {
        if (soundOn) {
            receivedSound.volume = 0;
            soundOn = false;
            $(this).html('<i class="fa fa-volume-off"></i>');
        }
        else {
            soundOn = true;
            receivedSound.volume = 0.4;
            $(this).html('<i class="fa fa-volume-up"></i>');
        }
    })

    $("#messageInput").keypress(function (e) {
        if (e.which === 13) {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = $("#messageInput").val().trim();

        if (username && message) {
            connection.invoke("SendMessage", username, message)
                .catch(function (err) {
                    console.error(err.toString());
                });
            $("#messageInput").val("");
        }
    }
}

function scrollToBottom() {
    const messagesList = $("#messagesList");
    messagesList.animate({ scrollTop: messagesList.prop("scrollHeight") }, 300);
}

function anexarImg(username) {
    $("#buttonImageInput").off('click').on('click', function () {
        document.getElementById("imageInput").click();
    });


    $("#imageInput").off('change').on('change', function () {
        const file = this.files[0];
        if (!file) return;
         
        const maxSizeMb = 0.2;

        if (file.size / 1024 / 1024 > maxSizeMb) {
            alert(`Arquivo excede tamanho limite de: ${maxSizeMb * 1024}KB`);
            return;
        }

        const reader = new FileReader();


        reader.onload = function (e) {
            const base64Image = e.target.result;

            connection.invoke("SendImage", username, base64Image)
                .catch(function (err) {
                    console.error(err.toString());
                });
        };
        reader.readAsDataURL(file);
        $(this).val(null);
    });
}

$(document).ready(function () {
    conectarSignalR();
    modalShow();
});